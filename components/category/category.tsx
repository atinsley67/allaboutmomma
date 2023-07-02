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
  DateTime: {
    format?: string;
  };
  NewsletterSignup: {
    placeholder: string;
    buttonText: string;
    children: TinaMarkdownContent;
    disclaimer?: TinaMarkdownContent;
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
  DateTime: (props) => {
    const dt = React.useMemo(() => {
      return new Date();
    }, []);

    switch (props.format) {
      case "iso":
        return <span>{dt.toISOString()}</span>;
      case "utc":
        return <span>{dt.toUTCString()}</span>;
      case "local":
        return <span>{dt.toLocaleDateString()}</span>;
      default:
        return <span>{dt.toLocaleDateString()}</span>;
    }
  },
  NewsletterSignup: (props) => {
    return (
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="">
            <TinaMarkdown content={props.children} />
          </div>
          <div className="mt-8 ">
            <form className="sm:flex">
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email-address"
                type="email"
                autoComplete="email"
                required
                className="w-full px-5 py-3 border border-gray-300 shadow-sm placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:max-w-xs rounded-md"
                placeholder={props.placeholder}
              />
              <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3 px-5 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  {props.buttonText}
                </button>
              </div>
            </form>
            <div className="mt-3 text-sm text-gray-500">
              {props.disclaimer && <TinaMarkdown content={props.disclaimer} />}
            </div>
          </div>
        </div>
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
  const theme = useTheme();
  const titleColorClasses = {
    blue: "from-blue-400 to-blue-600 dark:from-blue-300 dark:to-blue-500",
    teal: "from-teal-400 to-teal-600 dark:from-teal-300 dark:to-teal-500",
    green: "from-green-400 to-green-600",
    red: "from-red-400 to-red-600",
    pink: "from-pink-300 to-pink-500",
    purple:
      "from-purple-400 to-purple-600 dark:from-purple-300 dark:to-purple-500",
    orange:
      "from-orange-300 to-orange-600 dark:from-orange-200 dark:to-orange-500",
    yellow:
      "from-yellow-400 to-yellow-500 dark:from-yellow-300 dark:to-yellow-500",
    gray_400:
      "from-gray-400 to-gray-500 dark:from-gray-300 dark:to-gray-500",
  };

  const date = new Date(props.date);
  let formattedDate = "";
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, "MMM dd, yyyy");
  }

  return (
    <Section className="flex-1">
      <Container className={`flex-1 pb-2`} size="small">
        <h2
          data-tinafield="title"
          className={`w-full relative	mb-8 text-4xl text-teal-700 font-semibold tracking-normal `}
        >
          {props.category.title}
        </h2>

      {props.category.heroImg && (
          <div className="relative"
          >
            <img
              className="absolute z-0 w-full rounded-lg max-w-none h-auto blur-xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light max-h-[20rem] object-cover object-center object-top object-position-y-1/3"
              src={props.category.heroImg}
              aria-hidden="true"
            />
            <img
              className="relative z-1 w-full rounded-lg max-w-none h-auto max-h-[20rem] object-cover object-center object-top object-position-y-1/3"
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
                  <div className="flex justify-center">
                    <div
                      className="flex flex-col rounded-lg bg-white shadow-lg dark:bg-neutral-700 md:max-w-xxl sm:flex-row">
                      <img
                        className="h-64 w-full rounded-t-lg object-cover sm:h-auto sm:w-48 sm:rounded-none sm:rounded-l-lg"
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
