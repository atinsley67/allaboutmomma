import React from "react";
import { Container } from "../components/util/container";
import { Section } from "../components/util/section";
import { useTheme, Layout } from "../components/layout";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { client } from "../.tina/__generated__/client";
import { useTina } from "tinacms/dist/react";
import { useRouter } from 'next/router'
import { extractPosts, searchPosts, getIntro} from '../components/util/propsUtils'

// Use the props returned by get static props
export default function HomePage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const theme = useTheme();
  const router = useRouter()
  const { s } = router.query
  const { data } = useTina({
    query: null,
    variables: null,
    data: props.data,
  });

  //return ( <div>{JSON.stringify(data)}</div>)

  // *********************************************************************************************
  // TODO: Investigate replacing the simple forwards index with a proper search tool like FUSE.JS
  //         Currently we perform a very simple search which may start 
  //         to perform poorly with many blog post pages.
  //
  // *********************************************************************************************


  const searchResults = searchPosts(data, s);

  return (
    <Layout rawData={data} data={data.global as any}>
      <Section className="flex-1">
        <Container
        className={`flex flex-wrap gap-x-10 gap-y-8 text-left`}
        size="small"
        >
        <h2 className="text-3xl font-semibold title-font">Search Results</h2>
        {searchResults &&
          searchResults.map(function (block, i) {
            return (
              <Result
                key={i}
                data={block}
              />
            );
          })}
        </Container>
      </Section>
    </Layout>
  );
}

const Result = ({ data }) => {
  return (
    <a href={data.filename}>
      <div className="flex justify-center">
        <div
          className="flex flex-col rounded-lg bg-white shadow-lg dark:bg-neutral-700 md:max-w-xxl sm:flex-row">
          <img
            className="h-64 w-full rounded-t-lg object-cover sm:h-auto sm:w-48 sm:rounded-none sm:rounded-l-lg"
            src={data.heroImg}
            alt="" />
          <div className="flex flex-col justify-start p-6">
            <h5
              className="mb-2 text-xl font-medium text-neutral-800 dark:text-neutral-50">
              {data.title}
            </h5>
            <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
              {data.intro}
            </p>
            <div className="px-6 pt-4 pb-2">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{data.category}</span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
};


export const getStaticProps = async ({ params }) => {
  
    const tinaProps = await client.queries.allPostsQuery();
    const postsWithWords = extractPosts(tinaProps.data.postConnection);

    await Promise.all(
      postsWithWords.map(async post => {

        const intro = getIntro(post._body, 50)
        delete post._body
        post.intro = intro
        
      })
    );


    return {
      props: {
        data: postsWithWords
      },
    };
};


export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
