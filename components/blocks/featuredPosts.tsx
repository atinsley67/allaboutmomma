import { Actions } from "../util/actions";
import { Section } from "../util/section";
import { Container } from "../util/container";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import Link from "next/link";

export const FeaturedPost = ({ data, tinaField }) => {

  if (!data || !data.postDetails) {
    return <div>{JSON.stringify(data)}</div>;
  }

  return (
    <a href={data.postLocation}>
      <div
        data-tinafield={tinaField}
        className="rounded-xl overflow-hidden shadow-lg"
      >
        <img className="w-full max-h-80 object-cover" src={data.postDetails.heroImg} alt={data.postDetails.title}/>
        <div className="px-6 pt-4 pb-2">
          {data.postDetails.title && (
            <h3
              data-tinafield={`${tinaField}.title`}
              className="text-2xl font-semibold title-font"
            >
              {data.postDetails.title}
            </h3>
          )}
          {data.postDetails.intro && (
            <div
              data-tinafield={`${tinaField}.text`}
              className="text-base opacity-80 leading-relaxed"
            >
              {data.postDetails.intro}
            </div>
          )}
        </div>
        <div className="px-6 pt-4 pb-2 flex flex-wrap justify-center">
          {data.postDetails.categories && data.postDetails.categories.map((category) => (
            <div className="px-2 py-1">
              <span className="bg-gray-200 rounded-full px-3 py-1 pb-2 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </a>
  );
};

export const FeaturedPosts = ({ data, parentField }) => {


  if (!data.items || data.items.length === 0) {
    return <div>No features</div>;
  }

  return (
    <Section color={data.color}>
      <Container
        className="text-center justify-center"
        size="small"
      >
        <div>
          <h2 className="text-xl font-bold">{data.title}</h2>
        </div>
        <div className="mx-auto px-0 py-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5 max-w-[500px] md:max-w-[800px] lg:max-w-[1200px] ">
        {data.items.map((item, i) => (
          <FeaturedPost
            tinaField={`${parentField}.items.${i}`}
            key={i}
            data={item}
          />
        ))}
        </div>
      </Container>
    </Section>
  );
};


export const featuredPostsBlockSchema = {
  name: "featuredPosts",
  label: "Featured Posts",
  ui: {
  },
  fields: [
    {
      type: "string",
      label: "Title",
      name: "title",
    },
    {
      type: "object",
      label: "Featured Posts",
      name: "items",
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.postLocation,
          };
        },
      },
      fields: [
        {
          type: "string",
          label: "Post Location",
          name: "postLocation",
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
