import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

export type PostFrontmatter = {
  title: string;
  date?: string;
  tags?: string[];
};

export function getAllSlugs() {
  if (!fs.existsSync(NOTES_DIR)) return [];

  return fs
    .readdirSync(NOTES_DIR, { withFileTypes: true })
    .flatMap((entry) => {
      if (!entry.isFile()) return [];
      if (!entry.name.endsWith(".md")) return [];
      return [entry.name.replace(/\.md$/, "")];
    });
}

export function getPostBySlug(slug: string) {
  const filePath = path.join(NOTES_DIR, `${slug}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Note not found: ${slug}`);
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    frontmatter: data as PostFrontmatter,
    content,
  };
}
