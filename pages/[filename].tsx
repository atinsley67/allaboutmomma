import { Post } from "../components/posts/post";
import { Blocks } from "../components/blocks-renderer";
import { client } from "../.tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { getIntro } from "../components/util/propsUtils"

const addTOCData = (data) => {
  const { _body } = data.post;

  // Check if the body contains a single TableOfContents element or an array of them
  const tocElements = Array.isArray(_body.children) 
    ? _body.children.filter((child) => child.name === "TableOfContents") 
    : _body.children.name === "TableOfContents" 
      ? [_body.children] 
      : [];

  tocElements.forEach((tocElement) => {
    const hLimit = tocElement.props.hLevel || 2;
    const regex = new RegExp(`^h[1-${hLimit}]$`);
    const h2Elements = _body.children.filter((child) => regex.test(child.type));

    const formattedHeadings = h2Elements.map((heading) => {
      return {
        level: parseInt(heading.type.slice(1)), // extract the H level from the type
        text: heading.children[0].text // extract the text of the heading
      };
    });

    tocElement.props.headings = formattedHeadings;
  });

  return data;
};

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
    const dataWithTOCHeadings = addTOCData(data);
    return (
      <Layout rawData={dataWithTOCHeadings} data={dataWithTOCHeadings.global as any}>
        <Post {...dataWithTOCHeadings.post} />
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
    return {
      props: {
        ...tinaProps,
      },
    };
  } catch (error) {

    const tinaProps = await client.queries.contentQuery({
      relativePath: `${params.filename}.md`,
    });

    await Promise.all(
      tinaProps.data.page.blocks.map(async block => {
        if (block.__typename === 'PageBlocksFeaturedPosts') {
          await Promise.all(
            block.items.map(async (item: any) => {
              const postData = await client.queries.blogPostCardQuery({
                relativePath: `${item.postLocation}.mdx`,
              });

              const intro = getIntro(postData.data.post._body, 50)
              delete postData.data.post._body
              item.postDetails = postData.data.post;
              item.postDetails.intro = intro
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
