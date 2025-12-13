"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaEye } from "react-icons/fa";
import { CgComment } from "react-icons/cg";

interface PostPreviewCardProps {
  title: string;
  excerpt: string;
  date: string;
  href: string;
}

export function PostPreviewCard({ title, excerpt, date, href }: PostPreviewCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full md:w-80">
      {/* 缩略图 */}
      <div className="relative w-full aspect-video bg-gray-600">
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold">
          模拟图片
        </span>
      </div>

      {/* 内容 */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-sm text-muted-foreground">{date}</span>
        <h2 className="text-lg font-semibold mt-1 line-clamp-2">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-3 flex-1">{excerpt}</p>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between mt-12">
          <Button size="sm" variant="outline">
            立即阅读
          </Button>

          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <FaEye /> <span className="text-sm">123</span>
            </div>
            <div className="flex items-center gap-1">
              <CgComment /> <span className="text-sm">5</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
