import * as React from "react";

// A rich-text document with no content: only empty paragraphs. The editor turns an empty
// field into one of these as it loads.
function isEmptyRichText(node) {
  if (typeof node?.text === "string") return node.text.trim() === "";
  if (node?.type !== "root" && node?.type !== "p") return false;
  return (node.children || []).every(isEmptyRichText);
}

// Reduce a form value to its content, so values that only differ in representation compare
// equal: empty/null/missing, empty rich text, key order, and the same date written two ways.
// Tina's own dirty flag compares by reference, so fields that re-emit an equivalent value on
// load look changed.
function normalise(value) {
  if (value === null || value === undefined || value === "") return undefined;
  if (value?.type === "root" && isEmptyRichText(value)) return undefined;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  if (Array.isArray(value)) {
    const items = value.map(normalise);
    return items.length ? items : undefined;
  }
  if (typeof value === "object") {
    const entries = Object.keys(value).sort()
      .map((k) => [k, normalise(value[k])])
      .filter(([, v]) => v !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  return value;
}

const getPath = (obj, path: string) => path.split(".").reduce((o, k) => o?.[k], obj);

// Labels of fields whose content really differs from what was loaded
function changedFieldLabels(form, tinaForm): string[] {
  const { dirtyFields, values, initialValues } = form.getState();
  const changed = Object.keys(dirtyFields || {}).filter(
    (name) => JSON.stringify(normalise(getPath(values, name))) !==
      JSON.stringify(normalise(getPath(initialValues, name)))
  );
  const labels = changed.map((name) => {
    const top = name.split(".")[0];
    return tinaForm?.fields?.find((f) => f.name === top)?.label || top;
  });
  return Array.from(new Set(labels));
}

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
      if (!form) return;
      const changed = changedFieldLabels(form, tinaForm);
      if (changed.length &&
          !window.confirm(`You have unsaved changes in: ${changed.join(", ")}.\n\nThey'll be lost if you switch editors. Switch anyway?`)) {
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
