import React from "react";
import { useTheme } from "../layout";

export const Section = ({ children, color = "", className = "" }) => {
  const theme = useTheme();
  const sectionColor = {
    default:
      "text-gray-800 dark:text-gray-50 bg-gradient-to-tl from-gray-50 dark:from-gray-900 via-transparent to-transparent",
    tint: "text-gray-900 dark:text-gray-100 bg-gradient-to-br from-gray-100 dark:from-gray-1000 to-transparent",
    primary: {
      blue: "text-white bg-blue-500 bg-gradient-to-br from-blue-500 to-blue-600",
      teal: "text-white bg-teal-500 bg-gradient-to-br from-teal-500 to-teal-600",
      green:
        "text-white bg-green-600 bg-gradient-to-br from-green-600 to-green-700",
      yellow:
        "text-white bg-yellow-500 bg-gradient-to-br from-yellow-500 to-yellow-600",
      orange:
        "text-white bg-orange-500 bg-gradient-to-br from-orange-500 to-orange-600",
      red: "text-white bg-red-500 bg-gradient-to-br from-red-500 to-red-600",
      pink: "text-white bg-pink-500 bg-gradient-to-br from-pink-500 to-pink-600",
      purple:
        "text-white bg-purple-500 bg-gradient-to-br from-purple-500 to-purple-600",
      white:
        "text-gray-800 dark:text-gray-50 bg-gradient-to-tl from-gray-50 dark:from-gray-900 via-transparent to-transparent",
      gray_400:
        "text-gray-800 dark:text-gray-50 bg-gradient-to-tl bg-gray-200 from-gray-300 dark:from-gray-900 via-transparent to-transparent",
      gray_600:
        "text-gray-800 dark:text-gray-50 bg-gradient-to-tl bg-gray-400 from-gray-500 dark:from-gray-900 via-transparent to-transparent",        
    },
  };
  const sectionColorCss =
    color === "primary"
      ? sectionColor.primary[theme.color]
      : sectionColor[color]
      ? sectionColor[color]
      : sectionColor.default;

  return (
    <section
      className={`flex-1 relative transition duration-150 ease-out body-font overflow-hidden ${sectionColorCss} ${className}`}
    >
      {children}
    </section>
  );
};
