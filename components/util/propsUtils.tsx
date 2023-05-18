export function extractPosts(data) {
  const posts = data.edges.map(({ node }) => {
    const { title = null, author = null, category = null, heroImg = null, excerpt = null} = node || {};
    const _body = node._body
    const words = extractWords(_body);
    const filename = node._sys.filename
    return { title, author, category, heroImg, _body, words, filename };
  });
  return posts;
}

function extractWords(node) {
  const words = [];
  node.children.forEach((child) => {
    if (child.type === 'text') {
      const text = child.text.trim().toLowerCase();
      const textWords = text.split(/\s+/);
      textWords.forEach((word) => {
        if (word.length > 1 && !words.includes(word)) {
          words.push(word);
        }
      });
    } else if (child.children) {
      const childWords = extractWords(child);
      childWords.forEach((word) => {
        if (!words.includes(word)) {
          words.push(word);
        }
      });
    }
  });
  return words;
}

export function searchPosts(posts, searchStr) {

  if(!searchStr) {
    return posts;
  }

  const searchWords = searchStr.toLowerCase().split(' ');
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

export function getIntro(body, numWords) {

    let introText = ""
    let wordCount = 0;
     body.children.every((child) => {
       if (child.type === 'p') {
           child.children.forEach((pchild) => {
               if (pchild.text) {
                const textWords = pchild.text.split(/\s+/);
                 textWords.forEach((word) => {
                       if (wordCount >= numWords) {
                        return false
                       }    
                       introText = introText + " " + word
                       wordCount++
                   });
             }
         });
       } 
       return true
     });
     return introText + "...";
}