// Rich-text renderers, assembled per collection. Each insertable component lives in its own
// file with its renderer and Tina template; the templates are assembled in ./templates.
import type { Components } from "tinacms/dist/rich-text";
import { AffiliateLink, type AffiliateLinkProps } from "./affiliateLink";
import { BlockQuote, type BlockQuoteProps } from "./blockQuote";
import { OutlineBox, type OutlineBoxProps } from "./outlineBox";
import { Table, type TableProps } from "./table";
import { TableOfContents, type TableOfContentsProps } from "./tableOfContents";
import { YouTube, type YouTubeProps } from "./youtube";
import { CodeBlock, H1, H2, H3, H4, PostLink, type PostLinkProps } from "./elements";
import { CategoryImage, PostImage } from "./images";

export const postComponents: Components<{
  OutlineBox: OutlineBoxProps;
  BlockQuote: BlockQuoteProps;
  AffiliateLink: AffiliateLinkProps;
  TableOfContents: TableOfContentsProps;
  a: PostLinkProps;
  Table: TableProps;
  youtube: YouTubeProps;
}> = {
  code_block: CodeBlock,
  OutlineBox,
  BlockQuote,
  img: PostImage,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  a: PostLink,
  AffiliateLink,
  TableOfContents,
  Table,
  youtube: YouTube,
};

export const categoryComponents: Components<{
  BlockQuote: BlockQuoteProps;
}> = {
  code_block: CodeBlock,
  BlockQuote,
  img: CategoryImage,
};
