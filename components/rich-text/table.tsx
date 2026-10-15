import React from "react";
import { cloudinaryImage } from "../../lib/cloudinary";
import { amazonProductUrl } from "../../lib/asin.mjs";

export type TableProps = {
  data: {
    headers: any;
    rows: any;
  }
};

// Some imported cells hold "MISSING" where a URL was never found
const storedURL = (url: string | undefined) => (url && url !== "MISSING" ? url : "");

// A cell's affiliate product. `amazon` is set at build time by lib/amazon (null if there's no
// fetched product) and missing in the visual editor.
function affiliateProduct(affiliate) {
  return {
    linkURL: affiliate.amazon?.url || storedURL(affiliate.linkURL) || (affiliate.asin ? amazonProductUrl(affiliate.asin) : ""),
    imageURL: affiliate.amazon?.imageURL || storedURL(affiliate.imageURL),
    inEditor: affiliate.amazon === undefined,
  };
}

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
              {row.cells && row.cells.length > 0 && row.cells.map((cell, cellIndex) => {
                const product = cell.affiliate && affiliateProduct(cell.affiliate);
                return (
                <td key={cellIndex} className="border-2 p-1 md:p-2 align-top text-xxs sm:text-xs md:text-sm">
                  <div className="whitespace-pre-wrap align-top">{cell.content && cell.content}</div>
                  {(product?.linkURL || product?.imageURL) && (
                    <div className="flex flex-col items-center justify-center">
                      <a
                        href={product.linkURL || undefined}
                        target="_blank"
                        rel="sponsored nofollow noopener"
                        className="no-underline"
                      >
                        {product.imageURL ? (
                          <img
                            decoding="async"
                            className="block mx-auto m-2 max-w-xxxs md:max-w-xxs"
                            loading="lazy"
                            src={cloudinaryImage(product.imageURL, 400)}
                            alt={cell.affiliate.caption || cell.affiliate.amazon?.title || "Product image"}
                          />
                        ) : product.inEditor && (
                          <div className="m-2 italic text-gray-500">Product image is filled in when published</div>
                        )}
                        <div className="text-center">{cell.affiliate.caption || (!product.imageURL && "Check Amazon Price")}</div>
                      </a>
                    </div>
                  )}
                </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};
