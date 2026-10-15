import React from "react";
import Link from "next/link";
import { cloudinaryImage } from "../../lib/cloudinary";
import { CategoryTag } from "./categoryTag";

// Horizontal post card used in category listings and search results.
// Category listings pad and wrap the category tags; search results don't.
const VARIANTS = {
  category: { tagsWrapper: "px-6 pt-4 pb-2 flex flex-wrap" },
  search: { tagsWrapper: null },
};

type PostListCardProps = {
  variant: keyof typeof VARIANTS;
  filename: string;
  title: string;
  heroImg?: string;
  intro?: string;
  categories?: string[];
};

export const PostListCard = ({ variant, filename, title, heroImg, intro, categories }: PostListCardProps) => {
  const { tagsWrapper } = VARIANTS[variant];
  const tags = categories?.map((category) => <CategoryTag key={category} category={category} />);

  return (
    <Link href={`/${filename}`}>
      <div className="flex justify-center">
        <div
          className="flex flex-col rounded-lg bg-white shadow-lg sm:flex-row">
          <img
            className="h-64 w-full rounded-t-lg object-cover sm:h-auto sm:w-48 sm:rounded-none sm:rounded-l-lg"
            loading="lazy"
            src={cloudinaryImage(heroImg, 600)}
            alt={title} />
          <div className="flex flex-col justify-start p-6">
            <h5
              className="mb-2 text-xl font-medium">
              {title}
            </h5>
            <p className="mb-4 text-base">
              {intro}
            </p>
            {tagsWrapper ? <div className={tagsWrapper}>{tags}</div> : tags}
          </div>
        </div>
      </div>
    </Link>
  );
};
