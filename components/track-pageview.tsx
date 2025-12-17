"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TrackPageview() {
  const pathname = usePathname();
  const sp = useSearchParams();

  useEffect(() => {
    const qs = sp?.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;

    fetch("/api/pageview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, sp]);

  return null;
}
