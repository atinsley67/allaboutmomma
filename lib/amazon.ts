// Attaches Amazon product data to a page's content, from public/amazon-products.json, which
// scripts/fetch-amazon-products.mjs writes at build time with only the products fit to show.
// In draft mode, products added since the last build are looked up on Amazon live. The visual
// editor re-queries content and never sees this data; it loads the same file in the browser.
import fs from "fs";
import path from "path";
import { extractAsin, ASIN } from "./asin.mjs";
import { BATCH_SIZE, INVALID, getItems, getToken, hasCredentials, toProduct } from "./creatorsApi.mjs";

export type AmazonProduct = {
  url: string;
  imageURL: string | null;
  title: string | null;
};

let products: Record<string, AmazonProduct> | undefined;

function loadProducts() {
  if (!products) {
    try {
      const file = path.join(process.cwd(), "public", "amazon-products.json");
      products = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch {
      products = {};
    }
  }
  return products;
}

// Looked up live in draft mode, kept for as long as the server stays up (null: not on Amazon)
const liveProducts = new Map<string, AmazonProduct | null>();
let liveToken: { value: Promise<string>; expires: number } | undefined;

function amazonToken() {
  // Tokens last an hour; get a new one a little early
  if (!liveToken || liveToken.expires < Date.now()) {
    liveToken = { value: getToken(), expires: Date.now() + 50 * 60 * 1000 };
    liveToken.value.catch(() => (liveToken = undefined));
  }
  return liveToken.value;
}

/** Looks up on Amazon any of these ASINs the last build didn't fetch. */
export async function lookUpNewProducts(asins: string[]) {
  const known = loadProducts();
  const missing = Array.from(new Set(asins)).filter((asin) => ASIN.test(asin) && !known[asin] && !liveProducts.has(asin));
  if (!missing.length || !hasCredentials()) return;
  try {
    const token = await amazonToken();
    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
      const results = await getItems(token, missing.slice(i, i + BATCH_SIZE));
      results.forEach((result, asin) => {
        const product = result === INVALID ? null : toProduct(result);
        liveProducts.set(asin, product && { url: product.url, imageURL: product.imageURL, title: product.title });
      });
    }
  } catch (error) {
    console.warn(`Amazon: live lookup failed, ${error.message}`);
  }
}

export function getProduct(asin: string | null | undefined): AmazonProduct | null {
  if (!asin || !ASIN.test(asin)) return null;
  return loadProducts()[asin] || liveProducts.get(asin) || null;
}

/** Calls `visit` with each AffiliateLink, affiliate table cell and inline link in Tina data. */
function forEachAmazonItem(data: unknown, visit: (kind: "link" | "cell" | "anchor", node: any, asin: string | null) => void) {
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (node.name === "AffiliateLink" && node.props) {
      visit("link", node.props, node.props.asin || extractAsin(node.props.affiliateURLs?.linkURL));
    }
    if (node.affiliate && typeof node.affiliate === "object") {
      visit("cell", node.affiliate, node.affiliate.asin || extractAsin(node.affiliate.linkURL));
    }
    if (node.type === "a" && typeof node.url === "string") {
      visit("anchor", node, extractAsin(node.url));
    }
    Object.values(node).forEach(walk);
  };
  walk(data);
}

/** Every ASIN the content refers to. */
export function amazonAsins(data: unknown) {
  const asins: string[] = [];
  forEachAmazonItem(data, (_kind, _node, asin) => asin && asins.push(asin));
  return asins;
}

/**
 * Sets `amazon` on each AffiliateLink and affiliate table cell: the product, or null if there
 * isn't one to show. It's never undefined on published pages, which is how components tell them
 * apart from the visual editor. Inline Amazon text links are pointed at the product URL.
 * Mutates and returns `data`.
 */
export function addAmazonData<T>(data: T): T {
  forEachAmazonItem(data, (kind, node, asin) => {
    const product = getProduct(asin);
    if (kind === "anchor") {
      if (product) node.url = product.url;
    } else {
      node.amazon = product;
    }
  });
  return data;
}
