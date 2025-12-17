// lib/notes.ts (or wherever you keep it)
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

export type NoteFrontmatter = {
  title: string;
  date?: string; // 统一成 YYYY-MM-DD
  tags?: string[];
  draft?: boolean; // 可选：true 时可在列表中过滤
};

export type Note = {
  slugParts: string[]; // e.g. ["back-end","java","1"]
  slug: string; // e.g. "back-end/java/1"（永远用 "/"）
  frontmatter: NoteFrontmatter;
  content: string;
};

/* ------------------ file walking ------------------ */

/**
 * 递归扫描目录下所有 .md 文件（返回绝对路径）
 * - 使用同步 IO：适合 build-time / server-side 读取
 */
function walkDir(dirAbs: string): string[] {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  const files: string[] = [];

  for (const e of entries) {
    const full = path.join(dirAbs, e.name);
    if (e.isDirectory()) files.push(...walkDir(full));
    else if (e.isFile() && e.name.toLowerCase().endsWith(".md")) files.push(full);
  }

  return files;
}

/* ------------------ slug helpers ------------------ */

/**
 * decodeURIComponent 可能抛错（比如非法 % 编码），这里兜底
 */
function safeDecode(part: string): string {
  try {
    return decodeURIComponent(part);
  } catch {
    return part;
  }
}

/**
 * 清理 slugParts，避免路径穿越与非法段
 * - 去掉空段、"."、".."
 * - 禁止包含 ".."
 * - 禁止绝对路径、Windows 盘符
 * - 统一把 "\" 变成 "/"
 */
function sanitizeSlugParts(slugParts: string[]): string[] {
  const decoded = slugParts.map(safeDecode);

  return decoded
    .map((p) => p.replace(/\\/g, "/").trim())
    .filter((p) => p.length > 0)
    .filter((p) => p !== "." && p !== ".." && !p.includes(".."))
    .filter((p) => !p.startsWith("/")) // 禁止绝对路径
    .filter((p) => !/^[A-Za-z]:/.test(p)); // 禁止 Windows 盘符（C:\）
}

/**
 * 把 slugParts 统一为 slug string（永远用 "/"）
 */
function toSlug(slugParts: string[]): string {
  return slugParts.join("/").replace(/\/+/g, "/");
}

/**
 * 根据 slugParts 构建 md 文件路径，并做最终安全校验：
 * 目标路径必须在 NOTES_DIR 内
 */
function resolveNotePath(slugParts: string[]): string {
  // 用 OS 分隔符组装相对路径，最后加 .md
  const rel = slugParts.join(path.sep) + ".md";

  // 先 join，再 resolve（防止 ../ 绕过）
  const abs = path.resolve(NOTES_DIR, rel);
  const root = path.resolve(NOTES_DIR);

  // 必须在 notes 根目录内
  if (!abs.startsWith(root + path.sep)) {
    throw new Error("Invalid note path");
  }

  return abs;
}

/* ------------------ public APIs ------------------ */

/**
 * 获取所有文章的 slugParts（用于 generateStaticParams）
 * 返回：
 * [
 *   ["back-end","java","1"],
 *   ["go","generics"],
 * ]
 */
export function getAllNoteSlugParts(): string[][] {
  if (!fs.existsSync(NOTES_DIR)) return [];

  const files = walkDir(NOTES_DIR);

  return files.map((fileAbs) => {
    // 相对路径：e.g. "back-end/java/1.md"
    const rel = path.relative(NOTES_DIR, fileAbs);

    // 去掉扩展名
    const noExt = rel.replace(/\.md$/i, "");

    // 这里用 path.sep 拆分，保证跨平台
    // 最后再 sanitize，避免奇怪路径段
    const parts = noExt.split(path.sep);
    return sanitizeSlugParts(parts);
  });
}

/**
 * 根据 slugParts 读取单篇文章
 * - 自动 decode params
 * - 防路径穿越
 * - 解析 frontmatter
 * - date 统一成 YYYY-MM-DD（无效则不返回）
 */
export function getNoteBySlugParts(inputSlugParts: string[]): Note {
  const safeParts = sanitizeSlugParts(inputSlugParts);

  if (safeParts.length === 0) {
    throw new Error("Invalid slug");
  }

  const filePath = resolveNotePath(safeParts);

  if (!fs.existsSync(filePath)) {
    throw new Error("Note not found");
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  // ---- frontmatter 规范化 ----
  const fm = data as Partial<NoteFrontmatter>;

  const title = typeof fm.title === "string" && fm.title.trim() ? fm.title.trim() : toSlug(safeParts);
  const tags = Array.isArray(fm.tags) ? fm.tags.filter((t) => typeof t === "string" && t.trim()) : undefined;

  // date 统一成 YYYY-MM-DD（无效则忽略）
  let date: string | undefined = undefined;
  if (fm.date != null) {
    const d = new Date(fm.date as any);
    if (!Number.isNaN(d.getTime())) {
      date = d.toISOString().slice(0, 10);
    }
  }

  const draft = fm.draft === true;

  return {
    slugParts: safeParts,
    slug: toSlug(safeParts),
    frontmatter: { title, date, tags, draft },
    content,
  };
}
