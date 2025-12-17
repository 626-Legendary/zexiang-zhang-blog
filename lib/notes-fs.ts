// lib/notes-fs.ts
import "server-only";

import path from "path";
import fs from "fs/promises";
import { cache } from "react";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

// ✅ 真正缓存的函数：参数用稳定 primitive（string）
const readNoteByKey = cache(async (slugKey: string) => {
  const fullPath = path.join(NOTES_DIR, `${slugKey}.md`);
  const content = await fs.readFile(fullPath, "utf8");
  return { content, fullPath };
});

export async function getNoteMarkdownBySlug(slugParts: string[]) {
  const decodedParts = slugParts.map((part) => decodeURIComponent(part));

  // ✅ 防路径穿越
  const safeParts = decodedParts
    .map((p) => p.replace(/\\/g, "/"))
    .filter((p) => p && p !== "." && p !== ".." && !p.includes(".."));

  // ✅ 关键：数组 -> 稳定字符串 key（cache 才能命中）
  const slugKey = safeParts.join("/");

  return readNoteByKey(slugKey);
}
