import { Category } from "../../components/category/category";
import { Blocks } from "../../components/blocks-renderer";
import { client } from "../../.tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../../components/layout";
import { getIntro } from "../../components/util/propsUtils"

// Use the props returned by get static props
export default function BlogPostPage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });
  if (data && data.category) {
    return (
      <Layout rawData={data} data={data.global as any}>
        <Category {...data} />
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
  const tinaProps = await client.queries.categoryQuery({
    relativePath: `${params.filename}.mdx`,
  });


  tinaProps.data.postConnection.edges = tinaProps.data.postConnection.edges.filter(
    (post) => post.node.categories && post.node.categories.includes(`${params.filename}`)
  );

  await Promise.all(
    tinaProps.data.postConnection.edges.map(async post => {

      const intro = getIntro(post.node._body, 50)
      delete post.node._body
      post.node.intro = intro
      
    })
  );

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
