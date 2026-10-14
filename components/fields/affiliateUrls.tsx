import * as React from "react";

// Tina input for an affiliate link's URLs: paste a whole affiliate snippet, or edit
// the image and link URLs directly. Paired with the parse function in rich-text/affiliateLink.
export const AffiliateURLsInput = ({ field, input, meta }) => {
  const handleInputChange = (field, value, input, onChange) => {
    let updatedValue = {};

    switch (field) {
      case 'snippet':
        updatedValue = { snippet: value };
        break;
      case 'linkURL':
        updatedValue = { linkURL: value };
        break;
      case 'imageURL':
        updatedValue = { imageURL: value };
        break;
      default:
        break;
    }

    const mergedValue = { ...input.value, ...updatedValue };
    onChange(mergedValue);
  };
  return (
    <div>
      <label className="block font-sans text-xs font-semibold text-gray-700 whitespace-normal mb-2">
        {field.label}
      </label>
      <label className="text-xs">Affiliate Snippet</label>
      <input
        className="shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md"
        name="Snippet"
        id="snippet"
        type="string"
        // This will pass along props.input.onChange to set our form values as this input changes.
        onChange={(e) => handleInputChange("snippet", e.target.value, input, input.onChange)}
      />
      <label className="text-xs">Affiliate Image URL</label>
      <input
        className="shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md"
        name="ImageURL"
        id="imageURL"
        type="string"
        value={input.value.imageURL}
        // This will pass along props.input.onChange to set our form values as this input changes.
        onChange={(e) => handleInputChange("imageURL", e.target.value, input, input.onChange)}
      />
      <label className="text-xs">Affiliate Link URL</label>
      <input
        className="shadow-inner focus:shadow-outline focus:border-blue-500 focus:outline-none block text-base placeholder:text-gray-300 px-3 py-2 text-gray-600 w-full bg-white border border-gray-200 transition-all ease-out duration-150 focus:text-gray-900 rounded-md"
        name="LinkURL"
        id="linkURL"
        type="string"
        value={input.value.linkURL}
        // This will pass along props.input.onChange to set our form values as this input changes.
        onChange={(e) => handleInputChange("linkURL", e.target.value, input, input.onChange)}
      />
    </div>
  );
};
