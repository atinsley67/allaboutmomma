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
      className="flex h-full flex-col text-center items-center lg:items-start lg:text-left max-w-xl mx-auto rounded-lg min-h-[18rem]"
      style={{ flexBasis: '16rem', ...featureCardStyle }}
    >
      {data.image && !data.imageBackground && (
        <div className="flex justify-center w-full">
          <img
            src={data.image}
            alt=""
            className="w-auto object-contain rounded-lg h-64"
          />
        </div>
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
        <a>{featureCard}</a>
      </Link>
    );
  }

  return featureCard;
};


export const Features = ({ data, parentField }) => {

  let gridColsClasses = "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3"
  if (data.maxCols === "1") {
    gridColsClasses = 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1';
  } else if (data.maxCols === "2") {
    gridColsClasses = 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2';
  } else if (data.maxCols === "3") {
    gridColsClasses = 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3';
  } else if (data.maxCols === "4") {
    gridColsClasses = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4';
  }
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
        <div className={`mx-auto px-0 py-4 grid ${gridColsClasses} gap-5 gap-5 max-w-[500px] md:max-w-[800px] lg:max-w-[1200px]`}>
          {data.items &&
            data.items.map(function (block, i) {
              return (
                <div key={i}>
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
      label: "Max Columns",
      name: "maxCols",
      options: [
        { label: "1", value: "1" },
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
      ],
      ui: {
        defaultItem: "3",
      },
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
