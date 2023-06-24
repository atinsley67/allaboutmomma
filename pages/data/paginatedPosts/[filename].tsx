import { client } from "../../../.tina/__generated__/client";
import { useTina } from "tinacms/dist/react";

// Use the props returned by get static props
export default function BlogPostPage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  return (
    <></>
  );
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await client.queries.categoryQuery({
    relativePath: `${params.filename}.mdx`,
  });

  return {
    props: {
      ...tinaProps,
    },
  };
};


/**
 * To build the cateories pages  we just iterate through the list of
 * categories and provide their "filename" as part of the URL path
 *
 * So a blog post at "content/categories/hello.md" would
 * be viewable at http://localhost:3000/categories/hello
 */
export const getStaticPaths = async () => {
  const categoryListData = await client.queries.categoryConnection();
  return {
    paths: categoryListData.data.categoryConnection.edges.map((post) => ({
      params: { filename: post.node._sys.filename },
    })),
    fallback: "blocking",
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
