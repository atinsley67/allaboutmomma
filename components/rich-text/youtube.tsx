import React from "react";
import type { Template } from "tinacms";

export type YouTubeProps = {
  title: string;
  src: string;
};

export const YouTube = (props: YouTubeProps) => {
  return (
  <div className="flex flex-col items-center justify-center">
    <iframe className="w-full max-w-3xl h-auto aspect-video" loading="lazy" width="768" height="432" src={props.src} title={props.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>
  </div>
  )
};

export const youtubeTemplate: Template = {
  name: "youtube",
  label: "YouTube Video",
  fields: [
    {
      name: "title",
      label: "Title",
      type: "string",
    },
    {
      name: "src",
      label: "YouTube embed code 'src' URL",
      type: "string",
    }
  ]
};
