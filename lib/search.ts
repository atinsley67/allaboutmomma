// Site search: a per-post word index built at build time and matched in the browser.
import { getIntro } from "./intro";

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
