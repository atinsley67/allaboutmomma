import { Blocks } from "../components/blocks-renderer";
import { client } from "../tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { addFeaturedPostIntros } from "../components/util/propsUtils";

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

export const getStaticProps = async () => {
  const tinaProps = await client.queries.contentQuery({
    relativePath: `home.md`,
  });

  return {
    props: {
      data: addFeaturedPostIntros(tinaProps.data, 25),
      query: tinaProps.query,
      variables: tinaProps.variables,
    },
  };
};


export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
