// Refreshes Amazon product data (link, image, title, availability) for every ASIN in content/,
// via the Amazon Creators API. Runs before every build and always refetches everything, since
// Amazon expects product data to be kept fresh.
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
// It never fails the build, and it reports what changed since the last run.
//
//   node scripts/fetch-amazon-products.mjs

import fs from "node:fs";
import path from "node:path";
import { AMAZON_URL, extractAsin, PARTNER_TAG } from "../lib/asin.mjs";

const CONTENT_DIR = "content";
const CACHE_FILE = path.join(".next", "cache", "amazon-products.json");
const PUBLISHED_FILE = path.join("public", "amazon-products.json");
const TOKEN_URL = "https://api.amazon.com/auth/o2/token"; // North America region, covers amazon.com
const GET_ITEMS_URL = "https://creatorsapi.amazon/catalog/v1/getItems";
const MARKETPLACE = "www.amazon.com";
const BATCH_SIZE = 10; // GetItems maximum
const REQUEST_GAP_MS = Number(process.env.AMAZON_REQUEST_GAP_MS ?? 1100); // stay under one request per second
const RESOURCES = ["images.primary.large", "itemInfo.title", "offersV2.listings.availability"];

const GRACE_HOURS = 20;
const FALLBACK_HOURS = 72;
const OUTAGE_SHARE = 0.1;
const OUTAGE_MIN = 5; // so a handful of genuine removals on a small site isn't an outage
const HOUR = 3600 * 1000;

const ASIN_FIELD = /\basin\s*[=:]\s*["']([A-Z0-9]{10})["']/g;
const INVALID = "invalid";

for (const file of [".env.local", ".env"]) {
  if (fs.existsSync(file)) process.loadEnvFile(file);
}
const { AMAZON_CREATORS_CREDENTIAL_ID, AMAZON_CREATORS_CREDENTIAL_SECRET } = process.env;

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

async function getToken() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: AMAZON_CREATORS_CREDENTIAL_ID,
      client_secret: AMAZON_CREATORS_CREDENTIAL_SECRET,
      scope: "creatorsapi::default",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    throw new Error(`token request failed (${res.status}): ${body.error_description || body.error || "no token"}`);
  }
  return body.access_token;
}

/** GetItems for up to 10 ASINs, retrying with backoff when throttled. */
async function getItems(token, asins) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(GET_ITEMS_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "x-marketplace": MARKETPLACE },
      body: JSON.stringify({
        itemIds: asins,
        itemIdType: "ASIN",
        marketplace: MARKETPLACE,
        partnerTag: PARTNER_TAG,
        resources: RESOURCES,
      }),
    });
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await sleep(2000 * 2 ** attempt);
      continue;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`GetItems failed (${res.status}): ${JSON.stringify(body.errors ?? body).slice(0, 300)}`);
    return body;
  }
}

/**
 * Asks Amazon about every ASIN. Returns a map of ASIN to the item, or INVALID when Amazon says
 * it doesn't exist; ASINs it never got an answer for are left out, along with the error.
 */
async function fetchAll(asins) {
  const results = new Map();
  if (!(AMAZON_CREATORS_CREDENTIAL_ID && AMAZON_CREATORS_CREDENTIAL_SECRET)) {
    return { results, error: "credentials not set" };
  }
  try {
    const token = await getToken();
    for (let i = 0; i < asins.length; i += BATCH_SIZE) {
      if (i > 0) await sleep(REQUEST_GAP_MS);
      const batch = asins.slice(i, i + BATCH_SIZE);
      const body = await getItems(token, batch);
      for (const item of body.itemsResult?.items ?? []) results.set(item.asin, item);
      // Amazon reports unknown or withdrawn ASINs as errors and leaves them out of the items
      for (const asin of batch) if (!results.has(asin)) results.set(asin, INVALID);
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
 * changes worth telling someone about.
 */
function update(references, cache, { results, error }, now) {
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
      products[asin] = {
        status: "ok",
        url: result.detailPageURL,
        imageURL: result.images?.primary?.large?.url ?? null,
        title: result.itemInfo?.title?.displayValue ?? null,
        availability: result.offersV2?.listings?.[0]?.availability?.type ?? null,
        fetchedAt: nowISO,
      };
      if (previous?.status === "notFound") events.push({ type: "back", asin, files: files(asin) });
    } else if (result === INVALID && !outage && hadData(previous)) {
      const missingSince = previous.missingSince ?? nowISO;
      if (hoursSince(missingSince, now) >= GRACE_HOURS) {
        products[asin] = { status: "notFound", since: missingSince };
        events.push({ type: "gone", asin, files: files(asin) });
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
  if (error) {
    if (!state.failingSince) events.push({ type: "failing", message: error });
    state.failingSince ??= nowISO;
  } else if (state.failingSince) {
    events.push({ type: "recovered", since: state.failingSince });
    state.failingSince = null;
  }
  if (outage) {
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

function report(references, cache, events, error) {
  const products = cache.products;
  const used = [...references.entries()].map(([asin, files]) => ({ asin, files, product: products[asin] }));
  const gone = used.filter(({ product }) => product?.status === "notFound");
  const missing = used.filter(({ product }) => product?.status === "missing");
  // Often a size or colour variant rather than the whole product, so only worth a look
  const outOfStock = used.filter(({ product }) => ["OUT_OF_STOCK", "UNAVAILABLE"].includes(product?.availability));
  const rows = (items) => items.map(({ asin, files }) => `| [${asin}](https://www.amazon.com/dp/${asin}) | ${files.join(", ")} |`);

  console.log(`Amazon products: ${references.size} in content${error ? `, refresh incomplete: ${error}` : ", all refreshed"}`);
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

async function main() {
  const now = Date.now();
  const references = scanContent();
  const previous = readCache();
  console.log(
    previous.lastRunAt
      ? `Amazon: using the last good data from the run at ${previous.lastRunAt}`
      : "Amazon: no data from a previous run (first build, or the build cache was cleared)"
  );
  const fetched = await fetchAll([...references.keys()]);
  const { cache, events } = update(references, previous, fetched, now);
  cache.lastRunAt = new Date(now).toISOString();

  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 1));
  fs.writeFileSync(PUBLISHED_FILE, JSON.stringify(publishable(cache.products, now)));

  report(references, cache, events, fetched.error);
}

main().catch((error) => {
  console.warn(`Amazon: ${error.message}`);
});
