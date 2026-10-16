import { useEffect, useState } from "react";
import type { AmazonProduct } from "./amazon";

// Loaded once per page, and only in the visual editor
let editorProducts: Promise<Record<string, AmazonProduct>> | undefined;

/**
 * The Amazon product for an affiliate link. Published pages get it at build time (`built`, set by
 * lib/amazon). The visual editor re-queries content without it, so there it's looked up in the
 * product list the last build published. Undefined means "not known here": in the editor, a
 * product added since that build.
 */
export function useAmazonProduct(asin: string | null, built: AmazonProduct | null | undefined) {
  const [fromEditorList, setFromEditorList] = useState<AmazonProduct | undefined>();

  useEffect(() => {
    setFromEditorList(undefined);
    if (built !== undefined || !asin) return;
    editorProducts ??= fetch("/amazon-products.json")
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}));
    let current = true;
    editorProducts.then((products) => {
      if (current) setFromEditorList(products[asin]);
    });
    return () => {
      current = false;
    };
  }, [asin, built]);

  return built !== undefined ? built : fromEditorList;
}
