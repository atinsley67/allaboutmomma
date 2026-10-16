// The nightly rebuild, called by Vercel Cron (vercel.json, 08:00-09:00 UTC). It triggers the
// production Deploy Hook, so the live site gets fresh Amazon data, plus anything saved in Tina
// since the last publish. Saves don't trigger builds themselves ("deploymentEnabled" in vercel.json).
//
// Needs two environment variables: CRON_SECRET, which Vercel sends with the request, and
// DEPLOY_HOOK_URL, the Deploy Hook for main (Settings > Git > Deploy Hooks).
import type { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const hook = process.env.DEPLOY_HOOK_URL;
  if (!hook) {
    console.error("Nightly rebuild: DEPLOY_HOOK_URL isn't set");
    return res.status(500).json({ message: "DEPLOY_HOOK_URL isn't set" });
  }

  // Vercel cancels an earlier deployment from the same hook for the same commit, so a repeated
  // invocation doesn't build twice
  const response = await fetch(hook, { method: "POST" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error(`Nightly rebuild: deploy hook failed (${response.status})`, body);
    return res.status(502).json({ message: "Deploy hook failed" });
  }
  console.log(`Nightly rebuild started: job ${body.job?.id ?? "?"}`);
  return res.status(200).json({ started: true, job: body.job?.id ?? null });
};

export default handler;
