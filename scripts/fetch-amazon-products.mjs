// Refreshes Amazon product data (link, image, title, availability) for every ASIN in content/,
// via the Amazon Creators API, into .amazon-cache/products.json. Runs before each build;
// lib/amazon.ts reads the cache while pages are generated.
//
// Only ASINs that are new or older than --max-age-hours (default 23) are fetched, so a nightly
// build refreshes everything and a daytime publish fetches just the new products.
// It never fails the build: without credentials or on API errors, pages fall back to the
// link and image URLs stored in the content.
//
//   node scripts/fetch-amazon-products.mjs [--max-age-hours=23] [--force]

import fs from "node:fs";
import path from "node:path";
import { extractAsin, PARTNER_TAG } from "../lib/asin.mjs";

const CONTENT_DIR = "content";
const CACHE_FILE = path.join(".amazon-cache", "products.json");
const TOKEN_URL = "https://api.amazon.com/auth/o2/token"; // North America region, covers amazon.com
const GET_ITEMS_URL = "https://creatorsapi.amazon/catalog/v1/getItems";
const MARKETPLACE = "www.amazon.com";
const BATCH_SIZE = 10; // GetItems maximum
const REQUEST_GAP_MS = 1100; // stay under one request per second
const RESOURCES = ["images.primary.large", "itemInfo.title", "offersV2.listings.availability"];

const AMAZON_URL = /https?:\/\/(?:www\.|smile\.)?amazon\.com\/[^\s"'()<>\]\\]+/gi;
const ASIN_FIELD = /\basin\s*[=:]\s*["']([A-Z0-9]{10})["']/g;

const args = process.argv.slice(2);
const force = args.includes("--force");
const maxAgeHours = Number(args.find((a) => a.startsWith("--max-age-hours="))?.split("=")[1] ?? 23);

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
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")).products ?? {};
  } catch {
    return {};
  }
}

function writeCache(products) {
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify({ products }, null, 1));
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

function report(lines) {
  const text = lines.join("\n");
  console.log(text);
  // Shows on the GitHub Actions run page when the build runs there
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${text}\n`);
}

async function main() {
  const references = scanContent();
  const cached = readCache();
  // Keep only ASINs the content still uses
  const products = Object.fromEntries([...references.keys()].filter((a) => cached[a]).map((a) => [a, cached[a]]));

  const staleBefore = Date.now() - maxAgeHours * 3600 * 1000;
  const toFetch = [...references.keys()].filter(
    (asin) => force || !products[asin] || Date.parse(products[asin].fetchedAt) < staleBefore
  );
  console.log(`Amazon products: ${references.size} in content, ${toFetch.length} to fetch`);

  if (toFetch.length && !(AMAZON_CREATORS_CREDENTIAL_ID && AMAZON_CREATORS_CREDENTIAL_SECRET)) {
    console.warn("Amazon: credentials not set, skipping the refresh; pages use cached or stored URLs");
  } else if (toFetch.length) {
    try {
      const token = await getToken();
      for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
        if (i > 0) await sleep(REQUEST_GAP_MS);
        const batch = toFetch.slice(i, i + BATCH_SIZE);
        const body = await getItems(token, batch);
        const fetchedAt = new Date().toISOString();
        const returned = new Set();
        for (const item of body.itemsResult?.items ?? []) {
          returned.add(item.asin);
          products[item.asin] = {
            status: "ok",
            url: item.detailPageURL,
            imageURL: item.images?.primary?.large?.url ?? null,
            title: item.itemInfo?.title?.displayValue ?? null,
            availability: item.offersV2?.listings?.[0]?.availability?.type ?? null,
            fetchedAt,
          };
        }
        // Amazon reports unknown or withdrawn ASINs as errors and leaves them out of the items
        for (const asin of batch.filter((a) => !returned.has(a))) {
          products[asin] = { status: "notFound", fetchedAt };
        }
      }
    } catch (error) {
      // Whatever was fetched before the failure is kept; the rest stays as it was
      console.warn(`Amazon: refresh stopped early, ${error.message}`);
    }
  }

  writeCache(products);

  const used = [...references.entries()].map(([asin, files]) => ({ asin, files, product: products[asin] }));
  const gone = used.filter(({ product }) => product?.status === "notFound");
  // Often a size or colour variant rather than the whole product, so only worth a look
  const outOfStock = used.filter(({ product }) => ["OUT_OF_STOCK", "UNAVAILABLE"].includes(product?.availability));
  const rows = (items) => items.map(({ asin, files }) => `| [${asin}](https://www.amazon.com/dp/${asin}) | ${files.join(", ")} |`);
  if (gone.length || outOfStock.length) {
    report([
      `### Amazon products no longer on Amazon (${gone.length})`,
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
    ]);
  }
}

main().catch((error) => {
  console.warn(`Amazon: ${error.message}`);
});
