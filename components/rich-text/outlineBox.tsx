import React from "react";
import type { Template } from "tinacms";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { TinaMarkdownContent } from "tinacms/dist/rich-text";

export type OutlineBoxProps = {
  children: TinaMarkdownContent;
};

export const OutlineBox = (props: OutlineBoxProps) => {
  return (
    <div className="my-5 px-4 border-[1px] bg-blue-gray">
      <TinaMarkdown content={props.children} />
    </div>
  )
};

export const outlineBoxTemplate: Template = {
  name: "OutlineBox",
  label: "Outline Box",
  fields: [
    {
      name: "children",
      label: "Content",
      type: "rich-text",
    },
  ],
};
