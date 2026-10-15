import Link from "next/link";
import { tinaField } from "tinacms/dist/react";
import * as React from "react";
import { BiRightArrowAlt } from "react-icons/bi";

const buttonClasses =
  "text-gray-800 bg-gray-400 hover:bg-gray-600 bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-400 hover:to-gray-500";
const invertedButtonClasses =
  "text-gray-500 bg-white hover:bg-gray-50 bg-gradient-to-r from-gray-50 to-white hover:to-gray-100";
const linkClasses =
  "text-gray-600 hover:text-gray-400";

export const Actions = ({
  parentColor = "default",
  className = "",
  actions,
}) => {

  return (
    <div className={`flex flex-wrap items-center gap-y-4 gap-x-6 ${className}`}>
      {actions &&
        actions.map(function (action, index) {
          let element = null;
          if (action.type === "button") {
            element = (
              <Link
                key={index}
                href={action.link ? action.link : "/"}
                data-tina-field={tinaField(action)}
                className={`z-10 relative flex text-center px-7 py-3 font-semibold text-lg transition duration-150 ease-out  rounded-lg transform focus:outline-none focus:ring-2 ring-offset-current ring-offset-2 whitespace-nowrap ${
                  parentColor === "primary" ? invertedButtonClasses : buttonClasses
                }`}
              >
                {action.label}
                {action.icon && (
                  <BiRightArrowAlt
                    className={`ml-1 -mr-1 w-6 h-6 opacity-80`}
                  />
                )}
              </Link>
            );
          }
          if (action.type === "link" || action.type === "linkExternal") {
            element = (
              <Link
                key={index}
                href={action.link ? action.link : "/"}
                data-tina-field={tinaField(action)}
                className={`group inline-flex items-center font-semibold text-lg transition duration-150 ease-out ${
                  parentColor === "primary"
                    ? `text-white  hover:text-gray-50`
                    : linkClasses
                }`}
                style={{
                  textShadow: `0 3px 7px rgba(var(--color-rgb-blue-400),0.2)`,
                }}>

                {action.label}
                {action.icon && (
                  <BiRightArrowAlt
                    className={`ml-0 mr-0 w-6 h-6 opacity-80`}
                  />
                )}

              </Link>
            );
          }
          return element;
        })}
    </div>
  );
};
