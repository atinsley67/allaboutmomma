import { PostPage } from "../components/posts/postPage";
import { Blocks } from "../components/blocks-renderer";
import { client } from "../tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { addFeaturedPostIntros } from "../lib/intro";
import { addTOCData } from "../lib/toc";
import { addAmazonData, amazonAsins, lookUpNewProducts } from "../lib/amazon";
import { isHidden, mayRenderOnRequest, removeHiddenFeaturedPosts, showHidden } from "../lib/hidden";
import fs from "fs";
import path from "path";

type RouteProps = {
  data: any;
  query: string;
  variables: any;
  draftMode: boolean;
};

// Use the props returned by get static props
export default function PostOrPageRoute(props: RouteProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  if (data && 'post' in data && data.post) {
    return (
      <Layout rawData={data} data={data.global as any}>
        <PostPage {...data.post} />
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
      <div>No data</div>
    </Layout>
  );
}

// In draft mode, products added since the last build are looked up on Amazon before rendering
async function withAmazonData(data, draftMode: boolean) {
  if (draftMode) await lookUpNewProducts(amazonAsins(data));
  return addAmazonData(data);
}

export const getStaticProps = async ({ params, draftMode = false }) => {
  if (!mayRenderOnRequest(draftMode)) return { notFound: true };

  // Posts and pages share this route; content/pages/<filename>.md means it's a page
  const isPage = fs.existsSync(path.join(process.cwd(), "content/pages", `${params.filename}.md`));

  if (isPage) {
    const tinaProps = await client.queries.contentQuery({
      relativePath: `${params.filename}.md`,
    });
    const data = removeHiddenFeaturedPosts(addFeaturedPostIntros(tinaProps.data, 50), showHidden(draftMode));
    return {
      props: {
        data: await withAmazonData(data, draftMode),
        query: tinaProps.query,
        variables: tinaProps.variables,
        draftMode,
      },
    };
  }

  // Requested addresses that aren't posts end up here when rendering on request
  const tinaProps = await client.queries
    .blogPostQuery({ relativePath: `${params.filename}.mdx` })
    .catch(() => null);
  if (!tinaProps || (isHidden(tinaProps.data.post) && !showHidden(draftMode))) return { notFound: true };

  await withAmazonData(tinaProps.data, draftMode);
  return {
    props: { ...addTOCData(tinaProps), draftMode },
  };
};


export const getStaticPaths = async () => {
  const postsListData = await client.queries.allPostsQuery();
  const pagesListData = await client.queries.pageConnection();
  const posts = postsListData.data.postConnection.edges.filter((item) => showHidden() || !isHidden(item.node));
  const listData = [...posts, ...pagesListData.data.pageConnection.edges];
  return {
    paths: listData.map((item) => ({
      params: { filename: item.node._sys.filename },
    })),
    // Anything not built (hidden posts, posts written since the last build) can still render on
    // request, but only in draft mode (see getStaticProps)
    fallback: "blocking",
  };
};
