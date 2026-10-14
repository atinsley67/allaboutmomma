import { Section } from "../util/section";
import { Container } from "../util/container";
import { FeaturedPostCard } from "../cards/featuredPostCard";

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
          <FeaturedPostCard
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
