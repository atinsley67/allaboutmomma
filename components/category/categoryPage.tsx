import React from "react";
import { tinaField } from "tinacms/dist/react";
import { Container } from "../util/container";
import { Section } from "../util/section";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { cloudinaryImage } from "../../lib/cloudinary";
import { categoryComponents } from "../rich-text";
import { PostListCard } from "../cards/postListCard";

export const CategoryPage = (props) => {
  return (
    <Section className="flex-1">
      <Container className={`flex-1 pb-2`} size="small">
        <h1
          data-tina-field={tinaField(props.category, "title")}
          className={`w-full relative	mb-8 text-4xl text-teal-700 font-semibold tracking-normal `}
        >
          {props.category.title}
        </h1>

      {props.category.heroImg && (
          <div className="relative"
          >
            <img
              className="absolute z-0 w-full rounded-lg max-w-none h-[18rem]  blur-xl brightness-150 contrast-[0.9] dark:brightness-150 saturate-200 opacity-50 dark:opacity-30 mix-blend-multiply dark:mix-blend-hard-light h-[20rem] object-cover object-center"
              src={cloudinaryImage(props.category.heroImg, 1600)}
              aria-hidden="true"
            />
            <img
              className="relative z-1 w-full rounded-lg max-w-none h-[18rem] object-cover object-center"
              alt={props.category.title}
              src={cloudinaryImage(props.category.heroImg, 1600)}
            />
            <div className="absolute inset-0 bg-gray-600 bg-opacity-30 w-full h-full rounded-lg"></div>
          </div>
      )}
      </Container>
      <Container className={`flex-1 pt-4`} width="medium" size="small">
        <div className="prose dark:prose-dark w-full max-w-none pt-6">
          <TinaMarkdown components={categoryComponents} content={props.category._body} />
        </div>
      </Container>
      <Container size="small" className={`flex flex-wrap gap-x-10 gap-y-8 text-left`}>
        {props.postConnection.edges.map(({ node: post }) => (
          <PostListCard
            key={post._sys.filename}
            variant="category"
            filename={post._sys.filename}
            title={post.title}
            heroImg={post.heroImg}
            intro={post.intro}
            categories={post.categories}
          />
        ))}
      </Container>
    </Section>
  );
};
