import React from "react";
import { Container } from "../util/container";
import { Section } from "../util/section";
import { useTheme } from "../layout";
import format from "date-fns/format";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { Prism } from "tinacms/dist/rich-text/prism";
import type { TinaMarkdownContent, Components } from "tinacms/dist/rich-text";

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
    headers: any;
    rows: any;
  };
  youtube: {
    title: string;
    src: string;
  },
  table2: {
    data: string;
  }

  
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
    <div className="flex flex-col items-center justify-center">
      <img className="mb-3" src={props.url} alt={props.alt} />
      <div className="text-xs font-semibold text-gray-600">{props.caption}</div>
    </div>
  ), 
  h1: (props) => (
    <p>
      <h1 id={getTextContentForId(props.children)}>{props.children}</h1>
    </p>
  ),
  h2: (props) => (
    <p>
      <h2 id={getTextContentForId(props.children)}>{props.children}</h2>
    </p>
  ),
  h3: (props) => (
    <p>
      <h3 id={getTextContentForId(props.children)}>{props.children}</h3>
    </p>
  ),
  h4: (props) => (
    <p>
      <h4 id={getTextContentForId(props.children)}>{props.children}</h4>
    </p>
  ),
  a: (props) =>
  (
    <a
      href={props.url}
      rel={props.url.includes('amazon.com/') ? 'nofollow noopener' : null}
      >
        <strong>{props.children}</strong>
      </a>
  ),
  AffiliateLink: (props) => {
    const theme = useTheme();
    const buttonColorClasses = {
      blue: "text-white bg-blue-500 hover:bg-blue-600 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-400 hover:to-blue-500",
      teal: "text-white bg-teal-500 hover:bg-teal-600 bg-gradient-to-r from-teal-400 to-teal-600 hover:from-teal-400 hover:to-teal-500",
      green:
        "text-white bg-green-500 hover:bg-green-600 bg-gradient-to-r from-green-400 to-green-600 hover:from-green-400 hover:to-green-500",
      red: "text-white bg-red-500 hover:bg-red-600 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500",
      pink: "text-white bg-pink-500 hover:bg-pink-600 bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-400 hover:to-pink-500",
      purple:
        "text-white bg-purple-500 hover:bg-purple-600 bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-400 hover:to-purple-500",
      orange:
        "text-white bg-orange-500 hover:bg-orange-600 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-400 hover:to-orange-500",
      yellow:
        "text-gray-800 bg-yellow-500 hover:bg-yellow-600 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500",
    };


    // Extract image URL
    const imageUrl = props.image || props.affiliateURLs ? props.affiliateURLs.imageURL : ""
    // Extract link URL
    const linkUrl = props.affiliateURLs ? props.affiliateURLs.linkURL : ""
    const floatLeft = props.floatLeft

    if (linkUrl && imageUrl) {
      return (
        <>
          <div className={`flex ml-2 mr-6  mt-0 mb-6 justify-center items-center ${floatLeft ? 'md:float-left' : ''}`}>
            
              <a href={linkUrl}
                target="_blank"
                rel="nofollow noopener"
                className="no-underline">
                <div className="rounded-xl overflow-hidden shadow-lg bg-white justify-center flex flex-col items-center m-0">
                  <img decoding="async" src={imageUrl} className="border-0 m-0" alt="Amazon product image"/>
                  {props.caption &&
                    <div className="text-xs font-semibold text-gray-600">{props.caption}</div>
                  }
                  {props.button &&
                    <button
                      className={`mx-auto z-10 relative flex text-center px-7 py-3 font-semibold text-lg transition duration-150 ease-out  rounded-lg transform focus:shadow-outline focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 whitespace-nowrap ${
                          buttonColorClasses[theme.color]
                        }`}>
                      Check Amazon Price
                    </button>
                  }
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
    <p>
      <div className="border-2 border-gray-200 bg-gray-50 p-4">
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
    </p>
  ),

  Table: (props) => {

    if (!props.headers || props.headers.length === 0) {
      return <p>Table: No table content.</p>;
    } 

    return (
      <p>
        <table className="border-2 border-gray-200  p-4">
          <thead className="bg-gray-50">
            <tr>
              {props.headers.map((header, index) => (
                <th key={index} className="border-2 px-4 py-2 text-teal-700 font-s">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {props.rows && props.rows.length > 0 && props.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {row.cells && row.cells.length > 0 && row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-2 p-4 align-top">
                    <div className="whitespace-pre-wrap align-top">{cell.content && cell.content}</div>
                    {cell.affiliateSnippet &&
                      <div className="inline">
                        <a href={cell.affiliateSnippet.linkURL}
                            target="_blank"
                            rel="nofollow noopener"
                            className="no-underline">
                            <img decoding="async" className="inline m-2" src={cell.affiliateSnippet.imageURL} alt="Amazon product image"/>
                            <div>Check Price On Amazon</div>
                        </a>
          
                      </div>
                      }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </p>
    )
  },
  youtube: (props) => {
    return (
    <div className="flex flex-col items-center justify-center">
      <iframe width="768" height="432" src={props.src} title={props.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
    </div>
    )},
  table2: (props) => {


    const jsonData = props.data ? props.data.replace(/'/g, '"') : ""
    const parsedData = jsonData && jsonData.length > 0 ? JSON.parse(jsonData) : {}

    const headers = parsedData.headers;
    const rows = parsedData.rows;

    if (!headers || headers.length === 0) {
      return <p>Table: No table content.</p>;
    } 

    return (
      <div>
        <table className="border-2 border-gray-200  p-4">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="border-2 px-4 py-2 text-teal-600 font-s">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows && rows.length > 0 && rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {row.length > 0 && row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-2 p-4 align-top">
                    <div className="whitespace-pre-wrap align-top">{cell}</div>
                    {cell.affiliateSnippet &&
                      <div className="inline">
                        <a href={cell.affiliateSnippet.linkURL}
                            target="_blank"
                            rel="nofollow noopener"
                            className="no-underline">
                            <img decoding="async" className="inline m-2" src={cell.affiliateSnippet.imageURL} />
                            <div>Check Price On Amazon</div>
                        </a>
          
                      </div>
                      }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
    </table>
      </div>
    )
  }
}



export const Post = (props) => {
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
