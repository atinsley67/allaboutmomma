export function extractPosts(data) {
  const posts = data.edges.map(({ node }) => {
    const { title = null, description = null, author = null, categories = null, heroImg = null } = node || {};
    const words = extractWords(node._body);
    const filename = node._sys.filename
    return { title, description, author, categories, heroImg, words, filename };
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

// The generated page fragment pulls each featured post's full body; cards only need the summary fields
export function stripFeaturedPostBodies(data) {
  data.page?.blocks?.forEach((block) => {
    if (block?.__typename === "PageBlocksFeaturedPosts") {
      block.items?.forEach((item) => {
        if (item?.post) {
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