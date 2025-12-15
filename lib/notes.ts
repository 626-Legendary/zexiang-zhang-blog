import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

export type NoteFrontmatter = {
  title: string;
  date?: string;
  tags?: string[];
};

export type Note = {
  slugParts: string[];      // ["back-end","java","1"]
  slug: string;             // "back-end/java/1"
  frontmatter: NoteFrontmatter;
  content: string;
};

function walkDir(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walkDir(full));
    else if (e.isFile() && e.name.endsWith(".md")) files.push(full);
  }

  return files;
}

export function getAllNoteSlugsParts(): string[][] {
  if (!fs.existsSync(NOTES_DIR)) return [];

  const files = walkDir(NOTES_DIR);

  return files.map((filePath) => {
    const rel = path.relative(NOTES_DIR, filePath); // e.g. "back-end/java/1.md"
    const noExt = rel.replace(/\.md$/, "");
    return noExt.split(path.sep); // windows/mac 都适配
  });
}

export function getNoteBySlugParts(slugParts: string[]) {
  const decodedParts = slugParts.map((s) => decodeURIComponent(s));

  const rel = decodedParts.join(path.sep) + ".md";
  const filePath = path.join(NOTES_DIR, rel);

  if (!fs.existsSync(filePath)) throw new Error("not found");

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  const date =
    data.date != null ? new Date(data.date).toISOString().slice(0, 10) : undefined;

  return {
    slugParts,
    slug: slugParts.join("/"),
    frontmatter: { ...(data as any), date } as NoteFrontmatter,
    content,
  };
}
