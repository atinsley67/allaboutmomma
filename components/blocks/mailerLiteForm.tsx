import React from "react";
import { Container } from "../util/container";import type { TinaTemplate } from "tinacms";

export const MailerLiteForm = ({ data, parentField = "" }) => {
  return (
    <Container size="small">
      <div className="mx-auto px-0 py-4 flex flex-wrap-reverse gap-5 gap-5 max-w-[1000px]">
        <div className="grow min-w-76">
          <h1 className="text-3xl text-teal-700 font-semibold pt-10">{data.title}</h1>
          <span>Email: <strong>{data.email}</strong></span>
        </div>
        <div className="grow min-w-76">
          <div className="ml-embedded" data-form="54PrxH"></div>
        </div>
      </div>
    </Container>
  );
};

export const mailerLiteFormBlockSchema: TinaTemplate = {
  name: "mailerLiteForm",
  label: "Mailer Lite Form",
  fields: [
    {
      type: "string",
      label: "Form ID",
      name: "formId",
    },
    {
      type: "string",
      label: "Title",
      name: "title",
    },
    {
      type: "string",
      label: "Contace Email Address",
      name: "email",
    },
  ],
};
