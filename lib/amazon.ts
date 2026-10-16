// Attaches Amazon product data to a page's content at build time, from public/amazon-products.json,
// which scripts/fetch-amazon-products.mjs writes with only the products fit to show. The visual
// editor re-queries content live and never sees this data; it loads the same file in the browser.
import fs from "fs";
import path from "path";
import { extractAsin, ASIN } from "./asin.mjs";

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

function lookup(asin: string | null | undefined): AmazonProduct | null {
  return (asin && ASIN.test(asin) && loadProducts()[asin]) || null;
}

/**
 * Walks the Tina data and sets `amazon` on each AffiliateLink and affiliate table cell: the
 * product, or null if there isn't one to show. It's never undefined on published pages, which
 * is how components tell them apart from the visual editor. Inline Amazon text links are pointed
 * at the product URL. Mutates and returns `data`.
 */
export function addAmazonData<T>(data: T): T {
  const visit = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (node.name === "AffiliateLink" && node.props) {
      node.props.amazon = lookup(node.props.asin || extractAsin(node.props.affiliateURLs?.linkURL));
    }
    if (node.affiliate && typeof node.affiliate === "object") {
      node.affiliate.amazon = lookup(node.affiliate.asin || extractAsin(node.affiliate.linkURL));
    }
    if (node.type === "a" && typeof node.url === "string") {
      const amazon = lookup(extractAsin(node.url));
      if (amazon) node.url = amazon.url;
    }

    Object.values(node).forEach(visit);
  };
  visit(data);
  return data;
}
