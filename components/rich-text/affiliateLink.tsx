import React from "react";
import type { Template } from "tinacms";
import { cloudinaryImage } from "../../lib/cloudinary";
import { AffiliateURLsInput } from "../fields/affiliateUrls";

export type AffiliateLinkProps = {
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

export const AffiliateLink = (props: AffiliateLinkProps) => {
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
                  <img decoding="async" loading="lazy" src={cloudinaryImage(imageURL, 600)} className="border-0" alt={props.altText || props.caption || "Product image"}/>
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
};

export const affiliateLinkTemplate: Template = {
  name: "AffiliateLink",
  label: "Affiliate Link",
  fields: [
    {
      name: "altText",
      label: "Alt Text",
      type: "string",
    },
    {
      name: "affiliateURLs",
      label: "Affiliate URLs",
      type: "object",
      fields: [
        {
          name: "linkURL",
          type: "string",
        },
        {
          name: "imageURL",
          type: "string",
        }
      ],
      ui: {
        parse: (val) => {
          if (val.snippet) {
            // Execute existing code for snippet
            const imageMatch = val.snippet.match(/<img.*?src="(.*?)"/);
            const imageSnippet = imageMatch ? imageMatch[1].replace(/&amp;/g, '&') : null;
            const linkMatch = val.snippet.match(/<a.*?href="(.*?)"/);
            const linkSnippet = linkMatch ? linkMatch[1].replace(/&amp;/g, '&') : null;

            return {
              linkURL: linkSnippet,
              imageURL: imageSnippet,
            };
          } else {
            // Update linkURL or imageURL
            const updatedValue = {} as any;
            if (val.linkURL) {
              updatedValue.linkURL = val.linkURL;
            }

            if (val.imageURL) {
              updatedValue.imageURL = val.imageURL;
            }

            return {
              ...val,
              ...updatedValue,
            };
          }
        },
        component: AffiliateURLsInput,
      }
    },
    {
      name: "image",
      label: "Image",
      type: "image",
    },
    {
      label: "Button",
      name: "button",
      type: "boolean",
    },
    {
      label: "Caption",
      name: "caption",
      type: "string",
    },
    {
      label: "Float Left",
      name: "floatLeft",
      type: "boolean",
    },
  ],
};
