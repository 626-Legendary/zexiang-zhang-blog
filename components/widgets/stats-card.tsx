"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { FaChartBar } from "react-icons/fa";

type Stats = {
  today: number;
  total: number;
};

export function StatusCard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <Card className="w-full h-fit p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <FaChartBar />
        统计数据
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p>
          今日访客数：
          <span className="ml-1 font-semibold">
            {stats ? stats.today : "—"}
          </span>
        </p>
        <p>
          总计访客数：
          <span className="ml-1 font-semibold">
            {stats ? stats.total : "—"}
          </span>
        </p>
      </div>
    </Card>
  );
}
