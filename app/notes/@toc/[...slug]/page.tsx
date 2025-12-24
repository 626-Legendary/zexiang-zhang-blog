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
  params: { slug: string[] };
}) {
  // 处理 slug 可能是 undefined 的情况
  if (!params || !params.slug || !Array.isArray(params.slug) || params.slug.length === 0) {
    return null;
  }

  const { content } = await getNoteMarkdownBySlug(params.slug);
  const tree = remark().use(remarkParse).parse(content);
  const { toc, showToc } = buildTocFromMdast(tree);

  if (!showToc) return null;
  return <TocScrollSpy toc={toc} />;
}
