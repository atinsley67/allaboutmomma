import React from "react";
import { tinaField } from "tinacms/dist/react";
import type { ContentQueryQuery } from "../tina/__generated__/types";
import { Content } from "./blocks/content";
import { Features } from "./blocks/features";
import { FeaturedPosts } from "./blocks/featuredPosts"
import { Hero } from "./blocks/hero";
import { Testimonial } from "./blocks/testimonial";
import { MailerLiteForm } from "./blocks/mailerLiteForm";

export const Blocks = (props: ContentQueryQuery["page"]) => {
  return (
    <>
      {props.blocks
        ? props.blocks.map(function (block, i) {
            switch (block.__typename) {
              case "PageBlocksContent":
                return (
                  <div
                    data-tina-field={tinaField(block)}
                    key={i + block.__typename}
                  >
                    <Content data={block} />
                  </div>
                );
              case "PageBlocksHero":
                return (
                  <div
                    data-tina-field={tinaField(block)}
                    key={i + block.__typename}
                  >
                    <Hero data={block} />
                  </div>
                );
              case "PageBlocksFeatures":
                return (
                  <div
                    data-tina-field={tinaField(block)}
                    key={i + block.__typename}
                  >
                    <Features data={block} />
                  </div>
                );
              case "PageBlocksFeaturedPosts":
                return (
                  <div
                    data-tina-field={tinaField(block)}
                    key={i + block.__typename}
                  >
                    <FeaturedPosts data={block} />
                  </div>
                );
              case "PageBlocksTestimonial":
                return (
                  <div
                    data-tina-field={tinaField(block)}
                    key={i + block.__typename}
                  >
                    <Testimonial data={block} />
                  </div>
                );
              case "PageBlocksMailerLiteForm":
                  return (
                    <div
                      data-tina-field={tinaField(block)}
                      key={i + block.__typename}
                    >
                      <MailerLiteForm data={block} />
                    </div>
                );
              default:
                return null;
            }
          })
        : null}
    </>
  );
};
