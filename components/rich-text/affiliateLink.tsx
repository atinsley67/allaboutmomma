import React from "react";
import type { Template } from "tinacms";
import { cloudinaryImage } from "../../lib/cloudinary";
import { ASIN, amazonProductUrl, extractAsin, findAsin } from "../../lib/asin.mjs";
import type { AmazonProduct } from "../../lib/amazon";
import { AffiliateURLsInput } from "../fields/affiliateUrls";

export type AffiliateLinkProps = {
  altText: string;
  asin?: string;
  affiliateURLs: {
    imageURL: string;
    linkURL: string;
  }
  // Fetched product, set at build time by lib/amazon: null if there's none, missing in the visual editor
  amazon?: AmazonProduct | null;
  imageURL: string;
  linkURL: string;
  image: string;
  button: boolean;
  caption: string;
  floatLeft: boolean;
};

export const AffiliateLink = (props: AffiliateLinkProps) => {
  // Stored URLs for a different product than the ASIN are left over from before it was changed
  const stored = !props.asin || extractAsin(props.affiliateURLs?.linkURL) === props.asin ? props.affiliateURLs : undefined
  // An uploaded image takes precedence; fetched Amazon data over the URLs stored in the post
  const imageURL = props.image || props.amazon?.imageURL || stored?.imageURL || ""
  const linkURL = props.amazon?.url || stored?.linkURL || (props.asin ? amazonProductUrl(props.asin) : "")
  const floatLeft = props.floatLeft

  if (linkURL && !imageURL && props.amazon === undefined) {
    return (
      <div className={`flex ml-2 mr-6 mt-0 mb-6 justify-center items-center ${floatLeft ? 'md:float-left' : ''}`}>
        <div className="flex min-h-[11rem] min-w-[11rem] items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-4 text-center text-xs italic text-gray-500">
          Product image and link are filled in when published
        </div>
      </div>
    )
  }

  if (linkURL) {
    return (
      <>
        <div className={`flex ml-2 mr-6  mt-0 mb-6 justify-center items-center ${floatLeft ? 'md:float-left' : ''}`}>

            <a href={linkURL}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="no-underline">
              <div className="rounded-xl overflow-hidden shadow-lg bg-white justify-center flex flex-col items-center m-0  min-w-[11rem] ">
                {imageURL &&
                  <div className="flex flex-col justify-end min-h-[11rem]">
                    <img decoding="async" loading="lazy" src={cloudinaryImage(imageURL, 600)} className="border-0" alt={props.altText || props.caption || props.amazon?.title || "Product image"}/>
                  </div>
                }
                <div className="min-h-[1rem]">
                {props.caption &&
                  <div className="text-xs font-semibold text-gray-600">{props.caption}</div>
                }
                  {/* Without an image the button is all there is to click */}
                  {(props.button || !imageURL) &&
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
      name: "asin",
      label: "Amazon Product",
      description:
        "Paste the product's Amazon link, a SiteStripe snippet or its ASIN. The image and link are filled in when the site is published.",
      type: "string",
      ui: {
        // Keep just the ASIN from whatever was pasted
        parse: (value) => findAsin(value) ?? value,
        validate: (value) =>
          value && !ASIN.test(value)
            ? "No Amazon product found. Paste the full amazon.com product link (short amzn.to links won't work) or the 10-character ASIN."
            : undefined,
      },
    },
    {
      name: "altText",
      label: "Alt Text",
      type: "string",
    },
    {
      name: "affiliateURLs",
      label: "Affiliate URLs (optional, used when Amazon data isn't available)",
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
