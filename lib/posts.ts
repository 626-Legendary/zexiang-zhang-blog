import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * 你的 Markdown 根目录：
 * content/notes/**（支持多级目录）
 */
const NOTES_DIR = path.join(process.cwd(), "content", "notes");

/**
 * Markdown frontmatter 类型
 */
export type PostFrontmatter = {
  title: string;
  date?: string; // "YYYY-MM-DD" 或 ISO
  tags?: string[];
  cover?: string; // ✅ 支持手动指定：/covers/xxx.png
  draft?: boolean; // ✅ true 时不出现在列表 / RSS / tags
};

/**
 * 列表/RSS/首页卡片用的简要信息
 * cover: string ✅ 永远有值（手动 > 同名 > default）
 */
export type PostSummary = {
  slug: string; // e.g. "Go/generics"
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  cover: string; // ✅ 永远有值
};

/**
 * 获取所有文章 slug（递归）
 * 返回：["Go/generics", "React/hooks", ...]
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(NOTES_DIR)) return [];

  return walkFiles(NOTES_DIR)
    .filter((abs) => abs.toLowerCase().endsWith(".md"))
    .map((abs) => toSlug(abs));
}

/**
 * 封面解析优先级（你要求的规则）：
 * 1) frontmatter.cover（最高优先级）
 * 2) public/covers/{slug}.(png|jpg|webp) 同名封面
 * 3) /covers/default.png（兜底）
 */
function resolveCover(options: { frontmatterCover?: string; slug: string }): string {
  // ① frontmatter 明确指定（最高优先级）
  if (options.frontmatterCover && options.frontmatterCover.trim().length > 0) {
    return options.frontmatterCover.trim();
  }

  // ② 同名封面（public/covers/**）
  // 例：public/covers/Go/generics.png -> /covers/Go/generics.png
  const base = path.join(process.cwd(), "public", "covers", options.slug);

  if (fs.existsSync(base + ".png")) return `/covers/${options.slug}.png`;
  if (fs.existsSync(base + ".jpg")) return `/covers/${options.slug}.jpg`;
  if (fs.existsSync(base + ".jpeg")) return `/covers/${options.slug}.jpeg`;
  if (fs.existsSync(base + ".webp")) return `/covers/${options.slug}.webp`;

  // ③ 默认封面（兜底）
  return "/covers/default.png";
}

/**
 * 读取单篇文章（支持分级 slug：Go/generics）
 * 返回：slug + frontmatter + content
 */
export function getPostBySlug(slug: string) {
  const filePath = resolveSlugToFilePath(slug);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Note not found: ${slug}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const safeSlug = normalizeSlug(slug);
  const fm = data as PostFrontmatter;

  // ✅ 文章页也统一 cover：手动 > 同名 > default
  const cover = resolveCover({ frontmatterCover: fm.cover, slug: safeSlug });

  return {
    slug: safeSlug,
    frontmatter: {
      ...fm,
      cover, // ✅ 保证 frontmatter.cover 也永远有值（方便你文章页直接用）
      tags: Array.isArray(fm.tags) ? fm.tags.filter(Boolean) : [],
    } as PostFrontmatter,
    content,
  };
}

/**
 * 获取所有文章摘要（用于首页/列表/RSS）
 * - 自动过滤 draft
 * - 按 date 倒序
 * - cover 永远有值
 */
export function getAllPosts(): PostSummary[] {
  if (!fs.existsSync(NOTES_DIR)) return [];

  const files = walkFiles(NOTES_DIR).filter((abs) =>
    abs.toLowerCase().endsWith(".md")
  );

  const postsWithDraftFlag = files.map((abs) => {
    const raw = fs.readFileSync(abs, "utf8");
    const { data, content } = matter(raw);

    const fm = data as PostFrontmatter;
    const slug = toSlug(abs);

    const title = fm.title ?? slug.split("/").pop() ?? slug;
    const date = fm.date ?? new Date(0).toISOString();
    const tags = Array.isArray(fm.tags) ? fm.tags.filter(Boolean) : [];
    const excerpt = buildExcerpt(content);

    // ✅ 核心：把 cover 计算出来（手动 > 同名 > default）
    const cover = resolveCover({ frontmatterCover: fm.cover, slug });

    return {
      slug,
      title,
      date,
      tags,
      excerpt,
      cover,
      draft: fm.draft === true,
    };
  });

  // ✅ 过滤 draft，返回 PostSummary
  return postsWithDraftFlag
    .filter((p) => !p.draft)
    .map(({ draft: _draft, ...rest }) => rest)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * tags 聚合：{ tag: count }
 * - 基于 getAllPosts()（draft 已过滤）
 */
export function getAllTags(): Record<string, number> {
  const posts = getAllPosts();
  const map: Record<string, number> = {};

  for (const p of posts) {
    for (const t of p.tags) {
      const tag = t?.trim();
      if (!tag) continue;
      map[tag] = (map[tag] ?? 0) + 1;
    }
  }
  return map;
}

/**
 * 按 tag 过滤文章（大小写不敏感）
 */
export function getPostsByTag(tag: string): PostSummary[] {
  const q = tag.trim().toLowerCase();
  if (!q) return [];
  return getAllPosts().filter((p) =>
    p.tags.some((t) => t.toLowerCase() === q)
  );
}

/* ---------------- helpers ---------------- */

/**
 * 递归列出目录下所有文件（返回绝对路径）
 */
function walkFiles(dirAbs: string): string[] {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
  const out: string[] = [];

  for (const entry of entries) {
    const abs = path.join(dirAbs, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(abs));
    else if (entry.isFile()) out.push(abs);
  }
  return out;
}

/**
 * 把某个 .md 文件绝对路径 -> slug（相对 NOTES_DIR，不带 .md）
 * 并把 Windows 的 "\" 统一为 "/"
 */
function toSlug(fileAbs: string): string {
  const rel = path.relative(NOTES_DIR, fileAbs);
  const noExt = rel.replace(/\.md$/i, "");
  return normalizeSlug(noExt);
}

/**
 * 统一 slug 分隔符为 "/"，并去掉前后的斜杠
 */
function normalizeSlug(slug: string): string {
  return slug.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

/**
 * 防路径穿越：把 slug 安全解析为 NOTES_DIR 下的 md 文件路径
 */
function resolveSlugToFilePath(slug: string): string {
  const safeSlug = normalizeSlug(slug);
  const abs = path.resolve(NOTES_DIR, `${safeSlug}.md`);
  const root = path.resolve(NOTES_DIR);

  // 确保 abs 在 notes 根目录内
  if (!abs.startsWith(root + path.sep) && abs !== root) {
    throw new Error("Invalid slug path");
  }
  return abs;
}

/**
 * 从 Markdown 正文生成摘要：
 * - 取第一段
 * - 去掉换行
 * - 最大 200 字
 */
function buildExcerpt(content: string, maxLength = 200): string {
  const firstPara = content
    .replace(/\r\n/g, "\n")
    .split("\n\n")
    .map((p) => p.trim())
    .find((p) => p.length > 0);

  if (!firstPara) return "";
  return firstPara.replace(/\n/g, " ").slice(0, maxLength);
}
