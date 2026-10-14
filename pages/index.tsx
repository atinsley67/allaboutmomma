import { Blocks } from "../components/blocks-renderer";
import { client } from "../tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";

// Use the props returned by get static props
export default function HomePage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

    if (data && 'page' in data && data.page) {
      return (
        <Layout rawData={data} data={data.global as any}>
          <Blocks {...data.page} />
        </Layout>
      );
    }
    return (
      <Layout>
        <div>No data</div>;
      </Layout>
    );


}

export const getStaticProps = async ({ params }) => {
  
    const tinaProps = await client.queries.contentQuery({
      relativePath: `home.md`,
    });

    await Promise.all(
      tinaProps.data.page.blocks.map(async block => {
        if (block.__typename === 'PageBlocksFeaturedPosts') {
          await Promise.all(
            block.items.map(async (item: any) => {
              try {
                const postData = await client.queries.blogPostCardQuery({
                  relativePath: `${item.postLocation}.mdx`,
                });
                item.postDetails = postData.data.post;
              } catch {
                item.error = "No post found. Posts IDs should be underscore_separated_lowercase_words and not include / etc. "
              }
            })
          );
        }
      })
    );

  return {
    props: {
      data: tinaProps.data,
      query: tinaProps.query,
      variables: tinaProps.variables,
    },
  };
};


export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
