// Switches Next.js draft mode on for editors, so hidden posts and posts written since the last
// build render on request (see lib/hidden.ts). The visual editor calls it with the editor's Tina
// login (tina/config.tsx); /api/draft?exit&slug=/some-post switches it off again.
import type { NextApiHandler } from "next";
import { isAuthorized } from "@tinacms/auth";

// Only a path on this site, so the exit link can't be used to send someone elsewhere
const safeSlug = (slug: unknown) => (typeof slug === "string" && /^\/(?!\/)/.test(slug) ? slug : "/");

const handler: NextApiHandler = async (req, res) => {
  if (req.method === "GET" && "exit" in req.query) {
    res.setDraftMode({ enable: false });
    return res.redirect(safeSlug(req.query.slug));
  }
  if (req.method !== "POST") return res.status(405).end();

  if (process.env.NODE_ENV !== "development") {
    try {
      const user = await isAuthorized(req, process.env.NEXT_PUBLIC_TINA_CLIENT_ID);
      if (!user?.verified) return res.status(401).json({ message: "Not logged in to Tina" });
    } catch (error) {
      console.error(error);
      return res.status(502).json({ message: "Couldn't check the Tina login" });
    }
  }

  res.setDraftMode({ enable: true });
  return res.status(204).end();
};

export default handler;
