import type { Template } from "tinacms";
import { TableInput } from "../fields/table";

// Kept apart from the Table renderer: TableInput uses Tina's admin package, which only the
// Tina config may import. Page bundles import the renderer and must not load it.
export const tableTemplate: Template = {
  name: "Table",
  label: "Table",
  fields: [
    {
      name: "data",
      label: "Table",
      type: "object",
      ui: {
        // wrapFieldsWithMeta's return type doesn't line up with object-field components; TableInput only reads `input`
        component: TableInput as any,
      },
      fields: [
        {
          name: "headers",
          label: "Column Headers",
          type: "object",
          list: true,
          fields: [{
              name: "content",
              type: "string",
            }
          ]
        },
        {
          name: "rows",
          label: "Rows",
          type: "object",
          list: true,
          fields: [
            {
              name: "cells",
              label: "Cells",
              type: "object",
              list: true,
              fields: [
                {
                  name: "content",
                  label: "Content",
                  type: "string",
                  ui: {
                    component: "textarea",
                  }
                },
                {
                  name: "affiliate",
                  label: "Affiliate Snippet",
                  type: "object",
                  fields: [
                    {
                      name: "asin",
                      type: "string",
                    },
                    {
                      name: "linkURL",
                      type: "string",
                    },
                    {
                      name: "imageURL",
                      type: "string",
                    },
                    {
                      name: "caption",
                      type: "string",
                    }
                  ],
                },
              ],
            }
          ]
        },
  ]}
  ],
};
