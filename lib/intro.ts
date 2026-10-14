// Short text intros for post cards, generated from a post's rich-text body.

// All text inside a rich-text node, including text nested in links, bold, italics etc.
function nodeText(node): string {
  if (typeof node.text === "string") return node.text;
  return (node.children || []).map(nodeText).join("");
}

// Split a paragraph into text segments the way the original intro code did (one per
// text node, so existing card text is unchanged), except that links, which the original
// skipped, are glued onto the surrounding text so "take a [baby camping]? I" stays intact.
function paragraphSegments(paragraph): string[] {
  const segments: string[] = [];
  let glueNext = false;
  for (const child of paragraph.children || []) {
    if (typeof child.text === "string") {
      if (!child.text) continue;
      if (glueNext && segments.length) segments[segments.length - 1] += child.text;
      else segments.push(child.text);
      glueNext = false;
    } else {
      const text = nodeText(child);
      // Inline images and other text-less elements were skipped by the original code too
      if (!text) continue;
      if (segments.length) segments[segments.length - 1] += text;
      else segments.push(text);
      glueNext = true;
    }
  }
  return segments;
}

// The first `numWords` words of a post's paragraphs, for post cards
export function getIntro(body, numWords) {
  let introText = "";
  let wordCount = 0;
  for (const child of body?.children || []) {
    if (child.type !== "p") continue;
    for (const segment of paragraphSegments(child)) {
      for (const word of segment.split(/\s+/)) {
        if (wordCount >= numWords) break;
        introText = introText + " " + word;
        wordCount++;
      }
    }
  }
  return introText + "...";
}

// The generated page fragment pulls each featured post's full body; cards only need an intro
export function addFeaturedPostIntros(data, numWords) {
  data.page?.blocks?.forEach((block) => {
    if (block?.__typename === "PageBlocksFeaturedPosts") {
      block.items?.forEach((item) => {
        if (item?.post) {
          item.post.intro = getIntro(item.post._body, numWords);
          delete item.post._body;
          delete item.post.excerpt;
        }
      });
    }
  });
  return data;
}
