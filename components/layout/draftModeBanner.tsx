import React, { useEffect, useState } from "react";

// Shown when an editor browses the site in draft mode (after opening the visual editor), so it's
// clear the pages include hidden posts and changes that aren't published yet. Not shown inside
// the visual editor's preview, where that's expected.
export const DraftModeBanner = () => {
  const [exitLink, setExitLink] = useState<string | null>(null);

  useEffect(() => {
    if (window.self !== window.top) return;
    setExitLink(`/api/draft?exit&slug=${encodeURIComponent(window.location.pathname)}`);
  }, []);

  if (!exitLink) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-teal-700 px-4 py-2 text-center text-sm text-white">
      Preview: you're seeing hidden posts and changes that aren't on the live site yet.{" "}
      <a href={exitLink} className="font-semibold text-white underline">
        Leave preview
      </a>
    </div>
  );
};
