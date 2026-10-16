import { Blocks } from "../components/blocks-renderer";
import { client } from "../tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { addFeaturedPostIntros } from "../lib/intro";
import { addAmazonData, amazonAsins, lookUpNewProducts } from "../lib/amazon";
import { removeHiddenFeaturedPosts, showHidden } from "../lib/hidden";

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
        <div>No data</div>
      </Layout>
    );


}

export const getStaticProps = async ({ draftMode = false }) => {
  const tinaProps = await client.queries.contentQuery({
    relativePath: `home.md`,
  });

  const data = removeHiddenFeaturedPosts(addFeaturedPostIntros(tinaProps.data, 25), showHidden(draftMode));
  if (draftMode) await lookUpNewProducts(amazonAsins(data));
  return {
    props: {
      data: addAmazonData(data),
      query: tinaProps.query,
      variables: tinaProps.variables,
      draftMode,
    },
  };
};


export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
