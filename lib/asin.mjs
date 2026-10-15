// Plain JS so the build script (scripts/fetch-amazon-products.mjs) can share it with the site.

// The ASIN in an Amazon product URL: /dp/B00R6XEN98, /gp/product/B00R6XEN98, etc.
const ASIN_IN_PATH = /\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/ASIN|o\/ASIN)\/([A-Z0-9]{10})(?![A-Z0-9])/;
const AMAZON_HOST = /^https?:\/\/(?:www\.|smile\.)?amazon\.com\//i;

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
