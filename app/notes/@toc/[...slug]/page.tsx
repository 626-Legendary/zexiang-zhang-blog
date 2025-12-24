import { remark } from "remark";
import remarkParse from "remark-parse";
import { getNoteMarkdownBySlug, getAllNotesSlugs } from "@/lib/notes-fs";
import { buildTocFromMdast } from "@/lib/remark-toc";
import { TocScrollSpy } from "@/components/toc-scrollspy";

export async function generateStaticParams() {
  const slugs = await getAllNotesSlugs();
  return slugs.map((slug) => ({
    slug: slug.split("/"),
  }));
}

export default async function TocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  // 在 Next.js 16 中，params 是 Promise，需要 await 解包
  const { slug } = await params;
  
  // 处理 slug 可能是 undefined 的情况
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    return null;
  }

  try {
    const { content } = await getNoteMarkdownBySlug(slug);
    const tree = remark().use(remarkParse).parse(content);
    const { toc, showToc } = buildTocFromMdast(tree);

    if (!showToc) return null;
    return <TocScrollSpy toc={toc} />;
  } catch (error) {
    // 如果读取失败，返回 null（不显示 TOC）
    console.error("Error reading TOC for slug:", slug, error);
    return null;
  }
}
