// components/index/footer-section.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

const STARTED_AT_ISO = "2025-12-12T08:00:00Z";

function calcUptimeDays(from: Date, now: Date) {
  const diff = Math.max(0, now.getTime() - from.getTime());
  const day = 24 * 60 * 60 * 1000;
  return Math.floor(diff / day);
}

export function FooterSection() {
  const startedAt = useMemo(() => new Date(STARTED_AT_ISO), []);
  const [now, setNow] = useState<Date | null>(null);
  const [year, setYear] = useState<number>(2025);

  useEffect(() => {
    const tick = () => setNow(new Date());

    tick();
    setYear(new Date().getFullYear());

    const ms = Date.now();
    const toNextMinute = 60_000 - (ms % 60_000);

    const timeoutId = window.setTimeout(() => {
      tick();
      const intervalId = window.setInterval(tick, 60_000);
      (tick as any)._intervalId = intervalId;
    }, toNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      const intervalId = (tick as any)._intervalId as number | undefined;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  const uptimeDays = useMemo(() => {
    if (!now) return null;
    return calcUptimeDays(startedAt, now);
  }, [startedAt, now]);

  return (
    <footer className="border-t bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Main */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left */}
          <div className="space-y-2">
            <div className="text-base font-semibold tracking-tight">半栈人生</div>
            <p className="text-sm text-muted-foreground">
              坚持不自律，本身也是一种自律
            </p>

            <div className="pt-2 text-xs text-muted-foreground">
              运行天数：
              <span className="ml-1 font-medium text-foreground">
                {uptimeDays ?? "—"} 天
              </span>
            </div>

            <div className="pt-2 text-xs">
              <a
                href="mailto:zhangzexiang626@gmail.com"
                className="text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition"
              >
                zhangzexiang626@gmail.com
              </a>
            </div>
          </div>

          {/* Right */}
          <div className="md:justify-self-end">
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              LICENSE
            </div>

            <div className="mt-3 space-y-2 text-sm">
              {/* ✅ 改为纯下划线文本链接 */}
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noreferrer"
                className="text-foreground/80 underline underline-offset-4 hover:text-foreground transition"
              >
                CC BY-NC-SA 4.0
              </a>

              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                允许署名共享与改编（非商业），并以相同方式共享。
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} 半栈人生</span>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block">Built with</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 180 180"
              width="18"
              aria-hidden
            >
              <mask
                id="next-mask"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="180"
                height="180"
                style={{ maskType: "alpha" }}
              >
                <circle cx="90" cy="90" r="90" fill="black" />
              </mask>
              <g mask="url(#next-mask)">
                <circle cx="90" cy="90" r="90" fill="black" />
                <path
                  d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
                  fill="white"
                />
                <rect x="115" y="54" width="12" height="72" fill="white" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
