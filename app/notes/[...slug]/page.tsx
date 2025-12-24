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

export default function NotePage({ 
  params 
}: { 
  params: { slug: string[] } 
}) {
  // 处理 slug 可能是 undefined 的情况
  if (!params?.slug || !Array.isArray(params.slug) || params.slug.length === 0) {
    notFound();
  }

  return (
    <div className="rounded-xl border bg-card/50 p-8">
      <Suspense fallback={<div className="animate-pulse h-64 bg-muted rounded" />}>
        <NoteContent slug={params.slug} />
      </Suspense>
    </div>
  );
}
