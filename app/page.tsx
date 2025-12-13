import { PostPreviewCard } from "@/components/blog/post-preview-card";
import { LXGW, ZMX } from "@/app/fonts";
import { WeatherWidget } from "@/components/widgets/weather-widget";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="min-h-screen w-full max-w-7xl mx-auto flex flex-col gap-16 p-6 md:p-10">

      {/* 顶部介绍 & 天气模块 */}
      <section className="w-full flex flex-col lg:flex-row justify-between items-center gap-10">
        {/* 个人信息 */}
        <div className="flex flex-col items-center lg:items-start gap-4 text-center lg:text-left">
          <div className="w-36 h-36 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <p className="text-3xl font-bold">Hello, I'm Zexiang</p>
          <p className="max-w-md text-muted-foreground">
            Welcome to my personal blog. Here I share insights on programming, technology, and professional growth.
          </p>

          <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa dicta dolor eum ipsam maiores eligendi, laboriosam dolores omnis perspiciatis odit magni incidunt ab nam ad, ea nostrum voluptatibus vero necessitatibus modi fugit provident suscipit fugiat quis! Veritatis, ab corporis incidunt sequi nihil odit error, rem laborum sapiente enim, commodi voluptatem.</p>
        </div>

        {/* 天气 widget */}
        <div className="w-full max-w-sm">
          <WeatherWidget />
        </div>
      </section>

      {/* 自我介绍 / 代码块 */}
      <section className="w-full flex flex-col items-center gap-6">
        <p className={`${LXGW.className} text-lg md:text-xl text-muted-foreground max-w-2xl text-center`}>
          I love building clean and efficient code, exploring new technologies, and sharing knowledge with the community.
        </p>
        <pre className={`${ZMX.className} w-full md:w-2/3 bg-muted/10 dark:bg-muted/20 rounded-xl p-4 text-sm md:text-base overflow-x-auto`}>
          {`// 这是一个代码占位示例
function helloWorld() {
  console.log("Hello, Zexiang!");
}`}
        </pre>
      </section>

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
    </main>
  );
}
