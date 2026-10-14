// Inline image renderers. Posts, category descriptions and page content blocks currently
// style these differently (captions, height cap, spacing); kept separate so each renders as
// before. In their own file so the home page can use one without loading the other renderers.
import React from "react";
import { cloudinaryImage } from "../../lib/cloudinary";

export const PostImage = (props) => (
  <div className="flex flex-col items-center justify-center">
    <img className="mb-3 max-h-96 w-auto object-contain" loading="lazy" src={cloudinaryImage(props.url, 1200)} alt={props.alt}/>
    <div className="text-xs font-semibold text-gray-600">{props.caption}</div>
  </div>
);

export const CategoryImage = (props) => (
  <div className="flex items-center justify-center">
    <img loading="lazy" src={cloudinaryImage(props.url, 1200)} alt={props.alt} />
  </div>
);

export const ContentBlockImage = (props) => (
  <div className="flex flex-col items-center justify-center">
    <img className="mb-3" loading="lazy" src={cloudinaryImage(props.url, 1200)} alt={props.alt} />
    <div className="text-xs font-semibold text-gray-600">{props.caption}</div>
  </div>
);
