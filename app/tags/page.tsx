import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getAllTags } from "@/lib/posts";

export const metadata = {
  title: "Tags",
  description: "Browse all tags",
};

export default function TagsPage() {
  // ✅ cacheComponents 下别用 export const dynamic
  // 想确保每次读最新文件系统：用 noStore()
  noStore();

  const tags = getAllTags();

  const entries = Object.entries(tags).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0].localeCompare(b[0]);
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Tags</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        共 {entries.length} 个标签
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {entries.map(([tag, count]) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted transition"
          >
            #{tag}
            <span className="ml-2 text-xs text-muted-foreground">
              {count}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
