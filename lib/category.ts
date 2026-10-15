// Whether a post belongs to a category (matched by the category's filename, ignoring case)
export function isInCategory(post, categoryFilename: string) {
  const category = categoryFilename.toLowerCase();
  return post?.categories?.some((c) => c?.toLowerCase() === category) ?? false;
}
