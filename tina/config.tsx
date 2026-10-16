import { defineConfig } from "tinacms";
import { contentBlockSchema } from "../components/blocks/content";
import { featureBlockSchema } from "../components/blocks/features";
import { featuredPostsBlockSchema } from "../components/blocks/featuredPosts";
import { heroBlockSchema } from "../components/blocks/hero";
import { testimonialBlockSchema } from "../components/blocks/testimonial";
import { mailerLiteFormBlockSchema } from "../components/blocks/mailerLiteForm";
import { postTemplates, categoryTemplates } from "../components/rich-text/templates";
import { editorModeSwitch } from "../components/fields/editorModeSwitch";

// Must match the filenames in content/categories
const CATEGORIES = ["baby", "momma", "pregnancy", "toddler", "travel"];

const POSTS_PATH = "content/posts";

// Where a post is shown on the site (used for the visual editor's preview)
const postPath = (filename: string) => `/${filename}`;

// Autosave: localStorage writes are debounced so typing doesn't serialise the whole post per keystroke
let autosaveTimer: ReturnType<typeof setTimeout> | undefined;

// The visual editor previews pages in Next.js draft mode, so hidden posts and posts written since
// the last build render (see pages/api/draft.ts). It's switched on once per visit, by showing the
// site the editor's Tina login.
let editorCms;
let draftMode: Promise<void> | undefined;
function enableDraftMode() {
  draftMode ??= (async () => {
    try {
      const token = await editorCms?.api?.tina?.authProvider?.getAccessToken();
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`draft mode refused (${res.status})`);
    } catch (error) {
      console.warn(`Draft mode: ${error.message}; hidden and new posts won't preview`);
      draftMode = undefined; // try again with the next document
    }
  })();
  return draftMode;
}

