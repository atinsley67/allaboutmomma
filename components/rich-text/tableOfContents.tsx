import React from "react";
import type { Template } from "tinacms";
import { slugify } from "../../lib/slug";

// `headings` is filled in at build time by lib/toc
export type TableOfContentsProps = {
  title: string;
  hLevel: string;
  headings: object;
};

export const TableOfContents = (props: TableOfContentsProps) => (
  <div className="my-5 border-2 border-gray-200 bg-gray-50 p-4">
    <h2 className="mt-2">{props.title}</h2>
    <ul>
      {props.headings instanceof Array &&
        props.headings.map((headingData) => {
          const linkId = slugify(headingData.text);
          return (
            <li key={headingData.text}>
              <a className="text-teal-600" href={`#${linkId}`}>{headingData.text}</a>
            </li>
          );
        })}
    </ul>
  </div>
);

export const tableOfContentsTemplate: Template = {
  name: "TableOfContents",
  label: "Table Of Contents",
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
    },
    {
      name: "hLevel",
      label: "Include headings down to",
      type: "string",
      options: [
        { label: "H2", value: "2" },
        { label: "H3", value: "3" },
        { label: "H4", value: "4" },
      ],
    },
  ],
  ui: {
    defaultItem: {
        title: "In this Article:",
        hLevel: "2",
    },
  },
};
