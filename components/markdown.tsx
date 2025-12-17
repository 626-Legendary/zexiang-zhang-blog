// components/markdown.tsx
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import { visit } from "unist-util-visit";
import type { Root, Element } from "hast";

import { remarkHeadingIds } from "@/lib/remark-toc";

/**
 * ✅ 稳定“文档站/ChatGPT”风格：代码块永远暗色，高对比、好读
 * - keepBackground:true：避免你再用 CSS 把高亮搞没
 * - 主题：github-dark-dimmed（柔和但对比够，像现代文档站）
 */
const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark-dimmed",
  keepBackground: true,
};

function isElement(node: any): node is Element {
  return node?.type === "element" && typeof node.tagName === "string";
}

/** 外链：自动新开 + 安全 rel */
function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "a") return;
      const props = (node.properties ??= {});
      const href = props.href;
      if (typeof href !== "string") return;

      if (/^https?:\/\//.test(href)) {
        props.target = "_blank";
        props.rel = "noreferrer noopener";
      }
    });
  };
}

/**
 * 给 pretty-code figure 补一个“语言标题栏”
 * - 没有 figcaption（title）时注入
 */
function rehypeCodeFigureHeader() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName !== "figure") return;
      const props = node.properties ?? {};
      if (!("data-rehype-pretty-code-figure" in props)) return;

      const pre = (node.children || []).find((c) => isElement(c) && c.tagName === "pre") as
        | Element
        | undefined;
      if (!pre) return;

      const lang =
        (pre.properties?.["data-language"] as string | undefined) ||
        (pre.properties?.["data-lang"] as string | undefined) ||
        "";

      const hasCaption = (node.children || []).some((c) => isElement(c) && c.tagName === "figcaption");
      if (hasCaption) return;

      const header: Element = {
        type: "element",
        tagName: "div",
        properties: { "data-code-header": "", "data-lang": lang },
        children: [
          {
            type: "element",
            tagName: "span",
            properties: { "data-code-lang": "" },
            children: [{ type: "text", value: (lang || "code").toUpperCase() }],
          },
        ],
      };

      node.children = [header, ...(node.children || [])];
    });
  };
}

const ARTICLE_CLASSNAME = [
  // ---------- Base typography ----------
  "prose prose-neutral dark:prose-invert max-w-none",
  "prose-headings:scroll-mt-24",
  "prose-h1:text-3xl prose-h1:font-semibold prose-h1:tracking-tight",
  "prose-h2:text-2xl prose-h2:font-semibold prose-h2:tracking-tight prose-h2:mt-10 prose-h2:mb-4",
  "prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3",
  "prose-p:leading-7",
  "prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
  "prose-hr:border-border",

  // ---------- Images ----------
  "prose-img:mx-auto prose-img:max-w-full",
  "prose-img:rounded-xl prose-img:border prose-img:border-border",
  "prose-img:shadow-sm",

  // ✅ 行内 code：只命中非 pre 内 code，避免污染代码块
  "[&_:not(pre)>code]:before:content-[''] [&_:not(pre)>code]:after:content-['']",
  "[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5",
  "[&_:not(pre)>code]:bg-muted [&_:not(pre)>code]:text-foreground",
  "[&_:not(pre)>code]:border [&_:not(pre)>code]:border-border",

  // ---------- Blockquote ----------
  "prose-blockquote:border-l-4 prose-blockquote:border-border",
  "prose-blockquote:bg-muted/40 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg",

  // =========================================================
  // ✅ CODE BLOCKS：文档站好用（外框/标题栏/滚动/高对比），无内边框
  // =========================================================
  "[&_figure[data-rehype-pretty-code-figure]]:my-6",
  "[&_figure[data-rehype-pretty-code-figure]]:rounded-xl",
  "[&_figure[data-rehype-pretty-code-figure]]:border",
  "[&_figure[data-rehype-pretty-code-figure]]:border-border",
  "[&_figure[data-rehype-pretty-code-figure]]:overflow-hidden",
  "[&_figure[data-rehype-pretty-code-figure]]:shadow-sm",

  // Header bar（像 docs 卡片顶部条）
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:flex",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:items-center",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:justify-between",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:px-4",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:py-2",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:text-xs",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:font-medium",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:tracking-wide",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:text-muted-foreground",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:bg-muted/30",
  "dark:[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:bg-muted/15",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:border-b",
  "[&_figure[data-rehype-pretty-code-figure]_[data-code-header]]:border-border",

  // 如果你未来用 title => figcaption，也给同款
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:px-4",
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:py-2",
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:text-xs",
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:font-medium",
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:tracking-wide",
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:text-muted-foreground",
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:bg-muted/30",
  "dark:[&_figure[data-rehype-pretty-code-figure]_figcaption]:bg-muted/15",
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:border-b",
  "[&_figure[data-rehype-pretty-code-figure]_figcaption]:border-border",

  // ✅ 关键：pre 没有任何“内边框/内描边/圆角”
  "[&_figure[data-rehype-pretty-code-figure]_pre]:m-0",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:border-0",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:ring-0",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:outline-none",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:rounded-none",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:shadow-none",

  // editor feel
  "[&_figure[data-rehype-pretty-code-figure]_pre]:px-4",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:py-4",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:overflow-x-auto",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:text-[13px]",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:leading-6",
  "[&_figure[data-rehype-pretty-code-figure]_pre]:font-mono",

  // ✅ 最重要：不要给 code/span 设 text-inherit / text color
  // 否则会把 Shiki token 颜色抹平导致“灰到看不清”
].join(" ");

export async function Markdown({ content }: { content: string }) {
  const file = await remark()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHeadingIds)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeCodeFigureHeader)
    .use(rehypeExternalLinks)
    .use(rehypeStringify)
    .process(content);

  return (
    <article
      className={ARTICLE_CLASSNAME}
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
