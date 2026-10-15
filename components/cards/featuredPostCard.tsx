import React from "react";
import { tinaField } from "tinacms/dist/react";
import { cloudinaryImage } from "../../lib/cloudinary";
import { getIntro } from "../../lib/intro";
import { CategoryTag } from "./categoryTag";

// Grid card for the Featured Posts block; `data` is one item of that block
export const FeaturedPostCard = ({ data }) => {
  const post = data?.post;
  if (!post) {
    return null;
  }
  // Precomputed at build time; in Tina's visual editor the live query returns the body instead
  const intro = post.intro ?? (post._body ? getIntro(post._body, 50) : null);

  return (
    <div>
    <a href={`/${post._sys.filename}`}>
      <div
        data-tina-field={tinaField(data)}
        className="rounded-xl overflow-hidden shadow-lg h-full"
      >
        <img className="w-full h-80 object-cover object-center" loading="lazy" src={cloudinaryImage(post.heroImg, 800)} alt={post.title}/>
        <div className="px-6 pt-4 pb-2">
          {post.title && (
            <h3 className="text-2xl font-semibold">
              {post.title}
            </h3>
          )}
          {intro && (
            <div className="text-base opacity-80 leading-relaxed">
              {intro}
            </div>
          )}
        </div>
        <div className="px-6 pt-4 pb-2 flex flex-wrap justify-center">
          {post.categories && post.categories.map((category) => (
            <CategoryTag key={category} category={category} />
          ))}
        </div>
      </div>
    </a>
    </div>
  );
};
