import { Actions } from "../util/actions";
import { tinaField } from "tinacms/dist/react";
import { Section } from "../util/section";
import { Container } from "../util/container";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { cloudinaryImage } from "../util/cloudinary";

export const FeaturedPost = ({ data }) => {
  const post = data?.post;
  if (!post) {
    return null;
  }

  return (
    <div>
    <a href={`/${post._sys.filename}`}>
      <div
        data-tina-field={tinaField(data)}
        className="rounded-xl overflow-hidden shadow-lg h-full"
      >
        <img className="w-full h-80 object-cover object-center" loading="lazy" src={cloudinaryImage(post.heroImg, 800)} alt={post.title}/>
        <div className="px-6 pt-4 pb-2">
          {post.title && (
            <h3 className="text-2xl font-semibold title-font">
              {post.title}
            </h3>
          )}
          {post.description && (
            <div className="text-base opacity-80 leading-relaxed">
              {post.description}
            </div>
          )}
        </div>
        <div className="px-6 pt-4 pb-2 flex flex-wrap justify-center">
          {post.categories && post.categories.map((category) => (
            <div className="px-2 py-1" key={category}>
              <span className="bg-gray-200 rounded-full px-3 py-1 pb-2 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </a>
    </div>
  );
};

export const FeaturedPosts = ({ data }) => {


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
          // item.post is a path like "content/posts/my-post.mdx"
          return {
            label: item?.post?.split("/").pop()?.replace(/\.mdx$/, ""),
          };
        },
      },
      fields: [
        {
          type: "reference",
          label: "Post",
          name: "post",
          collections: ["post"],
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
