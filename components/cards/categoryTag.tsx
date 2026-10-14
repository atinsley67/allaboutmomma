import React from "react";

export const CategoryTag = ({ category }) => (
  <div className="px-2 py-1">
    <span className="bg-gray-200 rounded-full px-3 py-1 pb-2 text-sm font-semibold text-gray-700 mr-2 mb-2">
      {category}
    </span>
  </div>
);
