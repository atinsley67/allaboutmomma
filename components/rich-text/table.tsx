import React from "react";
import { cloudinaryImage } from "../../lib/cloudinary";

export type TableProps = {
  data: {
    headers: any;
    rows: any;
  }
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
                          loading="lazy"
                          src={cloudinaryImage(cell.affiliate.imageURL, 400)}
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
};
