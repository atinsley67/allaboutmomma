// Tina templates for the rich-text inserts, assembled per collection.
// Imported only by tina/config: some templates pull in Tina admin-only editor components.
import { affiliateLinkTemplate } from "./affiliateLink";
import { blockQuoteTemplate } from "./blockQuote";
import { outlineBoxTemplate } from "./outlineBox";
import { tableTemplate } from "./tableTemplate";
import { tableOfContentsTemplate } from "./tableOfContents";
import { youtubeTemplate } from "./youtube";

// Template order is what the Tina editor lists in its insert menu
export const postTemplates = [
  blockQuoteTemplate,
  outlineBoxTemplate,
  affiliateLinkTemplate,
  tableOfContentsTemplate,
  tableTemplate,
  youtubeTemplate,
];

export const categoryTemplates = [blockQuoteTemplate];
