import * as React from "react";
import { Actions } from "../util/actions";
import { Container } from "../util/container";
import { Section } from "../util/section";
import { useTheme } from "../layout";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { TinaTemplate } from "tinacms";

export const Hero = ({ data, parentField }) => {
  const theme = useTheme();
  const headlineColorClasses = {
    blue: "from-blue-400 to-blue-600",
    teal: "from-teal-400 to-teal-600",
    green: "from-green-400 to-green-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-400 to-pink-600",
    purple: "from-purple-400 to-purple-600",
    orange: "from-orange-300 to-orange-600",
    yellow: "from-yellow-400 to-yellow-600",
  };

  return (
    <Section color={data.color}>
      <Container
        size="medium"
      >
        <div
          data-tinafield={`${parentField}.image`}
          className="relative"
        >
          <img
            className="absolute z-0 w-full rounded-lg max-w-xs max-w-none h-auto blur-xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light max-h-[35rem] object-cover object-center object-top object-position-y-2/3"
            src={data.image.src}
            aria-hidden="true"
          />
          <img
            className="relative z-1 w-full max-w-xs rounded-lg max-w-none h-auto max-h-[35rem] object-cover object-center object-top object-position-y-2/3"
            alt={data.image.alt}
            src={data.image.src}
          />
        <div className="absolute z-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 justify-center overflow-hidden ">
            {data.tagline && (
              <h2
                data-tinafield={`${parentField}.tagline`}
                className="absolute inline-block px-3 py-1 mb-8 text-md tracking-wide title-font z-20"
              >
                {data.tagline}
                <span className="absolute w-full h-full left-0 top-0 rounded-full bg-current opacity-7"></span>
              </h2>
            )}
            {data.headline && (
              <h3
                data-tinafield={`${parentField}.headline`}
                className={`w-full relative	mb-10 text-5xl tracking-normal leading-tight title-font text-white`}
              >
                <span
                  className={`bg-clip-text text-transparent bg-gradient-to-r  text-white ${
                    data.color === "primary"
                      ? `from-white to-gray-100`
                      : headlineColorClasses[theme.color]
                  }`}
                >
                  {data.headline}
                </span>
              </h3>
            )}
            {data.text && (
              <div
                data-tinafield={`${parentField}.text`}
                className={`prose prose-lg mx-auto lg:mx-0 mb-10 text-white ${
                  data.color === "primary" ? `prose-primary` : `dark:prose-dark`
                }`}
              >
                <TinaMarkdown content={data.text} />
              </div>
            )}
            {data.actions && (
              <Actions
                parentField={`${parentField}.actions`}
                className="justify-center lg:justify-start py-2 text-white "
                parentColor="black"
                actions={data.actions}
              />
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
};

export const heroBlockSchema: TinaTemplate = {
  name: "hero",
  label: "Hero",
  ui: {
    previewSrc: "/blocks/hero.png",
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
