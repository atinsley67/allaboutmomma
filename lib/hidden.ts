// Posts marked "Hidden from site" are left out of the live site: their pages, post lists, search
// and the sitemap. They're shown in Vercel preview builds, in draft mode (the visual editor, and
// an editor browsing the live site after opening it) and in local development.

export const isHidden = (post: { hidden?: boolean | null } | null | undefined) => post?.hidden === true;

/** Whether hidden posts are shown on this build or request. */
export function showHidden(draftMode?: boolean) {
  return Boolean(draftMode) || process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
}

/** Takes hidden posts out of a page's Featured Posts blocks, unless they're being shown. */
export function removeHiddenFeaturedPosts(data, show: boolean) {
  if (show) return data;
  data.page?.blocks?.forEach((block) => {
    if (block?.__typename === "PageBlocksFeaturedPosts" && block.items) {
      block.items = block.items.filter((item) => !isHidden(item?.post));
    }
  });
  return data;
}

/**
 * Whether a page that wasn't generated at build time may be rendered now. Pages are only
 * generated on request in draft mode, so new posts aren't published by someone visiting their
 * address before the next build.
 */
export function mayRenderOnRequest(draftMode?: boolean) {
  return Boolean(draftMode) || process.env.NEXT_PHASE === "phase-production-build" || process.env.NODE_ENV === "development";
}
