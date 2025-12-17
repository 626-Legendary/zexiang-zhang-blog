// app/page.tsx
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { PostPreviewCard } from "@/components/blog/post-preview-card";
import { WeatherCard } from "@/components/widgets/weather-card";
import { StatusCard } from "@/components/widgets/stats-card";
import { ProfileCard } from "@/components/widgets/profile-card";
import { AnnouncementCard } from "@/components/widgets/announcement-card";
import { TagCard } from "@/components/widgets/tag-card";

import { getAllPosts } from "@/lib/posts";

export default function Home() {
  // ✅ 你启用了 cacheComponents：别用 export const dynamic，想实时读就 noStore()
  noStore();

  const posts = getAllPosts().slice(0, 12); // 最近 12 篇

  return (
    <main className="mx-auto flex justify-center max-w-7xl gap-8 my-8 px-4">
      {/* 左半部分 */}
      <aside className="left hidden lg:flex lg:flex-col gap-4 lg:w-[300px]">
        <WeatherCard />
        <ProfileCard />
        <AnnouncementCard />
        <TagCard />
        <StatusCard />
      </aside>

      {/* 右半部分 */}
      <div className="right w-full">
        {/* 最近文章 */}
        <section className="w-full">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="text-2xl md:text-3xl font-semibold">Recent Posts</h2>
            <Link
              href="/notes"
              className="text-sm text-muted-foreground hover:text-foreground transition"
            >
              View all →
            </Link>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl border p-6 text-sm text-muted-foreground">
              暂无文章。请在 <code className="px-1">content/notes</code> 下添加 Markdown。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((p) => (
                <div key={p.slug} className="group">
                  {/* ✅ 你的 PostPreviewCard 原本至少有 title/excerpt/date/href */}
                  <PostPreviewCard
                    title={p.title}
                    excerpt={p.excerpt}
                    date={formatDate(p.date)}
                    href={`/notes/${p.slug}`}
                    cover={p.cover}   // ✅ 关键
                  />

                  {/* ✅ tags 展示（如果你不想改 PostPreviewCard，就放在外面） */}
                  {p.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.tags.slice(0, 6).map((t) => (
                        <Link
                          key={`${p.slug}:${t}`}
                          href={`/tags/${encodeURIComponent(t)}`}
                          className="rounded-md border px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted transition"
                        >
                          #{t}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 可选模块：你后续可以换成公告/推荐/项目卡片 */}
        <section className="w-full mt-10">
          <div className="rounded-2xl border bg-background/50 p-6">
            <div className="text-base font-medium">Extra Section</div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              This space can be used for recommendations, announcements, or other homepage content.
              <br />
              数据库连接 = 完成相关路由建设 &gt; 学习笔记功能
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDate(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toISOString().slice(0, 10);
}
