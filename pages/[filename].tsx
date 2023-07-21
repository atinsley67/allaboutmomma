import { Post } from "../components/posts/post";
import { Blocks } from "../components/blocks-renderer";
import { client } from "../tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { getIntro, addTOCData } from "../components/util/propsUtils"



// Use the props returned by get static props
export default function BlogPostPage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  if (data && 'post' in data && data.post) {
    return (
      <Layout rawData={data} data={data.global as any}>
        <Post {...data.post} />
      </Layout>
    );
  }
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
  try {
    const tinaProps = await client.queries.blogPostQuery({
      relativePath: `${params.filename}.mdx`,
    });
    const propsWithHeadings = addTOCData(tinaProps)
    return {
      props: {
        ...propsWithHeadings,
      },
    };
  } catch (error) {
    console.log(error)
    const tinaProps = await client.queries.contentQuery({
      relativePath: `${params.filename}.md`,
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

                const intro = getIntro(postData.data.post._body, 50)
                delete postData.data.post._body
                item.postDetails = postData.data.post;
                item.postDetails.intro = intro
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
  }
  return
};


export const getStaticPaths = async () => {
  const postsListData = await client.queries.allPostsQuery();
  const pagesListData = await client.queries.pageConnection();
  const listData = [...postsListData.data.postConnection.edges, ...pagesListData.data.pageConnection.edges];
  return {
    paths: listData.map((item) => ({
      params: { filename: item.node._sys.filename },
    })),
    fallback: false,
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
