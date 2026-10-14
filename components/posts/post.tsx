import React from "react";
import { Container } from "../util/container";
import { Section } from "../util/section";
import format from "date-fns/format";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { Prism } from "tinacms/dist/rich-text/prism";
import type { TinaMarkdownContent, Components } from "tinacms/dist/rich-text";
import Image from 'next/image'

function getTextContentForId(element) {
  if (element && element.props && element.props.content) {
    const textContent = element.props.content.map(c => c.text).join('');
    return textContent.trim().toLowerCase().replace(/[^\w]+/g, '-');
  } else if (typeof element === 'string') {
    return element.trim().toLowerCase().replace(/[^\w]+/g, '-');
  } else if (element && element.props && element.props.children) {
    const childElement = React.Children.only(element.props.children);
    if (childElement && typeof childElement === 'string') {
      return childElement.trim().toLowerCase().replace(/[^\w]+/g, '-');
    } else {
      return 'no_id'
    }
  } else {
    return 'no_id'
  }
  return 'no_id';
}


const components: Components<{
  OutlineBox: {
    children: TinaMarkdownContent;
  },
  BlockQuote: {
    children: TinaMarkdownContent;
    authorName: string;
  };
  AffiliateLink: {
    altText: string;
    affiliateURLs: {
      imageURL: string;
      linkURL: string;
    }
    imageURL: string;
    linkURL: string;
    image: string;
    button: boolean;
    caption: string;
    floatLeft: boolean;
  };
  TableOfContents: {
    title: string;
    hLevel: string;
    headings: object;
  };
  a: {
    url: string;
    children: TinaMarkdownContent;
  }
  Table: {
    data: {
      headers: any;
      rows: any;
    }
  };
  youtube: {
    title: string;
    src: string;
  }

  
}> = {
  code_block: (props) => <Prism {...props} />,
  OutlineBox: (props: {
    children: TinaMarkdownContent;
  }) => {
    return (
      <div className="my-5 px-4 border-[1px] bg-blue-gray">
        <TinaMarkdown content={props.children} />
      </div>
    )
  },
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
    <div className="flex flex-col items-center justify-center">
      <img className="mb-3 max-h-96 w-auto object-contain" src={props.url} alt={props.alt}/>
      <div className="text-xs font-semibold text-gray-600">{props.caption}</div>
    </div>
  ),
  h1: (props) => <h1 id={getTextContentForId(props.children)}>{props.children}</h1>,
  h2: (props) => <h2 id={getTextContentForId(props.children)}>{props.children}</h2>,
  h3: (props) => <h3 id={getTextContentForId(props.children)}>{props.children}</h3>,
  h4: (props) => <h4 id={getTextContentForId(props.children)}>{props.children}</h4>,
  a: (props) => {
    const isAffiliate = /amazon\.com\/|amzn\.to\//.test(props.url || "");
    return (
      <a
        href={props.url}
        className="font-bold"
        rel={isAffiliate ? "sponsored nofollow noopener" : undefined}
      >
        {props.children}
      </a>
    );
  },
  AffiliateLink: (props) => {
    // Extract image URL (an uploaded image takes precedence over an Amazon image URL)
    const imageURL = props.image || props.affiliateURLs?.imageURL || ""
    // Extract link URL
    const linkURL = props.affiliateURLs?.linkURL || ""
    const floatLeft = props.floatLeft

    if (linkURL && imageURL) {
      return (
        <>
          <div className={`flex ml-2 mr-6  mt-0 mb-6 justify-center items-center ${floatLeft ? 'md:float-left' : ''}`}>
            
              <a href={linkURL}
                target="_blank"
                rel="sponsored nofollow noopener"
                className="no-underline">
                <div className="rounded-xl overflow-hidden shadow-lg bg-white justify-center flex flex-col items-center m-0  min-w-[11rem] ">
                  <div className="flex flex-col justify-end min-h-[11rem]">
                    <img decoding="async" src={imageURL} className="border-0" alt={props.altText || props.caption || "Product image"}/>
                  </div>
                  <div className="min-h-[1rem]">
                  {props.caption &&
                    <div className="text-xs font-semibold text-gray-600">{props.caption}</div>
                  }
                    {props.button &&
                      <span
                        className="mx-auto z-10 relative flex text-center px-7 py-3 font-semibold text-lg transition duration-150 ease-out rounded-lg transform whitespace-nowrap">
                        Check Amazon Price
                      </span>
                    }
                  </div>
                </div>
              </a>
        </div>
        </>
      )
    }
    else {
      return <div>Broken Affiliate Link</div>
    }
  },
  TableOfContents: (props) => (
    <div className="my-5 border-2 border-gray-200 bg-gray-50 p-4">
      <h2 className="mt-2">{props.title}</h2>
      <ul>
        {props.headings instanceof Array &&
          props.headings.map((headingData) => {
            const linkId = headingData.text
              .trim()
              .toLowerCase()
              .replace(/[^\w]+/g, '-');
            return (
              <li key={headingData.text}>
                <a className="text-teal-600" href={`#${linkId}`}>{headingData.text}</a>
              </li>
            );
          })}
      </ul>
    </div>
  ),

  Table: (props) => {

    if (!props.data?.headers || props.data?.headers.length === 0) {
      return <p>Table: No table content.</p>;
    }

    return (
      <div className="my-5 overflow-x-auto">
        <table className="border-2 border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {props.data.headers.map((header, index) => (
                <th key={index} className="border-2 px-1 md:px-4 py-2 text-xxs sm:text-xs md:text-base text-teal-700">
                  {header.content}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.data.rows && props.data.rows.length > 0 && props.data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {row.cells && row.cells.length > 0 && row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-2 p-1 md:p-2 align-top text-xxs sm:text-xs md:text-sm">
                    <div className="whitespace-pre-wrap align-top">{cell.content && cell.content}</div>
                    {cell.affiliate && (
                      <div className="flex flex-col items-center justify-center">
                        <a
                          href={cell.affiliate.linkURL}
                          target="_blank"
                          rel="sponsored nofollow noopener"
                          className="no-underline"
                        >
                          <img
                            decoding="async"
                            className="block mx-auto m-2 max-w-xxxs md:max-w-xxs"
                            src={cell.affiliate.imageURL}
                            alt={cell.affiliate.caption || "Product image"}
                          />
                          <div className="text-center">{cell.affiliate.caption}</div>
                        </a>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  },
  youtube: (props) => {
    return (
    <div className="flex flex-col items-center justify-center">
      <iframe className="w-full max-w-3xl h-auto aspect-video" loading="lazy" width="768" height="432" src={props.src} title={props.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
    </div>
    )}
}



export const Post = (props) => {

  const date = new Date(props.date);
  let formattedDate = "";
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, "MMM dd, yyyy");
  }

  return (
    <Section className="flex-1">
      <Container width="small" className={`flex-1 pb-2`} size="large">
        <h1
          data-tinafield="title"
          className={`w-full relative	mb-8 text-4xl text-teal-700 font-semibold tracking-normal `}
        >
          {props.title}
        </h1>
        <div
          data-tinafield="author"
          className="flex items-center justify-center"
        >
          {props.author && (
            <>
              <div className="flex-shrink-0 mr-4">
                <img
                  className="h-14 w-14 object-cover rounded-full shadow-lg"
                  src={props.author.avatar}
                  alt={props.author.name}
                />
              </div>
              <p className="text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white">
                {props.author.name}
              </p>
              <span className="font-bold text-gray-200 dark:text-gray-500 mx-2">
                —
              </span>
            </>
          )}
          <p
            data-tinafield="date"
            className="text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150"
          >
            {formattedDate}
          </p>
        </div>
      </Container>
      {false && (
        <div className="px-4 w-full">
          <div
            data-tinafield="heroImg"
            className="relative max-w-4xl lg:max-w-5xl mx-auto"
          >
            <img
              src={props.heroImg}
              className="absolute z-0 block rounded-lg w-full h-auto blur-2xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light"
              aria-hidden="true"
            />
            <img
              src={props.heroImg}
              alt={props.title}
              className="relative z-1 mb-14 block rounded-lg w-full h-auto opacity-100"
            />
          </div>
        </div>
      )}
      <Container className={`flex-1 pt-4`} width="small" size="large">
        <div className="prose dark:prose-dark w-full max-w-none">
          <TinaMarkdown components={components} content={props._body} />
        </div>
      </Container>
    </Section>
  );
};
