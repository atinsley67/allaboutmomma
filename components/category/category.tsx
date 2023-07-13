import React from "react";
import { Container } from "../util/container";
import { Section } from "../util/section";
import Link from "next/link";
import { useTheme } from "../layout";
import format from "date-fns/format";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { Prism } from "tinacms/dist/rich-text/prism";
import type { TinaMarkdownContent, Components } from "tinacms/dist/rich-text";
import { BsArrowRight } from "react-icons/bs";


const components: Components<{
  BlockQuote: {
    children: TinaMarkdownContent;
    authorName: string;
  };
}> = {
  code_block: (props) => <Prism {...props} />,
  BlockQuote: (props: {
    children: TinaMarkdownContent;
    authorName: string;
  }) => {
    return (
      <div>
        <blockquote>
          <TinaMarkdown content={props.children} />
          {props.authorName}
        </blockquote>
      </div>
    );
  },
  img: (props) => (
    <div className="flex items-center justify-center">
      <img src={props.url} alt={props.alt} />
    </div>
  ),
};

export const Category = (props) => {

  const date = new Date(props.date);
  let formattedDate = "";
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, "MMM dd, yyyy");
  }

  return (
    <Section className="flex-1">
      <Container className={`flex-1 pb-2`} size="small">
        <h1
          data-tinafield="title"
          className={`w-full relative	mb-8 text-4xl text-teal-700 font-semibold tracking-normal `}
        >
          {props.category.title}
        </h1>

      {props.category.heroImg && (
          <div className="relative"
          >
            <img
              className="absolute z-0 w-full rounded-lg max-w-none h-[18rem]  blur-xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light h-[20rem] object-cover object-center"
              src={props.category.heroImg}
              aria-hidden="true"
            />
            <img
              className="relative z-1 w-full rounded-lg max-w-none h-[18rem] object-cover object-center"
              alt={props.category.title}
              src={props.category.heroImg}
            />
            <div className="absolute inset-0 bg-gray-600 bg-opacity-30 w-full h-full rounded-lg"></div>
          </div>
      )}
      </Container>
      <Container className={`flex-1 pt-4`} width="medium" size="small">
        <div className="prose dark:prose-dark w-full max-w-none pt-6">
          <TinaMarkdown components={components} content={props.category._body} />
        </div>
      </Container>
      <Container size="small" className={`flex flex-wrap gap-x-10 gap-y-8 text-left`}>
        <>
        {props.postConnection.edges.map((postData) => {
            const post = postData.node;
            const date = new Date(postData.date);
            let formattedDate = "";
            if (!isNaN(date.getTime())) {
              formattedDate = format(date, "MMM dd, yyyy");
            }
            return (
              <Link
                key={post._sys.filename}
                href={`/` + post._sys.filename}
                passHref
              >
                <a>
                  <div className="flex justify-center h-64">
                    <div
                      className="flex flex-col rounded-lg bg-white shadow-lg dark:bg-neutral-700 md:w-xxl sm:flex-row">
                      <img
                        className="w-48 object-cover object-center rounded-t-lg sm:w-48 sm:rounded-none sm:rounded-l-lg"
                        src={post.heroImg}
                        alt={post.title} />
                      <div className="flex flex-col justify-start p-6">
                        <h5
                          className="mb-2 text-xl font-medium text-neutral-800 dark:text-neutral-50">
                          {post.title}
                        </h5>
                        <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
                          {post.intro}
                        </p>
                        <div className="px-6 pt-4 pb-2 flex flex-wrap justify-left">
                          {post.categories && post.categories.map((category, i) => (
                            <div key={i} className="px-2 py-1">
                              <span className="bg-gray-200 rounded-full px-3 py-1 pb-2 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                {category}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </>
      </Container>
    </Section>
  );
};
