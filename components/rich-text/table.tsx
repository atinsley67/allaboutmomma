import React from "react";
import { cloudinaryImage } from "../../lib/cloudinary";
import { amazonProductUrl, extractAsin } from "../../lib/asin.mjs";
import { useAmazonProduct } from "../../lib/useAmazonProduct";

export type TableProps = {
  data: {
    headers: any;
    rows: any;
  }
};

// Some imported cells hold "MISSING" where a URL was never found
const storedURL = (url: string | undefined) => (url && url !== "MISSING" ? url : "");

// A cell's affiliate product. `affiliate.amazon` is set at build time by lib/amazon (null if
// there's no fetched product) and missing in the visual editor.
const AffiliateCell = ({ affiliate }) => {
  const asin = affiliate.asin || extractAsin(affiliate.linkURL);
  const amazon = useAmazonProduct(asin, affiliate.amazon);
  // Stored URLs for a different product than the ASIN are left over from before it was changed
  const stored = !affiliate.asin || extractAsin(affiliate.linkURL) === affiliate.asin;
  const linkURL = amazon?.url || (stored && storedURL(affiliate.linkURL)) || (asin ? amazonProductUrl(asin) : "");
  const imageURL = amazon?.imageURL || (stored && storedURL(affiliate.imageURL)) || "";

  if (!linkURL && !imageURL) return null;
  return (
    <div className="flex flex-col items-center justify-center">
      <a
        href={linkURL || undefined}
        target="_blank"
        rel="sponsored nofollow noopener"
        className="no-underline"
      >
        {imageURL ? (
          <img
            decoding="async"
            className="block mx-auto m-2 max-w-xxxs md:max-w-xxs"
            loading="lazy"
            src={cloudinaryImage(imageURL, 400)}
            alt={affiliate.caption || affiliate.amazon?.title || "Product image"}
          />
        ) : amazon === undefined && (
          // Only in the visual editor: while a product added since the last build is looked up, or if Amazon doesn't know it
          <div className="m-2 italic text-gray-500">Looking up the product on Amazon. If this stays, check the Amazon Product field.</div>
        )}
        <div className="text-center">{affiliate.caption || (!imageURL && "Check Amazon Price")}</div>
      </a>
    </div>
  );
};

export const Table = (props: TableProps) => {

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
                  {cell.affiliate && <AffiliateCell affiliate={cell.affiliate} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};
