import { Blocks } from "../components/blocks-renderer";
import { client } from "../.tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { Layout } from "../components/layout";
import { useRouter } from 'next/router'
import schema from '../.tina/__generated__/_graphql.json';

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

    /*
    // We don't have access to the definition of PageBlocksFeaturedPosts so we need to go get it from the schema.
    const featuredPostsDef = schema.definitions.find(
      def => def.kind === 'ObjectTypeDefinition' && def.name.value === 'PageBlocksFeaturedPosts'
    );
    */

    // Get the featured posts data
    const featuredPosts = tinaProps.data.page.blocks.find(block => block.__typename === 'PageBlocksFeaturedPosts') as any;

    
    // Extract the postLocation values from the featured posts items
    const postLocations = featuredPosts.items.map(item => item.postLocation);

    // Fetch additional data for each postLocation value
    const postDetails = await Promise.all(
      postLocations.map(async postLocation => {
        const postQuery = await client.queries.blogPostCardQuery({ relativePath: `${postLocation}.mdx` });
        return postQuery.data;
      })
    );

    const newData = {
    ...tinaProps.data,
    global: {
      ...tinaProps.data.global,
    },
    page: {
      ...tinaProps.data.page,
      blocks: tinaProps.data.page.blocks.map(block => {
        if (block.__typename === 'PageBlocksFeaturedPosts') {
          return {
            ...block,
            items: block.items.map((item, index) => {
              return {
                ...item,
                postDetails: postDetails[index].post,
              };
            }),
          };
        } else {
          return block;
        }
      }),
    },
  };


  return {
    props: {
      data: newData,
      query: tinaProps.query,
      variables: tinaProps.variables,
    },
  };
};


export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
