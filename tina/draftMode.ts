// The editor previews pages in Next.js draft mode, so hidden posts and posts written since the
// last build render (see pages/api/draft.ts). It's switched on once per visit, by showing the
// site the editor's Tina login: before the visual editor loads a page, and before the "Preview page"
// link opens one.

let editorCms;
let draftMode: Promise<void> | undefined;

// Called from cmsCallback, which is where the editor's CMS (and its Tina login) is available
export function setEditorCms(cms) {
  editorCms = cms;
}

export function enableDraftMode() {
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
      draftMode = undefined; // try again next time
    }
  })();
  return draftMode;
}
