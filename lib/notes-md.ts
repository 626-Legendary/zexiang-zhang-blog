import { remark } from "remark";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";

export type TocItem = {
  id: string;
  text: string;
  level: number; // 2 | 3 | 4
};

function getText(node: any): string {
  if (!node) return "";
  if (node.type === "text" || node.type === "inlineCode") return node.value ?? "";
  if (Array.isArray(node.children)) return node.children.map(getText).join("");
  return "";
}

export async function parseMarkdownWithToc(markdown: string) {
  const slugger = new GithubSlugger();
  const toc: TocItem[] = [];

  const processor = remark()
    .use(remarkParse)
    .use(() => {
      return (tree: any) => {
        visit(tree, "heading", (node: any) => {
          const level = node.depth;
          if (level < 2 || level > 4) return;

          const text = getText(node).trim();
          if (!text) return;

          const id = slugger.slug(text);

          // 给标题写入 id（正文 & TOC 共用）
          node.data ||= {};
          node.data.hProperties ||= {};
          node.data.hProperties.id = id;

          toc.push({ id, text, level });
        });
      };
    });

  const file = await processor.process(markdown);

  return {
    mdast: file.result,
    toc,
    showToc: toc.length >= 3, // ⭐ 关键逻辑
  };
}
