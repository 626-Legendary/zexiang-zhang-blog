"use client";

import { useEffect, useMemo, useState } from "react";

const STARTED_AT_ISO = "2025-12-12T08:00:00Z";

function calcUptimeDays(from: Date, now: Date) {
  const diff = Math.max(0, now.getTime() - from.getTime());
  const day = 24 * 60 * 60 * 1000;
  return Math.floor(diff / day);
}

export function UptimeDays() {
  const startedAt = useMemo(() => new Date(STARTED_AT_ISO), []);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());

    tick();

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
    <span className="ml-1 font-medium text-foreground">
      {uptimeDays ?? "—"} 天
    </span>
  );
}
