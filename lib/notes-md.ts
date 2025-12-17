import { remark } from "remark";
import remarkParse from "remark-parse";
import { visit } from "unist-util-visit";
import GithubSlugger from "github-slugger";

/**
 * TOC item 类型：只收集 h2/h3/h4
 */
export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

/**
 * MDAST 节点的最小类型（够用即可，不引入整套 mdast 类型依赖）
 */
type MdastNode = {
  type: string;
  value?: string;
  depth?: number; // heading 才有
  children?: MdastNode[];
  data?: {
    hProperties?: Record<string, unknown>;
    [k: string]: unknown;
  };
};

/**
 * 递归提取 heading 文本（尽可能覆盖真实写法）
 * - 支持 text / inlineCode
 * - 支持嵌套：strong/emphasis/link/delete 等（它们都有 children）
 */
function extractText(node: MdastNode | undefined): string {
  if (!node) return "";

  // 普通文本
  if (node.type === "text") return node.value ?? "";

  // 行内代码 `xxx`
  if (node.type === "inlineCode") return node.value ?? "";

  // 其他大多数内联/容器节点都在 children 里
  if (Array.isArray(node.children)) {
    return node.children.map(extractText).join("");
  }

  return "";
}

/**
 * 生成并写入 heading id，同时构建 toc
 * 写入位置：node.data.hProperties.id
 *
 * 说明：
 * - 你后续用 remark-rehype 时，hProperties 会映射到 HTML 属性
 * - 这样 TOC 和正文可以共享同一个 id
 */
function remarkCollectToc(options: {
  slugger: GithubSlugger;
  toc: TocItem[];
}) {
  return (tree: MdastNode) => {
    visit(tree as any, "heading", (node: MdastNode) => {
      const depth = node.depth ?? 0;
      if (depth < 2 || depth > 4) return;

      const level = depth as 2 | 3 | 4;

      const text = extractText(node).trim();
      if (!text) return;

      const id = options.slugger.slug(text);

      // ✅ 写入 hProperties.id（给后续 HTML/渲染用）
      node.data ??= {};
      node.data.hProperties ??= {};
      node.data.hProperties.id = id;

      options.toc.push({ id, text, level });
    });
  };
}

/**
 * 解析 Markdown，返回：
 * - toc：目录数据
 * - showToc：是否显示 TOC（默认 >= 3 个标题）
 *
 * 注意：
 * - 这里主要是“改 MDAST + 收集 toc”
 * - 如果你后续还要渲染 HTML，请把 remarkCollectToc 插入你的主渲染 pipeline
 */
export async function parseMarkdownWithToc(markdown: string) {
  const slugger = new GithubSlugger();
  slugger.reset(); // ✅ 保证每次调用从头开始，避免进程复用导致串号

  const toc: TocItem[] = [];

  const processor = remark()
    .use(remarkParse)
    .use(remarkCollectToc, { slugger, toc });

  const file = await processor.process(markdown);

  // file.value 是处理后的文本（remarkParse 不会把它转成 HTML）
  // 这里保留返回，方便你以后需要调试/扩展
  return {
    toc,
    showToc: toc.length >= 3,
    // 如果你只是为了 TOC，其实不需要返回 mdast
    // 但保留 file 以便你后续扩展（比如统一 pipeline）
    file,
  };
}
