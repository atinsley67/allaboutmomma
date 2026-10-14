import * as React from "react";
import { tinaField } from "tinacms/dist/react";
import { Actions } from "../util/actions";
import { Container } from "../util/container";
import { Section } from "../util/section";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { cloudinaryImage } from "../util/cloudinary";
import type { TinaTemplate } from "tinacms";

export const Hero = ({ data }) => {
  return (
    <Section color={data.color}>
      <Container
        size="medium"
      >
        <div
          data-tina-field={tinaField(data, "image")}
          className="relative"
        >
          {data.image && (
          <>
            <img
              className="absolute z-0 w-full rounded-lg max-w-none blur-xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light h-[35rem] object-cover object-center object-top object-position-y-2/3"
              src={cloudinaryImage(data.image.src, 1600)}
              aria-hidden="true"
            />
            <img
              className="relative z-1 w-full rounded-lg max-w-none h-[35rem] object-cover object-center object-top object-position-y-2/3"
              alt={data.image.alt}
              src={cloudinaryImage(data.image.src, 1600)}
            />
            <div className="absolute inset-0 bg-gray-600 bg-opacity-30 w-full h-full rounded-lg"></div>
          </>
          )}
        </div>
        <div className="absolute z-2 top-1/4 m-10 -translate-y-1/2 sm:-translate-y-1/3 justify-center overflow-hidden ">
            {data.headline && (
              <h1
                data-tina-field={tinaField(data, "headline")}
                className={`w-full relative	mb-10 text-4xl sm:text-5xl font-semibold tracking-normal leading-tight title-font text-white`}
              >

                  {data.headline}

              </h1>
            )}
            {data.tagline && (
              <h2
                data-tina-field={tinaField(data, "tagline")}
                className="hidden sm:block w-full relative mb-10 text-xl font-normal sm:text-2xl tracking-normal leading-tight title-font text-white"
              >
                {data.tagline}
              </h2>
            )}
          </div>
          <div className="relative md:absolute z-2 m-10 top-1/2 mdtranslate-y-1/2 justify-center md:overflow-hidden ">
            {data.text && (
              <div
                data-tina-field={tinaField(data, "text")}
                className={`prose prose-lg mx-auto lg:mx-0 mb-10 md:text-white ${
                  data.color === "primary" ? `prose-primary` : `dark:prose-dark`
                }`}
              >
                <TinaMarkdown content={data.text} />
              </div>
            )}
            {data.actions && (
              <Actions
               
                className="lg:justify-start py-2 text-white "
                parentColor="primary"
                actions={data.actions}
              />
            )}
        </div>
      </Container>
    </Section>
  );
};

export const heroBlockSchema: TinaTemplate = {
  name: "hero",
  label: "Hero",
  ui: {
    defaultItem: {
      tagline: "Here's some text above the other text",
      headline: "This Big Text is Totally Awesome",
      text: "Phasellus scelerisque, libero eu finibus rutrum, risus risus accumsan libero, nec molestie urna dui a leo.",
    },
  },
  fields: [
    {
      type: "string",
      label: "Tagline",
      name: "tagline",
    },
    {
      type: "string",
      label: "Headline",
      name: "headline",
    },
    {
      label: "Text",
      name: "text",
      type: "rich-text",
    },
    {
      label: "Actions",
      name: "actions",
      type: "object",
      list: true,
      ui: {
        defaultItem: {
          label: "Action Label",
          type: "button",
          icon: true,
          link: "/",
        },
        itemProps: (item) => ({ label: item.label }),
      },
      fields: [
        {
          label: "Label",
          name: "label",
          type: "string",
        },
        {
          label: "Type",
          name: "type",
          type: "string",
          options: [
            { label: "Button", value: "button" },
            { label: "Link", value: "link" },
          ],
        },
        {
          label: "Icon",
          name: "icon",
          type: "boolean",
        },
        {
          label: "Link",
          name: "link",
          type: "string",
        },
      ],
    },
    {
      type: "object",
      label: "Image",
      name: "image",
      fields: [
        {
          name: "src",
          label: "Image Source",
          type: "image",
        },
        {
          name: "alt",
          label: "Alt Text",
          type: "string",
        },
      ],
    },
    {
      type: "string",
      label: "Color",
      name: "color",
      options: [
        { label: "Default", value: "default" },
        { label: "Tint", value: "tint" },
        { label: "Primary", value: "primary" },
      ],
    },
  ],
};
