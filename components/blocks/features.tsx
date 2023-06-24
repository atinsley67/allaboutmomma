import { Actions } from "../util/actions";
import { Section } from "../util/section";
import { Container } from "../util/container";

import Link from 'next/link';

export const Feature = ({ featuresColor, data, tinaField }) => {
  const featureCardStyle = data.imageBackground
    ? {
        backgroundImage: `url(${data.image})`,
        backgroundColor: 'rgba(0,0,0,0.3)',
        color: 'white', // Text color
        backgroundBlendMode: 'multiply', // Optional: Apply blending mode for overlay
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {};

  const featureCard = (
    <div
      data-tinafield={tinaField}
      className="flex-1 flex flex-col text-center items-center lg:items-start lg:text-left max-w-xl mx-auto rounded-lg h-full"
      style={{ flexBasis: '16rem', ...featureCardStyle }}
    >
      {data.image && !data.imageBackground && (
        <img
          src={data.image}
          alt=""
          className="w-full max-h-60 auto object-cover rounded-lg"
        />
      )}
      <div className="p-6">
        {data.title && (
          <h3
            data-tinafield={`${tinaField}.title`}
            className="text-2xl font-semibold title-font"
          >
            {data.title}
          </h3>
        )}
        {data.text && (
          <p
            data-tinafield={`${tinaField}.text`}
            className="whitespace-pre-wrap text-base leading-relaxed"
          >
            {data.text}
          </p>
        )}
      </div>
      {data.actions && <Actions actions={data.actions} />}
    </div>
  );

  if (data.url) {
    return (
      <Link href={data.url} passHref>
        <a className="h-full">{featureCard}</a>
      </Link>
    );
  }

  return featureCard;
};


export const Features = ({ data, parentField }) => {
  return (
    <Section color={data.color}>
      <Container
        className="text-center"
        size="small"
      >
        {data.title && (
          <div>
            <h2 className="text-xl font-bold">{data.title}</h2>
          </div>
        )}
        <div className="mx-auto px-0 py-4 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 max-w-[500px] md:max-w-[800px] lg:max-w-[1200px] ">
          {data.items &&
            data.items.map(function (block, i) {
              return (
                <div key={i} className="flex flex-col ">
                  <Feature
                    tinaField={`${parentField}.items.${i}`}
                    featuresColor={data.color}
                    data={block}
                  />
                </div>
              );
            })}
        </div>
      </Container>
    </Section>
  );
};

const defaultFeature = {
  title: "Here's Another Feature",
  text: "This is where you might talk about the feature, if this wasn't just filler text.",
};

export const featureBlockSchema = {
  name: "features",
  label: "Features",
  ui: {
    defaultItem: {
      items: [defaultFeature, defaultFeature, defaultFeature],
    },
  },
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
    },
    {
      type: "object",
      label: "Feature Items",
      name: "items",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.title,
          };
        },
        defaultItem: {
          ...defaultFeature,
        },
      },
      fields: [
        {
          type: "string",
          label: "Title",
          name: "title",
        },
        {
          type: "string",
          label: "Text",
          name: "text",
          ui: {
            component: "textarea",
          },
        },
        {
          type: "image",
          name: "image",
          label: "Image",
        },
        {
          type: "string",
          name: "url",
          label: "Link URL",
        },
        {
          type: "boolean",
          name: "imageBackground",
          label: "Use image as background",
        }
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
