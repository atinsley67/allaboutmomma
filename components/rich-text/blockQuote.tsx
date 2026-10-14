import React from "react";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { TinaMarkdownContent } from "tinacms/dist/rich-text";

export type BlockQuoteProps = {
  children: TinaMarkdownContent;
  authorName: string;
};

export const BlockQuote = (props: BlockQuoteProps) => {
  return (
    <div>
      <blockquote>
        <TinaMarkdown content={props.children} />
        {props.authorName}
      </blockquote>
    </div>
  );
};

export const blockQuoteTemplate: Template = {
  name: "BlockQuote",
  label: "Block Quote",
  fields: [
    {
      name: "children",
      label: "Quote",
      type: "rich-text",
    },
    {
      name: "authorName",
      label: "Author",
      type: "string",
    },
  ],
};
