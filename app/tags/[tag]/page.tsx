import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { getPostsByTag } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = safeDecode(tag);
  return {
    title: `#${decoded} · Tags`,
    description: `Posts tagged with ${decoded}`,
  };
}

export default async function TagDetailPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  // ✅ 替代 export const dynamic = "force-dynamic"
  // 在 cacheComponents 模式下用 noStore() 禁止缓存本段渲染
  noStore();

  const { tag: rawTag } = await params;
  const tag = safeDecode(rawTag);

  const posts = getPostsByTag(tag);
  if (!tag || posts.length === 0) return notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">#{tag}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            共 {posts.length} 篇
          </p>
        </div>

        <Link
          href="/tags"
          className="text-sm text-muted-foreground hover:text-foreground transition"
        >
          ← Back to tags
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="rounded-lg border p-4 hover:bg-muted/40 transition"
          >
            <Link href={`/notes/${p.slug}`} className="block">
              <h2 className="text-lg font-semibold">{p.title}</h2>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatDate(p.date)}
              </div>
              {p.excerpt ? (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                  {p.excerpt}
                </p>
              ) : null}
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function formatDate(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toISOString().slice(0, 10);
}
