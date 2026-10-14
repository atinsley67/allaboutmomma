const CLOUDINARY_UPLOAD = /^https?:\/\/res\.cloudinary\.com\/([^/]+)\/image\/upload\//;

/**
 * Serve Cloudinary images over https, in the best format the browser supports
 * (f_auto, q_auto) and no wider than `width`. Leaves other URLs untouched, and
 * leaves Cloudinary URLs that already carry transformations as they are.
 */
export function cloudinaryImage(src: string | null | undefined, width?: number) {
  if (!src) return src;
  const match = src.match(CLOUDINARY_UPLOAD);
  if (!match) return src;

  const base = `https://res.cloudinary.com/${match[1]}/image/upload/`;
  const rest = src.slice(match[0].length);
  // A first path segment like "c_fill,w_300" means transformations are already set
  if (!width || /^[a-z]{1,3}_[^/]*\//.test(rest)) return base + rest;
  return `${base}f_auto,q_auto,c_limit,w_${width}/${rest}`;
}
