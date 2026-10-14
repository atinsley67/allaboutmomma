import { Post } from "../components/posts/post";
import { Blocks } from "../components/blocks-renderer";
import { client } from "../tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { addTOCData, addFeaturedPostIntros } from "../components/util/propsUtils"
import fs from "fs";
import path from "path";



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
  // Posts and pages share this route; content/pages/<filename>.md means it's a page
  const isPage = fs.existsSync(path.join(process.cwd(), "content/pages", `${params.filename}.md`));

  if (isPage) {
    const tinaProps = await client.queries.contentQuery({
      relativePath: `${params.filename}.md`,
    });
    return {
      props: {
        data: addFeaturedPostIntros(tinaProps.data, 50),
        query: tinaProps.query,
        variables: tinaProps.variables,
      },
    };
  }

  const tinaProps = await client.queries.blogPostQuery({
    relativePath: `${params.filename}.mdx`,
  });
  return {
    props: addTOCData(tinaProps),
  };
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
