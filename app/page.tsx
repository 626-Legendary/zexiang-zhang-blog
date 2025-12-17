// root app/page.tsx
import { PostPreviewCard } from "@/components/blog/post-preview-card";
import { LXGW, ZMX } from "@/app/fonts";
import { WeatherCard } from "@/components/widgets/weather-card";
import { StatusCard } from "@/components/widgets/stats-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileCard } from "@/components/widgets/profile-card";
import { AnnouncementCard } from "@/components/widgets/announcement-card";
import { TagCard } from "@/components/widgets/tag-card";
export default function Home() {
  return (
    <main className="mx-auto flex justify-center max-w-7xl gap-8 my-8">
      {/* 左半部分 */}
      <aside className="left hidden lg:flex lg:flex-col gap-4 lg:w-[300px]">
        

          {/* 天气 widget */}
          
            <WeatherCard />
          
          {/* 个人信息 */}
          <ProfileCard />
          <AnnouncementCard />
          <TagCard />
          <StatusCard />





        



      </aside>
      <div className="right bg-violet-300">
        {/* 最近文章 */}
        <section className="w-full">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">Recent Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <PostPreviewCard
              title="Understanding React Hooks"
              excerpt="A deep dive into React hooks and their best practices for professional development."
              date="2025-12-12"
              href="#"
            />
            <PostPreviewCard
              title="Next.js Tips & Tricks"
              excerpt="Optimizing Next.js applications with practical tips for faster and cleaner code."
              date="2025-12-11"
              href="#"
            />
            <PostPreviewCard
              title="Effective TypeScript"
              excerpt="Advanced TypeScript techniques to write safer and more maintainable code."
              date="2025-12-10"
              href="#"
            />
          </div>
        </section>

        {/* 可选卡片模块 */}
        <section className="w-full">
          <Card className="p-8 text-center border border-border rounded-2xl shadow-sm bg-background/50">
            <CardHeader>
              <CardTitle>Extra Section</CardTitle>
              <CardDescription>
                This space can be used for recommendations, announcements, or other homepage content.

                数据库连接 = 完成相关路由建设 &gt; 学习笔记功能
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      </div>


    </main>
  );
}
