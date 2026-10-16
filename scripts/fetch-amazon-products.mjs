// Refreshes Amazon product data (link, image, title, availability) for every ASIN in content/,
// via the Amazon Creators API. Runs before every build and refetches everything, since Amazon
// expects product data to be kept fresh. The exception is a build within RECENT_HOURS of a full
// refresh (say, promoting a preview just built): that only fetches products added since.
//
// The last good data for each product is kept in .next/cache/amazon-products.json (Vercel keeps
// .next/cache between builds) and is what pages fall back to when Amazon misbehaves:
// - a request that fails keeps the last good data;
// - a product that suddenly comes back invalid keeps it too, and only counts as gone if it's
//   still invalid GRACE_HOURS later (real removals are permanent, glitches aren't);
// - if more than OUTAGE_SHARE of good products come back invalid in one run, it's treated as an
//   Amazon problem and nothing is marked missing;
// - data older than FALLBACK_HOURS is no longer shown, leaving a plain tagged link.
// What's fit to show is written to public/amazon-products.json, which lib/amazon.ts reads while
// pages are generated and the visual editor loads in the browser.
//
// It never fails the build. It reports what changed since the last run in the build log, and
// production builds email the changes (see sendAlerts).
//
//   node scripts/fetch-amazon-products.mjs [--test-email]

import fs from "node:fs";
import path from "node:path";
import { AMAZON_URL, extractAsin } from "../lib/asin.mjs";
import { BATCH_SIZE, INVALID, getItems, getToken, hasCredentials, toProduct } from "../lib/creatorsApi.mjs";

const CONTENT_DIR = "content";
const CACHE_FILE = path.join(".next", "cache", "amazon-products.json");
const PUBLISHED_FILE = path.join("public", "amazon-products.json");
const REQUEST_GAP_MS = Number(process.env.AMAZON_REQUEST_GAP_MS ?? 1100); // stay under one request per second

const GRACE_HOURS = 20;
const FALLBACK_HOURS = 72;
const OUTAGE_SHARE = 0.1;
const OUTAGE_MIN = 5; // so a handful of genuine removals on a small site isn't an outage
const RECENT_HOURS = 1;
const HOUR = 3600 * 1000;

const ASIN_FIELD = /\basin\s*[=:]\s*["']([A-Z0-9]{10})["']/g;

for (const file of [".env.local", ".env"]) {
  if (fs.existsSync(file)) process.loadEnvFile(file);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Every ASIN referenced in content/, with the files that reference it. */
function scanContent() {
  const files = new Map();
  for (const entry of fs.readdirSync(CONTENT_DIR, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !/\.(mdx?|json)$/.test(entry.name)) continue;
    const file = path.join(entry.parentPath, entry.name);
    const text = fs.readFileSync(file, "utf8");
    const asins = new Set([
      ...[...text.matchAll(AMAZON_URL)].map((m) => extractAsin(m[0])),
      ...[...text.matchAll(ASIN_FIELD)].map((m) => m[1]),
    ]);
    for (const asin of asins) {
      if (!asin) continue;
      if (!files.has(asin)) files.set(asin, []);
      files.get(asin).push(path.relative(CONTENT_DIR, file).replaceAll("\\", "/"));
    }
  }
  return files;
}

function readCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return {};
  }
}

/**
 * Asks Amazon about every ASIN. Returns a map of ASIN to the item, or INVALID when Amazon says
 * it doesn't exist; ASINs it never got an answer for are left out, along with the error.
 */
async function fetchAll(asins) {
  const results = new Map();
  if (!hasCredentials()) return { results, error: "credentials not set" };
  try {
    const token = await getToken();
    for (let i = 0; i < asins.length; i += BATCH_SIZE) {
      if (i > 0) await sleep(REQUEST_GAP_MS);
      const batch = await getItems(token, asins.slice(i, i + BATCH_SIZE));
      for (const [asin, result] of batch) results.set(asin, result);
    }
    return { results, error: null };
  } catch (error) {
    return { results, error: error.message };
  }
}

