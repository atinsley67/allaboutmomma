import React from "react";

const sectionColor = {
  default:
    "text-gray-800 bg-gradient-to-tl from-gray-50 via-transparent to-transparent",
  tint: "text-gray-900 bg-gradient-to-br from-gray-100 to-transparent",
  primary:
    "text-gray-800 bg-gradient-to-tl bg-gray-200 from-gray-300 via-transparent to-transparent",
};

export const Section = ({ children, color = "", className = "" }) => {
  const sectionColorCss = sectionColor[color] || sectionColor.default;

  return (
    <section
      className={`flex-1 relative transition duration-150 ease-out overflow-hidden ${sectionColorCss} ${className}`}
    >
      {children}
    </section>
  );
};
