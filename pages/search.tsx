import React from "react";
import { Container } from "../components/util/container";
import { Section } from "../components/util/section";
import { Layout } from "../components/layout";
import { PostListCard } from "../components/cards/postListCard";
import { client } from "../tina/__generated__/client";
import { useRouter } from 'next/router'
import { extractPosts, searchPosts } from '../lib/search'

// Searches a word index of every post, built at build time and matched in the browser
export default function SearchPage(
  props: AsyncReturnType<typeof getStaticProps>["props"]
) {
  const router = useRouter()
  const { s } = router.query
  const searchResults = searchPosts(props.data, s);

  return (
    <Layout>
      <Section className="flex-1">
        <Container
        className={`flex flex-wrap gap-x-10 gap-y-8 text-left`}
        size="small"
        >
        <h2 className="text-3xl font-semibold title-font">Search Results</h2>
        {searchResults &&
          searchResults.map((post) => (
            <PostListCard
              key={post.filename}
              variant="search"
              filename={post.filename}
              title={post.title}
              heroImg={post.heroImg}
              intro={post.intro}
              categories={post.categories}
            />
          ))}
        </Container>
      </Section>
    </Layout>
  );
}

export const getStaticProps = async () => {
  const tinaProps = await client.queries.allPostsQuery();
  return {
    props: {
      data: extractPosts(tinaProps.data.postConnection),
    },
  };
};


export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;
