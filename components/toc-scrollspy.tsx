"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "@/lib/remark-toc";

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState("");

  const key = useMemo(() => ids.join("|"), [ids]);

  useEffect(() => {
    if (!ids.length) return;

    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!els.length) return;

    const visible = new Map<string, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).id;
          if (!id) continue;

          if (e.isIntersecting) visible.set(id, Math.abs(e.boundingClientRect.top));
          else visible.delete(id);
        }

        if (visible.size) {
          const best = [...visible.entries()].sort((a, b) => a[1] - b[1])[0][0];
          setActiveId(best);
          return;
        }

        const y = window.scrollY;
        let current = els[0].id;
        for (const el of els) {
          if (el.offsetTop <= y + 120) current = el.id;
          else break;
        }
        setActiveId(current);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return activeId;
}

export function TocScrollSpy({ toc }: { toc: TocItem[] }) {
  const ids = useMemo(() => toc.map((t) => t.id), [toc]);
  const activeId = useActiveHeading(ids);

  return (
    <div className="rounded-xl border bg-card/50 p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">ON THIS PAGE</div>

      <nav className="space-y-1 text-sm">
        {toc.map((item) => {
          const isActive = item.id === activeId;

          return (
            <Link
              key={item.id}
              href={`#${item.id}`}
              className={[
                "block rounded-md px-2 py-1 transition hover:bg-muted",
                item.level === 3 ? "pl-6" : "",
                item.level === 4 ? "pl-9" : "",
                isActive ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
              ].join(" ")}
              aria-current={isActive ? "true" : undefined}
            >
              {item.text}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
