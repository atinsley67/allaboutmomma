// One-off migration: gives every AffiliateLink and affiliate table cell whose stored link is an
// Amazon product an `asin`, and drops the stored Amazon link and image, which the build now
// fetches fresh. Anything else (other sites, short links, uploaded images) is left alone.
// Safe to re-run: items that already have an ASIN are skipped.
//
//   node scripts/migrate-affiliate-asins.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { extractAsin } from "../lib/asin.mjs";

const dryRun = process.argv.includes("--dry-run");

const AFFILIATE_LINK = /<AffiliateLink\b[\s\S]*?\/>/g;
const AFFILIATE_URLS = /(\s*)affiliateURLs=\{\{([\s\S]*?)\}\}/;
const CELL_AFFILIATE = /affiliate:\s*\{([^{}]*)\}/g;
// One `key: "value"` pair of an object literal; the value may be on the next line, in either quotes
const PAIR = /(\w+)\s*:\s*(?:"([^"]*)"|'([^']*)')/g;
const AMAZON_IMAGE = /^https?:\/\/([^/]*\.)?(media-amazon|images-amazon|ssl-images-amazon|amazon-adsystem)\.com\//;

function parsePairs(body) {
  return [...body.matchAll(PAIR)].map((m) => ({ key: m[1], value: m[2] ?? m[3], text: m[0] }));
}

/**
 * The ASIN for a stored object's pairs, and the pairs still worth keeping once it's stored:
 * the Amazon link goes, and so does an Amazon-hosted (or never found) image.
 */
function migratePairs(pairs) {
  if (pairs.some((p) => p.key === "asin")) return null;
  // A few cells were saved as linkUrl/imageUrl, which the schema ignores
  const isLink = (p) => p.key === "linkURL" || p.key === "linkUrl";
  const isImage = (p) => p.key === "imageURL" || p.key === "imageUrl";
  const asin = extractAsin(pairs.find(isLink)?.value);
  if (!asin) return null;
  const kept = pairs.filter(
    (p) => !isLink(p) && !(isImage(p) && (!p.value || p.value === "MISSING" || AMAZON_IMAGE.test(p.value)))
  );
  return { asin, kept };
}

function migrateFile(text) {
  let links = 0;
  let cells = 0;

  let out = text.replace(AFFILIATE_LINK, (element) => {
    if (/\sasin=/.test(element)) return element;
    const urls = element.match(AFFILIATE_URLS);
    if (!urls) return element;
    const migrated = migratePairs(parsePairs(urls[2]));
    if (!migrated) return element;
    links++;
    const rest = migrated.kept.length
      ? `${urls[1]}affiliateURLs={{ ${migrated.kept.map((p) => p.text).join(", ")} }}`
      : "";
    return element.replace(AFFILIATE_URLS, rest).replace("<AffiliateLink", `<AffiliateLink asin="${migrated.asin}"`);
  });

  out = out.replace(CELL_AFFILIATE, (match, body) => {
    const migrated = migratePairs(parsePairs(body));
    if (!migrated) return match;
    cells++;
    return `affiliate:{${[`asin:"${migrated.asin}"`, ...migrated.kept.map((p) => p.text)].join(",")}}`;
  });

  return { out, links, cells };
}

let totalLinks = 0;
let totalCells = 0;
let changedFiles = 0;
for (const entry of fs.readdirSync("content", { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !/\.mdx?$/.test(entry.name)) continue;
  const file = path.join(entry.parentPath, entry.name);
  const text = fs.readFileSync(file, "utf8");
  const { out, links, cells } = migrateFile(text);
  if (out === text) continue;
  changedFiles++;
  totalLinks += links;
  totalCells += cells;
  if (!dryRun) fs.writeFileSync(file, out);
}

console.log(
  `${dryRun ? "Would migrate" : "Migrated"} ${totalLinks} affiliate links and ${totalCells} table cells in ${changedFiles} files`
);
