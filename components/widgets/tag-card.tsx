import Link from "next/link";
import { FaTags } from "react-icons/fa";
import { Card } from "../ui/card";
import { getAllTags } from "@/lib/posts";

export function TagCard() {
  const tags = getAllTags();
  const entries = Object.entries(tags).sort((a, b) => b[1] - a[1]);

  return (
    <Card className="w-full h-fit p-2">
      <div className="flex items-center gap-2 font-medium mb-2">
        <FaTags />
        <span>标签</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {entries.map(([tag, count]) => (
          <Link
            key={tag}
            href={`/tags/${encodeURIComponent(tag)}`}
            className="rounded-md border px-2 py-1 text-sm hover:bg-muted transition"
          >
            #{tag}
            <span className="ml-1 text-xs text-muted-foreground">({count})</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
