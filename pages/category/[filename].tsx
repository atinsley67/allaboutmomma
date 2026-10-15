import { CategoryPage } from "../../components/category/categoryPage";
import { client } from "../../tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../../components/layout";
import { getIntro } from "../../lib/intro";
import { isInCategory } from "../../lib/category";

// Use the props returned by get static props
export default function CategoryRoute(
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
        <CategoryPage {...data} />
      </Layout>
    );
  }
  return (
    <Layout>
      <div>No data</div>
    </Layout>
  );
}

export const getStaticProps = async ({ params }) => {
  const tinaProps = await client.queries.categoryQuery({
    relativePath: `${params.filename}.mdx`,
  });


  // Trim the published page's data to this category's posts and their intros.
  // CategoryPage repeats both steps for the visual editor, which re-queries everything live.
  tinaProps.data.postConnection.edges = tinaProps.data.postConnection.edges.filter(
    (post) => isInCategory(post.node, params.filename)
  );

  tinaProps.data.postConnection.edges.forEach((post: any) => {
    post.node.intro = getIntro(post.node._body, 50);
    delete post.node._body;
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
    fallback: false,
  };
};

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
