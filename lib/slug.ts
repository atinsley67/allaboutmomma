// Anchor ids for post headings; the table of contents links to the same ids
export function slugify(text: string) {
  return text.trim().toLowerCase().replace(/[^\w]+/g, '-');
}
