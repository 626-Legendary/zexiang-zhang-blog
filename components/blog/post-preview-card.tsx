import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaEye } from "react-icons/fa";
import { CgComment } from "react-icons/cg";

interface PostPreviewCardProps {
  title: string;
  excerpt: string;
  date: string;
  href: string;

  // ✅ 新增：封面图 URL（例如 /covers/go/golang-banner.png）
  // 不传则自动用 /covers/default.png
  cover?: string;

  // ✅ 可选：以后你接数据库时再传真实值
  views?: number;
  comments?: number;
}

export function PostPreviewCard({
  title,
  excerpt,
  date,
  href,
  cover,
  views = 0,
  comments = 0,
}: PostPreviewCardProps) {
  const img = cover?.trim().length ? cover : "/covers/default.png";

  return (
    <Card className="group overflow-hidden rounded-2xl border bg-background transition hover:shadow-md">
      {/* ✅ 整卡可点击 */}
      <Link href={href} className="block">
        {/* 封面 */}
        <div className="relative w-full aspect-video">
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
          {/* 顶部渐变，确保标题/日期区域更干净 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/25 to-transparent" />
        </div>

        {/* 内容 */}
        <div className="p-4 flex flex-col">
          <div className="text-xs text-muted-foreground">{date}</div>

          <h3 className="mt-1 text-base font-semibold leading-snug line-clamp-2">
            {title}
          </h3>

          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        </div>
      </Link>

      {/* 底部操作栏（不包在 Link 里，避免嵌套点击冲突） */}
      <div className="px-4 pb-4 flex items-center justify-between">
        <Button asChild size="sm" variant="outline" className="rounded-xl">
          <Link href={href}>立即阅读</Link>
        </Button>

        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs">
            <FaEye className="opacity-80" />
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <CgComment className="opacity-80" />
            <span>{comments}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