const hoursSince = (iso, now) => (iso ? (now - Date.parse(iso)) / HOUR : Infinity);
const hadData = (product) => product?.status === "ok" || product?.status === "missing";

/**
 * Works out each product's new state from the last run's and this run's answers, and the
 * changes worth telling someone about. A `partial` run only asked about new products, so it
 * says nothing about whether Amazon is failing or misbehaving overall.
 */
function update(references, cache, { results, error }, now, { partial = false } = {}) {
  const nowISO = new Date(now).toISOString();
  const before = cache.products ?? {};
  // Without a previous run (first build, or the build cache was cleared) there's nothing to
  // compare with, so products are recorded without reporting each one as a change
  const baseline = !cache.products;
  const products = {};
  const events = [];
  const files = (asin) => references.get(asin);

  const hadDataBefore = [...references.keys()].filter((asin) => hadData(before[asin]));
  const newlyInvalid = hadDataBefore.filter((asin) => results.get(asin) === INVALID && before[asin].status === "ok");
  const outage = newlyInvalid.length > Math.max(OUTAGE_MIN, hadDataBefore.length * OUTAGE_SHARE);

  for (const asin of references.keys()) {
    const previous = before[asin];
    const result = results.get(asin);

    if (result && result !== INVALID) {
      products[asin] = { status: "ok", ...toProduct(result), fetchedAt: nowISO };
      if (previous?.status === "notFound") events.push({ type: "back", asin, files: files(asin), title: products[asin].title });
    } else if (result === INVALID && !outage && hadData(previous)) {
      const missingSince = previous.missingSince ?? nowISO;
      if (hoursSince(missingSince, now) >= GRACE_HOURS) {
        // The title is kept so alerts can say what the product was
        products[asin] = { status: "notFound", since: missingSince, title: previous.title ?? null };
        events.push({ type: "gone", asin, files: files(asin), title: previous.title ?? null });
      } else {
        products[asin] = { ...previous, status: "missing", missingSince };
      }
    } else if (result === INVALID && !outage && !previous) {
      // A product added since the last run that Amazon has never heard of: likely a typo
      products[asin] = { status: "notFound", since: nowISO };
      if (!baseline) events.push({ type: "gone", asin, files: files(asin), isNew: true });
    } else {
      // No answer, already gone, or an outage: keep what we had
      if (previous) products[asin] = previous;
    }
  }

  // Problems that last are reported when they start and when they end, not every run
  const state = { failingSince: cache.failingSince ?? null, outageSince: cache.outageSince ?? null, expired: cache.expired ?? 0 };
  if (partial) {
    // Left as they were
  } else if (error) {
    if (!state.failingSince) events.push({ type: "failing", message: error });
    state.failingSince ??= nowISO;
  } else if (state.failingSince) {
    events.push({ type: "recovered", since: state.failingSince });
    state.failingSince = null;
  }
  if (partial) {
    // Left as they were
  } else if (outage) {
    if (!state.outageSince) events.push({ type: "outage", count: newlyInvalid.length, of: hadDataBefore.length });
    state.outageSince ??= nowISO;
  } else if (state.outageSince && !error) {
    events.push({ type: "outageOver", since: state.outageSince });
    state.outageSince = null;
  }

  // Reported whenever more products lose their images, not each run they stay that way
  const expired = Object.entries(products).filter(
    ([, p]) => hadData(p) && hoursSince(p.fetchedAt, now) >= FALLBACK_HOURS
  ).length;
  if (expired > state.expired) events.push({ type: "expired", count: expired });
  state.expired = expired;

  return { cache: { products, ...state }, events };
}

/** The products fit to show on pages: answered by Amazon recently enough. */
function publishable(products, now) {
  return Object.fromEntries(
    Object.entries(products)
      .filter(([, p]) => hadData(p) && p.url && hoursSince(p.fetchedAt, now) < FALLBACK_HOURS)
      .map(([asin, { url, imageURL, title }]) => [asin, { url, imageURL, title }])
  );
}

