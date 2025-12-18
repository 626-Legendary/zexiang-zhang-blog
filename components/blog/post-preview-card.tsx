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

  /** 封面图 URL，不传则使用默认图 */
  cover?: string;

  tags?: string[];
  views?: number;
  comments?: number;
}

export function PostPreviewCard({
  title,
  excerpt,
  date,
  href,
  cover,
  tags = [],
  views = 0,
  comments = 0,
}: PostPreviewCardProps) {
  const img = cover?.trim() ? cover : "/covers/default.png";

  return (
    <Card className="flex-col w-full h-full group overflow-hidden rounded-2xl border bg-background transition-shadow hover:shadow-md">
      {/* ===== 可点击阅读区 ===== */}
      <Link href={href} className="block focus:outline-none">
        {/* 封面 */}
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />

          {/* 顶部渐变 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/30 to-transparent" />
        </div>

        {/* 文本内容 */}
        <div className="p-4 space-y-2">
          <div className="text-xs text-muted-foreground">{date}</div>

          <h3 className="text-base font-semibold leading-snug line-clamp-2">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-3">
            {excerpt}
          </p>
        </div>
      </Link>
      {/* ===== 标签区 ===== */}
      {tags.length > 0 && (
        <div className="px-4 flex flex-wrap gap-2">
          {tags.slice(0, 6).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="rounded-md border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted"
            >
              # {tag}
            </Link>
          ))}
        </div>
      )}
      {/* ===== 底部操作区 ===== */}
      <div className="mt-auto flex items-center justify-between mx-auto">
        <Button asChild size="sm" variant="default" className="rounded-xl">
          <Link href={href}>立即阅读</Link>
        </Button>

        {/* <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1 text-xs" title="阅读量">
            <FaEye aria-hidden className="opacity-80" />
            <span>{views}</span>
          </div>

          <div className="flex items-center gap-1 text-xs" title="评论数">
            <CgComment aria-hidden className="opacity-80" />
            <span>{comments}</span>
          </div>
        </div> */}
      </div>


    </Card>
  );
}
