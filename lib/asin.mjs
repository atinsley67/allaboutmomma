// Plain JS so the build script (scripts/fetch-amazon-products.mjs) can share it with the site.

// The ASIN in an Amazon product URL: /dp/B00R6XEN98, /gp/product/B00R6XEN98, etc.
const ASIN_IN_PATH = /\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/ASIN|o\/ASIN)\/([A-Z0-9]{10})(?![A-Z0-9])/;
const AMAZON_HOST = /^https?:\/\/(?:www\.|smile\.)?amazon\.com\//i;

// amazon.com URLs anywhere in a block of text (markdown, MDX, an HTML snippet)
export const AMAZON_URL = /https?:\/\/(?:www\.|smile\.)?amazon\.com\/[^\s"'()<>\]\\]+/gi;

export const ASIN = /^[A-Z0-9]{10}$/;

// The site's Amazon Associates tracking ID; it's public, every affiliate link carries it
export const PARTNER_TAG = "allaboutmom06-20";

/**
 * A tagged link to a product, for when no fetched link is available.
 * @param {string} asin
 */
export function amazonProductUrl(asin) {
  return `https://www.amazon.com/dp/${asin}?tag=${PARTNER_TAG}`;
}

/**
 * The ASIN of an amazon.com product URL, or null for anything else
 * (other sites, searches, storefronts, short links).
 * @param {string | null | undefined} url
 * @returns {string | null}
 */
export function extractAsin(url) {
  if (!url || !AMAZON_HOST.test(url)) return null;
  const match = url.match(ASIN_IN_PATH);
  return match ? match[1] : null;
}

/**
 * The ASIN in whatever an editor pastes: an ASIN, a product link, or a SiteStripe HTML snippet.
 * Null if there isn't one (short amzn.to links can't be read without following them).
 * @param {string | null | undefined} text
 * @returns {string | null}
 */
export function findAsin(text) {
  const value = (text || "").trim();
  if (ASIN.test(value.toUpperCase())) return value.toUpperCase();
  for (const match of value.replace(/&amp;/g, "&").matchAll(AMAZON_URL)) {
    const asin = extractAsin(match[0]);
    if (asin) return asin;
  }
  return null;
}
