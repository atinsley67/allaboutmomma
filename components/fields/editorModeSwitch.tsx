import * as React from "react";

// A link at the top of a document's form that switches between Tina's two editors:
// the full-screen form ("author mode", best for long posts) and the visual editor with live
// preview ("tweaks mode"). It's a field that never calls onChange, so nothing is ever saved.
export const editorModeSwitch = (
  collection: string,
  collectionPath: string,
  previewPath: (filename: string) => string
) =>
  ({ tinaForm, form }) => {
    // tinaForm.relativePath includes the collection folder, e.g. "content/posts/my-post.mdx"
    const filename = String(tinaForm?.relativePath || "")
      .replace(`${collectionPath}/`, "")
      .replace(/\.mdx?$/, "");
    if (!filename) return null;

    const inVisualEditor = window.location.hash.startsWith("#/~");
    const target = inVisualEditor
      ? `#/collections/edit/${collection}/${filename}`
      : `#/~${previewPath(filename)}`;

    const onClick = (e: React.MouseEvent) => {
      if (form?.getState().dirty &&
          !window.confirm("You have unsaved changes, which will be lost if you switch editors. Switch anyway?")) {
        e.preventDefault();
      }
    };

    return (
      <div style={{ marginBottom: "1rem", fontSize: "0.85rem", color: "#4b5563" }}>
        {inVisualEditor ? "Visual editor" : "Full-screen editor"}
        {" · "}
        <a href={target} onClick={onClick} style={{ color: "#2563eb", textDecoration: "underline" }}>
          {inVisualEditor ? "Switch to full-screen editor" : "Switch to visual editor (live preview)"}
        </a>
      </div>
    );
  };
