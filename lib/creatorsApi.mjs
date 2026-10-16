// Amazon Creators API calls, shared by the build script (scripts/fetch-amazon-products.mjs) and
// the live lookups draft mode makes for products added since the last build (lib/amazon.ts).
// Plain JS so the build script can import it.
import { PARTNER_TAG } from "./asin.mjs";

const TOKEN_URL = "https://api.amazon.com/auth/o2/token"; // North America region, covers amazon.com
const GET_ITEMS_URL = "https://creatorsapi.amazon/catalog/v1/getItems";
const MARKETPLACE = "www.amazon.com";
const RESOURCES = ["images.primary.large", "itemInfo.title", "offersV2.listings.availability"];

export const BATCH_SIZE = 10; // GetItems maximum
export const INVALID = "invalid";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function hasCredentials() {
  return Boolean(process.env.AMAZON_CREATORS_CREDENTIAL_ID && process.env.AMAZON_CREATORS_CREDENTIAL_SECRET);
}

export async function getToken() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.AMAZON_CREATORS_CREDENTIAL_ID,
      client_secret: process.env.AMAZON_CREATORS_CREDENTIAL_SECRET,
      scope: "creatorsapi::default",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) {
    throw new Error(`token request failed (${res.status}): ${body.error_description || body.error || "no token"}`);
  }
  return body.access_token;
}

/**
 * GetItems for up to 10 ASINs, retrying with backoff when throttled. Returns a map of ASIN to
 * the item, or INVALID for ASINs Amazon says don't exist.
 * @param {string} token
 * @param {string[]} asins
 */
export async function getItems(token, asins) {
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
    const results = new Map();
    for (const item of body.itemsResult?.items ?? []) results.set(item.asin, item);
    // Amazon reports unknown or withdrawn ASINs as errors and leaves them out of the items
    for (const asin of asins) if (!results.has(asin)) results.set(asin, INVALID);
    return results;
  }
}

/** The parts of a GetItems item the site uses. */
export function toProduct(item) {
  return {
    url: item.detailPageURL,
    imageURL: item.images?.primary?.large?.url ?? null,
    title: item.itemInfo?.title?.displayValue ?? null,
    availability: item.offersV2?.listings?.[0]?.availability?.type ?? null,
  };
}
