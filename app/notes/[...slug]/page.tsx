// app/notes/[...slug]/page.tsx
import { getNoteMarkdownBySlug } from "@/lib/notes-fs";
import { Markdown } from "@/components/markdown";

export default async function NotePage({ params }: { params: { slug: string[] } }) {
  const { content } = await getNoteMarkdownBySlug(params.slug);

  return (
    <div className="rounded-xl border bg-card/50 p-8">
      <Markdown content={content} />
    </div>
  );
}