const config = defineConfig({
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID!,
  branch:
    process.env.NEXT_PUBLIC_TINA_BRANCH! || // custom branch env override
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF! || // Vercel branch env
    process.env.HEAD!, // Netlify branch env
  token: process.env.TINA_TOKEN!,
  media: {
    // this is the config for the tina cloud media store
    //tina: {
    //  publicFolder: "public",
    //  mediaRoot: "uploads",
    //},
    // If you wanted cloudinary do this
    loadCustomStore: async () => {
      const pack = await import("next-tinacms-cloudinary");
      return pack.TinaCloudCloudinaryMediaStore;
    },
  },
  cmsCallback: (cms) => {
    editorCms = cms;

    cms.events.subscribe('plugin:add:screen', (payload) => {
      // Perform actions when the form is saved
      const sessionIdentifier = `session_${Date.now()}` // Generate a unique session identifier
      sessionStorage.setItem('tinaEditSessionIdentifier', sessionIdentifier); // Store the session identifier in sessionStorage
    })

    return cms
  },
  build: {
    publicFolder: "public", // The public asset folder for your framework
    outputFolder: "admin", // within the public folder
  },
  schema: {
    collections: [
      {
        label: "Blog Posts",
        name: "post",
        path: POSTS_PATH,
        format: "mdx",
        // New posts stay off the live site until they're unhidden, so a half-written post isn't
        // published by the next build
        defaultItem: () => ({ hidden: true }),
        ui: {
          // Opens posts in the visual editor with a live preview
          router: async ({ document }) => {
            await enableDraftMode();
            return postPath(document._sys.filename);
          },
        },
        fields: [
          {
            // Not content: a link to switch between the full-screen and visual editors.
            // displayOnly fields are never saved to the post.
            type: "displayOnly",
            label: "Editor",
            name: "editorMode",
            ui: {
              component: editorModeSwitch("post", POSTS_PATH, postPath),
            },
          },
          {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true,
          },
          {
            type: "boolean",
            label: "Hidden from site",
            name: "hidden",
            description:
              "Hidden posts aren't on the live site, in post lists or in search, but show in previews. Turning this on for a post that's already live takes it off the site at the next build, including the nightly one.",
          },
          {
            type: "string",
            label: "Description",
            name: "description",
          },
          {
            type: "string",
            name: "categories",
            label: "Categories",
            list: true,
            options: CATEGORIES,
          },
          {
            type: "image",
            name: "heroImg",
            label: "Hero Image",
          },
          {
            type: "rich-text",
            label: "Excerpt",
            name: "excerpt",
          },
          {
            type: "reference",
            label: "Author",
            name: "author",
            collections: ["author"],
          },
          {
            type: "datetime",
            label: "Posted Date",
            name: "date",
            ui: {
              dateFormat: "MMMM DD YYYY",
              timeFormat: "hh:mm A",
            },
          },
          {
            type: "rich-text",
            label: "Body",
            name: "_body",
            ui: {
              parse: (val) => {
                const sessionIdentifier = sessionStorage.getItem('tinaEditSessionIdentifier');
                const urlIdentifier = document.URL;

                const storageKey = `tinaEditBlogBody_${urlIdentifier}`;

                const savedDataWithSession = localStorage.getItem(storageKey);

                if (savedDataWithSession) {
                  const { session, data } = JSON.parse(savedDataWithSession);

                  if (session !== sessionIdentifier && data !== JSON.stringify(val)) {
                    const restoreAutoSaved = confirm('Auto-saved data found. Do you want to restore it?');

                    if (restoreAutoSaved) {
                      localStorage.setItem(storageKey, JSON.stringify({ session: sessionIdentifier, data }));
                      return (JSON.parse(data));
                    } else {
                      localStorage.removeItem(storageKey);
                    }
                  }
                }

                clearTimeout(autosaveTimer);
                autosaveTimer = setTimeout(() => {
                  localStorage.setItem(storageKey, JSON.stringify({ session: sessionIdentifier, data: JSON.stringify(val) }));
                }, 1000);
                return (val)
              },
            },
            templates: postTemplates,
            isBody: true,
          },
        ],
      },
      {
        label: "Global",
        name: "global",
        path: "content/global",
        format: "json",
        ui: {
          global: true,
        },
        fields: [
          {
            type: "object",
            label: "Header",
            name: "header",
            fields: [
              {
                type: "string",
                label: "Name",
                name: "name",
              },
              {
                type: "object",
                label: "Nav Links",
                name: "nav",
                list: true,
                ui: {
                  itemProps: (item) => {
                    return { label: item?.label };
                  },
                  defaultItem: {
                    href: "home",
                    label: "Home",
                  },
                },
                fields: [
                  {
                    type: "string",
                    label: "Link",
                    name: "href",
                  },
                  {
                    type: "string",
                    label: "Label",
                    name: "label",
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            label: "Footer",
            name: "footer",
            fields: [
              {
                type: "object",
                label: "Nav Links",
                name: "nav",
                list: true,
                ui: {
                  itemProps: (item) => {
                    return { label: item?.label };
                  },
                },
                fields: [
                  {
                    type: "string",
                    label: "Link",
                    name: "href",
                  },
                  {
                    type: "string",
                    label: "Label",
                    name: "label",
                  },
                ],
              },
              {
                type: "object",
                label: "Social Links",
                name: "social",
                fields: [
                  {
                    type: "string",
                    label: "Facebook",
                    name: "facebook",
                  },
                  {
                    type: "string",
                    label: "Twitter",
                    name: "twitter",
                  },
                  {
                    type: "string",
                    label: "Instagram",
                    name: "instagram",
                  },
                  {
                    type: "string",
                    label: "Pinterest",
                    name: "pinterest",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        label: "Authors",
        name: "author",
        path: "content/authors",
        format: "md",
        fields: [
          {
            type: "string",
            label: "Name",
            name: "name",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            label: "Avatar",
            name: "avatar",
          },
        ],
      },
      {
        label: "Pages",
        name: "page",
        path: "content/pages",
        ui: {
          router: async ({ document }) => {
            await enableDraftMode();
            return document._sys.filename === "home" ? `/` : `/${document._sys.filename}`;
          },
        },
        fields: [
          {
            type: "string",
            label: "Title",
            name: "title",
            description:
              "The title of the page. This is used to display the title in the CMS",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            label: "Description",
            name: "description",
          },
          {
            type: "image",
            name: "heroImg",
            label: "Hero Image",
          },
          {
            type: "object",
            list: true,
            name: "blocks",
            label: "Sections",
            ui: {
              visualSelector: true,
            },
            templates: [
              heroBlockSchema,
              // @ts-ignore
              featureBlockSchema,
              // @ts-ignore
              featuredPostsBlockSchema,
              contentBlockSchema,
              testimonialBlockSchema,
              mailerLiteFormBlockSchema,
            ],
          },
        ],
      },
      {
        label: "Categories",
        name: "category",
        path: "content/categories",
        format: "mdx",
        ui: {
          router: async ({ document }) => {
            await enableDraftMode();
            return `/category/${document._sys.filename}`;
          },
        },
        fields: [
          {
            type: "string",
            label: "Title",
            name: "title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            label: "Description",
            name: "description",
          },
          {
            type: "string",
            label: "Category",
            name: "category",
            required: true, 
          },
          {
            type: "image",
            name: "heroImg",
            label: "Hero Image",
          },
          {
            type: "rich-text",
            label: "Body",
            name: "_body",
            templates: categoryTemplates,
            isBody: true,
          },
        ],
      },
    ],
  },
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN,
      stopwordLanguages: ['eng']
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100
  },
});

export default config;
