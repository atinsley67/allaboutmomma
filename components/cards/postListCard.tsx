import React from "react";
import Link from "next/link";
import { cloudinaryImage } from "../../lib/cloudinary";
import { CategoryTag } from "./categoryTag";

// Horizontal post card used in category listings and search results.
// The two placements differ slightly; the variants keep each rendering as before.
const VARIANTS = {
  category: { width: "md:w-xxl", tagsWrapper: "px-6 pt-4 pb-2 flex flex-wrap justify-left" },
  search: { width: "md:max-w-xxl", tagsWrapper: null },
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
  const { width, tagsWrapper } = VARIANTS[variant];
  const tags = categories?.map((category) => <CategoryTag key={category} category={category} />);

  return (
    <Link href={`/${filename}`}>
      <div className="flex justify-center">
        <div
          className={`flex flex-col rounded-lg bg-white shadow-lg dark:bg-neutral-700 ${width} sm:flex-row`}>
          <img
            className="h-64 w-full rounded-t-lg object-cover sm:h-auto sm:w-48 sm:rounded-none sm:rounded-l-lg"
            loading="lazy"
            src={cloudinaryImage(heroImg, 600)}
            alt={title} />
          <div className="flex flex-col justify-start p-6">
            <h5
              className="mb-2 text-xl font-medium text-neutral-800 dark:text-neutral-50">
              {title}
            </h5>
            <p className="mb-4 text-base text-neutral-600 dark:text-neutral-200">
              {intro}
            </p>
            {tagsWrapper ? <div className={tagsWrapper}>{tags}</div> : tags}
          </div>
        </div>
      </div>
    </Link>
  );
};
