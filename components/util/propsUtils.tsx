export function extractPosts(data) {
  const posts = data.edges.map(({ node }) => {
    const { title = null, author = null, categories = null, heroImg = null, excerpt = null} = node || {};
    const _body = node._body
    const words = extractWords(_body);
    const filename = node._sys.filename
    return { title, author, categories, heroImg, _body, words, filename };
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

export function addTOCData(props) {
  const { _body } = props.data.post;

  // Check if the body contains a single TableOfContents element or an array of them
  const tocElements = Array.isArray(_body.children) 
    ? _body.children.filter((child) => child.name === "TableOfContents") 
    : _body.children.name === "TableOfContents" 
      ? [_body.children] 
      : [];

  tocElements.forEach((tocElement) => {
    const hLimit = tocElement.props.hLevel || 2;
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