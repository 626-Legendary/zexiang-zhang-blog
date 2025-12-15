// lib/notes-tree.ts
import fs from "node:fs";
import path from "node:path";

export type TreeNode =
  | {
      type: "folder";
      name: string;
      pathParts: string[];
      children: TreeNode[];
    }
  | {
      type: "file";
      title: string;
      date?: string; // YYYY-MM-DD
      pathParts: string[];
    };

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

// 解析 frontmatter 里 date: 2025-12-14
function parseFrontmatterDate(markdown: string): string | undefined {
  // very small frontmatter parser (no dependency)
  if (!markdown.startsWith("---")) return undefined;
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return undefined;

  const fm = markdown.slice(3, end).trim();
  const m = fm.match(/^\s*date\s*:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m);
  return m?.[1];
}

function safeTitleFromFrontmatter(markdown: string): string | undefined {
  if (!markdown.startsWith("---")) return undefined;
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return undefined;

  const fm = markdown.slice(3, end).trim();
  const m = fm.match(/^\s*title\s*:\s*["']?(.+?)["']?\s*$/m);
  return m?.[1]?.trim();
}

function formatDateYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isMarkdownFile(filename: string) {
  return filename.toLowerCase().endsWith(".md") || filename.toLowerCase().endsWith(".mdx");
}

function sortNodes(a: TreeNode, b: TreeNode) {
  // folders first, then files; within each group: name/title asc
  if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
  const an = a.type === "folder" ? a.name : a.title;
  const bn = b.type === "folder" ? b.name : b.title;
  return an.localeCompare(bn, "zh-Hans-CN", { numeric: true, sensitivity: "base" });
}

function readFileMeta(fullPath: string) {
  const raw = fs.readFileSync(fullPath, "utf8");
  const title = safeTitleFromFrontmatter(raw) ?? path.basename(fullPath).replace(/\.(md|mdx)$/i, "");
  const date = parseFrontmatterDate(raw);

  if (date) return { title, date };

  // fallback：用文件修改时间（所有层级都能有）
  const stat = fs.statSync(fullPath);
  return { title, date: formatDateYYYYMMDD(stat.mtime) };
}

function walkDir(dirAbs: string, pathParts: string[] = []): TreeNode[] {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });

  const nodes: TreeNode[] = [];

  for (const e of entries) {
    if (e.name.startsWith(".")) continue; // ignore .DS_Store etc.

    const abs = path.join(dirAbs, e.name);

    if (e.isDirectory()) {
      const children = walkDir(abs, [...pathParts, e.name]);
      // 你也可以选择：空文件夹不显示
      if (children.length) {
        nodes.push({
          type: "folder",
          name: e.name,
          pathParts: [...pathParts, e.name],
          children,
        });
      }
      continue;
    }

    if (e.isFile() && isMarkdownFile(e.name)) {
      const { title, date } = readFileMeta(abs);
      nodes.push({
        type: "file",
        title,
        date,
        pathParts: [...pathParts, e.name.replace(/\.(md|mdx)$/i, "")],
      });
    }
  }

  nodes.sort(sortNodes);
  return nodes;
}

export function buildNotesTree(): TreeNode[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  return walkDir(NOTES_DIR, []);
}
