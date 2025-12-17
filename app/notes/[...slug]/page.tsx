// app/notes/[...slug]/page.tsx


import { Suspense } from "react";
import { getNoteMarkdownBySlug } from "@/lib/notes-fs";
import { Markdown } from "@/components/markdown";

export default function NotePage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  return (
    <div className="rounded-xl border bg-card/50 p-8">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <NoteContent params={params} />
      </Suspense>
    </div>
  );
}

async function NoteContent({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params; // ✅ unwrap Promise params（符合 sync-dynamic-apis）
  const { content } = await getNoteMarkdownBySlug(slug); // ✅ 你的异步数据读取也在 Suspense 内

  return <Markdown content={content} />;
}
