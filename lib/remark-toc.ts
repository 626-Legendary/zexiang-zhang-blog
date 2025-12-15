// lib/remark-toc.ts
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  text: string;
  level: number; // 2 | 3 | 4
};

function extractText(node: any): string {
  if (!node) return "";
  if (node.type === "text" || node.type === "inlineCode") return String(node.value ?? "");
  if (Array.isArray(node.children)) return node.children.map(extractText).join("");
  return "";
}

/**
 * ✅ 给 h2-h4 自动加 id（GitHub slug 规则）
 * - ReactMarkdown 会把 node.data.hProperties.* 映射到 HTML 属性
 */
export function remarkHeadingIds() {
  return (tree: any) => {
    const slugger = new GithubSlugger();

    visit(tree, "heading", (node: any) => {
      const level = node.depth;
      if (level < 2 || level > 4) return;

      const text = extractText(node).trim();
      if (!text) return;

      const id = slugger.slug(text);

      node.data ||= {};
      node.data.hProperties ||= {};
      node.data.hProperties.id = id;
    });
  };
}

/**
 * ✅ 服务端：生成 toc + showToc（同一套 slugger）
 */
export function buildTocFromMdast(tree: any) {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];

  visit(tree, "heading", (node: any) => {
    const level = node.depth;
    if (level < 2 || level > 4) return;

    const text = extractText(node).trim();
    if (!text) return;

    const id = slugger.slug(text);
    toc.push({ id, text, level });
  });

  return { toc, showToc: toc.length >= 3 };
}
