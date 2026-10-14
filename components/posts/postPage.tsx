import React from "react";
import { tinaField } from "tinacms/dist/react";
import { Container } from "../util/container";
import { Section } from "../util/section";
import format from "date-fns/format";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import { postComponents } from "../rich-text";

export const PostPage = (props) => {

  const date = new Date(props.date);
  let formattedDate = "";
  if (!isNaN(date.getTime())) {
    formattedDate = format(date, "MMM dd, yyyy");
  }

  return (
    <Section className="flex-1">
      <Container width="small" className={`flex-1 pb-2`} size="large">
        <h1
          data-tina-field={tinaField(props, "title")}
          className={`w-full relative	mb-8 text-4xl text-teal-700 font-semibold tracking-normal `}
        >
          {props.title}
        </h1>
        <div
          data-tina-field={tinaField(props, "author")}
          className="flex items-center justify-center"
        >
          {props.author && (
            <>
              <div className="flex-shrink-0 mr-4">
                <img
                  className="h-14 w-14 object-cover rounded-full shadow-lg"
                  src={props.author.avatar}
                  alt={props.author.name}
                />
              </div>
              <p className="text-base font-medium text-gray-600 group-hover:text-gray-800 dark:text-gray-200 dark:group-hover:text-white">
                {props.author.name}
              </p>
              <span className="font-bold text-gray-200 dark:text-gray-500 mx-2">
                —
              </span>
            </>
          )}
          <p
            data-tina-field={tinaField(props, "date")}
            className="text-base text-gray-400 group-hover:text-gray-500 dark:text-gray-300 dark:group-hover:text-gray-150"
          >
            {formattedDate}
          </p>
        </div>
      </Container>
      <Container className={`flex-1 pt-4`} width="small" size="large">
        <div className="prose dark:prose-dark w-full max-w-none">
          <TinaMarkdown components={postComponents} content={props._body} />
        </div>
      </Container>
    </Section>
  );
};
