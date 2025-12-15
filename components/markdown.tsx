// components/markdown.tsx
import { remark } from "remark";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import rehypePrettyCode from "rehype-pretty-code";
import { remarkHeadingIds } from "@/lib/remark-toc";

import type { Options as PrettyCodeOptions } from "rehype-pretty-code";

const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-light",
  keepBackground: false,
};

export async function Markdown({ content }: { content: string }) {
  const file = await remark()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHeadingIds)
    .use(remarkRehype)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify)
    .process(content);

  return (
    <article
      className={[
  "prose prose-neutral dark:prose-invert max-w-none",
  "prose-headings:scroll-mt-24",
  "prose-h1:text-3xl prose-h1:font-semibold prose-h1:tracking-tight",
  "prose-h2:text-2xl prose-h2:font-semibold prose-h2:tracking-tight",
  "prose-h3:text-xl prose-h3:font-semibold",
  "prose-p:leading-7",
  "prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
  "prose-hr:border-border",
  "prose-img:rounded-xl prose-img:border prose-img:border-border",
  // inline code 胶囊风格（并去掉 typography 默认的反引号）
  "prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5",
  "prose-code:before:content-[''] prose-code:after:content-['']",
  // blockquote 更“文档站”
  "prose-blockquote:border-l-4 prose-blockquote:border-border",
  "prose-blockquote:bg-muted/40 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg",
].join(" ")}
      dangerouslySetInnerHTML={{ __html: String(file) }}
    />
  );
}
