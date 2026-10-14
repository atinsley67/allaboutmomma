// Fills each TableOfContents element in a post with the post's headings at build time.
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
