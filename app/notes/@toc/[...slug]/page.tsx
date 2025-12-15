import { remark } from "remark";
import remarkParse from "remark-parse";
import { getNoteMarkdownBySlug } from "@/lib/notes-fs";
import { buildTocFromMdast } from "@/lib/remark-toc";
import { TocScrollSpy } from "@/components/toc-scrollspy";

export default async function TocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;

  const { content } = await getNoteMarkdownBySlug(slug);
  const tree = remark().use(remarkParse).parse(content);
  const { toc, showToc } = buildTocFromMdast(tree);

  if (!showToc) return null;
  return <TocScrollSpy toc={toc} />;
}
