// app/notes/[...slug]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getNoteMarkdownBySlug, getAllNotesSlugs } from "@/lib/notes-fs";
import { Markdown } from "@/components/markdown";

export async function generateStaticParams() {
  const slugs = await getAllNotesSlugs();
  return slugs.map((slug) => ({
    slug: slug.split("/"),
  }));
}

async function NoteContent({ slug }: { slug: string[] }) {
  const { content } = await getNoteMarkdownBySlug(slug);
  return <Markdown content={content} />;
}

export default async function NotePage({ 
  params 
}: { 
  params: Promise<{ slug: string[] }>
}) {
  // 在 Next.js 16 中，params 是 Promise，需要 await 解包
  const { slug } = await params;
  
  // 处理 slug 可能是 undefined 的情况
  if (!slug || !Array.isArray(slug) || slug.length === 0) {
    notFound();
  }

  return (
    <div className="rounded-xl border bg-card/50 p-8">
      <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded" />}>
        <NoteContent slug={slug} />
      </Suspense>
    </div>
  );
}
