export function extractPosts(data) {
  const posts = data.edges.map(({ node }) => {
    const { title = null, author = null, categories = null, heroImg = null } = node || {};
    const words = extractWords(node._body);
    const intro = getIntro(node._body, 50);
    const filename = node._sys.filename
    return { title, author, categories, heroImg, words, intro, filename };
  });
  return posts;
}

// Lowercase and split on anything that isn't a letter, digit or apostrophe,
// so "stroller," and "stroller" index the same way
function toWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9']+/)
    .map((word) => word.replace(/^'+|'+$/g, ""))
    .filter((word) => word.length > 1);
}

function extractWords(node, words = new Set<string>()) {
  node.children.forEach((child) => {
    if (child.type === 'text') {
      toWords(child.text).forEach((word) => words.add(word));
    } else if (child.children) {
      extractWords(child, words);
    }
  });
  return Array.from(words);
}

export function searchPosts(posts, searchStr) {

  if(!searchStr) {
    return posts;
  }

  const searchWords = toWords(String(searchStr));
  const matchingPosts = [];

  // Loop over all posts and count number of matching words
  for (const post of posts) {
    const matchCount = post.words.reduce((count, word) => {
      return searchWords.includes(word) ? count + 1 : count;
    }, 0);

    // Only include posts with at least one matching word
    if (matchCount > 0) {
      matchingPosts.push({
        ...post,
        matchCount,
      });
    }
  }

  // Sort posts by descending match count
  matchingPosts.sort((a, b) => b.matchCount - a.matchCount);

  return matchingPosts;
}

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

export function addTOCData(props) {
  const { _body } = props.data.post;

  // Check if the body contains a single TableOfContents element or an array of them
  const tocElements = Array.isArray(_body.children) 
    ? _body.children.filter((child) => child.name === "TableOfContents") 
    : _body.children.name === "TableOfContents" 
      ? [_body.children] 
      : [];

  tocElements.forEach((tocElement) => {
    // hLevel may be stored as "2" or "H2"; anything unparseable falls back to h2
    const hLimit = parseInt(String(tocElement.props.hLevel).replace(/\D/g, "")) || 2;
    const regex = new RegExp(`^h[1-${hLimit}]$`);
    const h2Elements = _body.children.filter((child) => regex.test(child.type));

    const formattedHeadings = h2Elements.map((heading) => {
      return {
        level: parseInt(heading.type.slice(1)), // extract the H level from the type
        text: heading.children[0].text // extract the text of the heading
      };
    });

    const filteredHeadings = formattedHeadings.filter((headingData) => headingData.text);

    tocElement.props.headings = filteredHeadings;
  });

  return props;
}