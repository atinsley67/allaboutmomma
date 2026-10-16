import { useEffect, useState } from "react";
import type { AmazonProduct } from "./amazon";

// Loaded once per page, and only in the visual editor
let editorProducts: Promise<Record<string, AmazonProduct>> | undefined;
const liveLookups = new Map<string, Promise<AmazonProduct | null>>();

// A product added since the last build, looked up on Amazon by the site (draft mode only)
function lookUpLive(asin: string) {
  if (!liveLookups.has(asin)) {
    liveLookups.set(
      asin,
      fetch(`/api/amazon-product?asin=${encodeURIComponent(asin)}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    );
  }
  return liveLookups.get(asin);
}

/**
 * The Amazon product for an affiliate link. Published pages get it at build time (`built`, set by
 * lib/amazon). The visual editor re-queries content without it, so there it's looked up in the
 * product list the last build published, and failing that on Amazon. Undefined means "not known
 * here": in the editor, while it's being looked up, or if Amazon doesn't know it either.
 */
export function useAmazonProduct(asin: string | null, built: AmazonProduct | null | undefined) {
  const [fromEditor, setFromEditor] = useState<AmazonProduct | undefined>();

  useEffect(() => {
    setFromEditor(undefined);
    if (built !== undefined || !asin) return;
    editorProducts ??= fetch("/amazon-products.json")
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}));
    let current = true;
    editorProducts
      .then((products) => products[asin] ?? lookUpLive(asin))
      .then((product) => {
        if (current) setFromEditor(product ?? undefined);
      });
    return () => {
      current = false;
    };
  }, [asin, built]);

  return built !== undefined ? built : fromEditor;
}
