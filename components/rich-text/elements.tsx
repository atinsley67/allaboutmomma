// Renderers for standard markdown elements (code, headings, links); images are in ./images
import React from "react";
import { Prism } from "tinacms/dist/rich-text/prism";
import { slugify } from "../../lib/slug";

export const CodeBlock = (props) => <Prism {...props} />;

function getTextContentForId(element) {
  if (element && element.props && element.props.content) {
    const textContent = element.props.content.map(c => c.text).join('');
    return slugify(textContent);
  } else if (typeof element === 'string') {
    return slugify(element);
  } else if (element && element.props && element.props.children) {
    const childElement = React.Children.only(element.props.children);
    if (childElement && typeof childElement === 'string') {
      return slugify(childElement);
    } else {
      return 'no_id'
    }
  } else {
    return 'no_id'
  }
}

// Headings get ids so the table of contents can link to them
export const H1 = (props) => <h1 id={getTextContentForId(props.children)}>{props.children}</h1>;
export const H2 = (props) => <h2 id={getTextContentForId(props.children)}>{props.children}</h2>;
export const H3 = (props) => <h3 id={getTextContentForId(props.children)}>{props.children}</h3>;
export const H4 = (props) => <h4 id={getTextContentForId(props.children)}>{props.children}</h4>;

export type PostLinkProps = {
  url: string;
  children: any;
};

export const PostLink = (props: PostLinkProps) => {
  const isAffiliate = /amazon\.com\/|amzn\.to\//.test(props.url || "");
  return (
    <a
      href={props.url}
      className="font-bold"
      rel={isAffiliate ? "sponsored nofollow noopener" : undefined}
    >
      {props.children}
    </a>
  );
};