function describe(event) {
  const where = event.files?.join(", ");
  switch (event.type) {
    case "gone":
      return `- ${event.asin} ${event.isNew ? "was just added but isn't on Amazon (typo?)" : "is no longer on Amazon"}: ${where}`;
    case "back":
      return `- ${event.asin} is back on Amazon: ${where}`;
    case "failing":
      return `- Amazon refresh failing (${event.message}); pages show the last good data for up to ${FALLBACK_HOURS} hours`;
    case "recovered":
      return `- Amazon refresh working again (failing since ${event.since})`;
    case "outage":
      return `- ${event.count} of ${event.of} products suddenly reported invalid; treated as an Amazon problem, keeping the last good data`;
    case "outageOver":
      return `- Amazon is answering normally again (problem since ${event.since})`;
    case "expired":
      return `- ${event.count} products have had no fresh data for ${FALLBACK_HOURS} hours and now show a plain link without an image`;
  }
}

function report(references, cache, events, summary) {
  const products = cache.products;
  const used = [...references.entries()].map(([asin, files]) => ({ asin, files, product: products[asin] }));
  const gone = used.filter(({ product }) => product?.status === "notFound");
  const missing = used.filter(({ product }) => product?.status === "missing");
  // Often a size or colour variant rather than the whole product, so only worth a look
  const outOfStock = used.filter(({ product }) => ["OUT_OF_STOCK", "UNAVAILABLE"].includes(product?.availability));
  const rows = (items) => items.map(({ asin, files }) => `| [${asin}](https://www.amazon.com/dp/${asin}) | ${files.join(", ")} |`);

  console.log(`Amazon products: ${references.size} in content, ${summary}`);
  if (events.length) console.log(["### Changes since the last run", "", ...events.map(describe), ""].join("\n"));
  if (missing.length) {
    console.log(`${missing.length} products reported invalid but within the ${GRACE_HOURS}-hour grace period: ${missing.map((m) => m.asin).join(", ")}`);
  }
  if (gone.length || outOfStock.length) {
    console.log(
      [
        `### Products no longer on Amazon (${gone.length})`,
        "",
        "| ASIN | Used in |",
        "| --- | --- |",
        ...rows(gone),
        "",
        `<details><summary>Out of stock (${outOfStock.length}), often just some sizes or colours</summary>`,
        "",
        "| ASIN | Used in |",
        "| --- | --- |",
        ...rows(outOfStock),
        "",
        "</details>",
      ].join("\n")
    );
  }
}

// Alert emails, sent through Resend (resend.com) by production builds when something changed.
// RESEND_API_KEY and ALERT_EMAILS (comma-separated) turn them on. Until allaboutmomma.com is
// verified in Resend, they come from Resend's test sender, which only reaches the Resend account's
// own address.
const SITE_URL = "https://allaboutmomma.com";
const ALERT_FROM = process.env.ALERT_FROM || "All About Momma <onboarding@resend.dev>";
const MAX_PENDING_ALERTS = 100;
const COLLECTIONS = { posts: "post", pages: "page", categories: "category" };

// "posts/best-travel-crib.mdx" → a line linking to it in the editor
function editLink(file) {
  const [folder, name] = file.split("/");
  const filename = name.replace(/\.mdx?$/, "");
  return `  - ${filename}: ${SITE_URL}/admin#/collections/edit/${COLLECTIONS[folder] ?? folder}/${filename}`;
}

function alertEmail(alerts) {
  const gone = alerts.filter((a) => a.type === "gone");
  const back = alerts.filter((a) => a.type === "back");
  const problems = alerts.filter((a) => ["failing", "outage", "expired"].includes(a.type));
  const lines = [];

  if (gone.length) {
    lines.push("These products need replacing:", "");
    for (const a of gone) {
      const name = a.title ? `${a.title.slice(0, 90)} (ASIN ${a.asin})` : `ASIN ${a.asin}`;
      lines.push(`• ${name}`);
      lines.push(a.isNew ? "  Just added, but Amazon doesn't recognise it. Check the ASIN." : "  No longer on Amazon.");
      lines.push("  Used in:", ...a.files.map(editLink), "");
    }
    lines.push(`Until they're replaced, they show a plain "Check Amazon Price" button with no image.`, "");
  }
  if (back.length) {
    lines.push("Back on Amazon (nothing to do):", ...back.map((a) => `• ${a.title ?? `ASIN ${a.asin}`}`), "");
  }
  const other = alerts.filter((a) => !["gone", "back"].includes(a.type));
  if (other.length) {
    lines.push("Amazon refresh:", ...other.map((a) => `• ${describe(a).replace(/^- /, "")} (${a.at})`), "");
  }
  lines.push("Sent by the site's build when something changes with its Amazon products.");

  const subject = gone.length
    ? `All About Momma: ${gone.length} Amazon product${gone.length === 1 ? "" : "s"} to replace`
    : problems.length
      ? "All About Momma: problem refreshing Amazon products"
      : "All About Momma: Amazon products update";
  return { subject, text: lines.join("\n") };
}

