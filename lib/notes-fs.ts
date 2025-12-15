// lib/notes-fs.ts
import path from "path";
import fs from "fs/promises";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

export async function getNoteMarkdownBySlug(slugParts: string[]) {
  // ⭐ 关键：逐段 decode
  const decodedParts = slugParts.map((part) => decodeURIComponent(part));

  const relPath = decodedParts.join("/");
  const fullPath = path.join(NOTES_DIR, `${relPath}.md`);

  const content = await fs.readFile(fullPath, "utf8");
  return { content, fullPath };
}