/** Emails the alerts; true if they were sent. */
async function sendAlerts(alerts) {
  const to = (process.env.ALERT_EMAILS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (!process.env.RESEND_API_KEY || !to.length) {
    console.warn(`Amazon: ${alerts.length} change(s) to email, but RESEND_API_KEY or ALERT_EMAILS isn't set`);
    return false;
  }
  const { subject, text } = alertEmail(alerts);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: ALERT_FROM, to, subject, text }),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    console.log(`Amazon: emailed ${alerts.length} change(s) to ${to.join(", ")}`);
    return true;
  } catch (error) {
    // Kept for the next production build to try again
    console.warn(`Amazon: alert email failed, ${error.message}`);
    return false;
  }
}

async function main() {
  // `--test-email` sends a sample alert, to check the email settings
  if (process.argv.includes("--test-email")) {
    const at = new Date().toISOString();
    await sendAlerts([
      { type: "gone", asin: "B00AKKDSNG", title: "Guava Lotus Travel Crib (sample)", files: ["posts/best-travel-crib.mdx"], at },
      { type: "failing", message: "sample problem", at },
    ]);
    return;
  }

  const now = Date.now();
  const references = scanContent();
  const previous = readCache();
  const all = [...references.keys()];

  // A full refresh that worked under RECENT_HOURS ago is fresh enough; just fetch what's new
  const recent = hoursSince(previous.lastRefreshAt, now) < RECENT_HOURS;
  const toFetch = recent ? all.filter((asin) => !previous.products?.[asin]) : all;
  if (recent) {
    console.log(`Amazon: products were refreshed at ${previous.lastRefreshAt}, under ${RECENT_HOURS} hour ago; fetching only the ${toFetch.length} added since`);
  } else if (previous.products) {
    console.log(`Amazon: last run's data found (from ${previous.lastRunAt ?? "an earlier build"}), kept as a fallback; refreshing all ${all.length} products`);
  } else {
    console.log(`Amazon: no data from a previous run (first build, or the build cache was cleared); fetching all ${all.length} products`);
  }

  const fetched = await fetchAll(toFetch);
  const { cache, events } = update(references, previous, fetched, now, { partial: recent });
  const nowISO = new Date(now).toISOString();
  cache.lastRunAt = nowISO;
  // Only a complete, normal refresh counts as recent for the next build
  cache.lastRefreshAt = !recent && !fetched.error && !cache.outageSince ? nowISO : previous.lastRefreshAt ?? null;

  const summary = fetched.error
    ? `refresh incomplete: ${fetched.error}`
    : recent
      ? `${toFetch.length} new fetched, the rest refreshed at ${previous.lastRefreshAt}`
      : "all refreshed";

  // Changes wait here until a production build emails them, so a preview build never uses one up
  cache.pendingAlerts = [...(previous.pendingAlerts ?? []), ...events.map((e) => ({ ...e, at: nowISO }))].slice(
    -MAX_PENDING_ALERTS
  );
  if (process.env.VERCEL_ENV === "production" && cache.pendingAlerts.length) {
    if (await sendAlerts(cache.pendingAlerts)) cache.pendingAlerts = [];
  }

  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1));
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(publishable(cache.products, now)));

  report(references, cache, events, summary);
}

main().catch((error) => {
  console.warn(`Amazon: ${error.message}`);
});
