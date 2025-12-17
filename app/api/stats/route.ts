import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_pageview_stats");
  if (error) {
    return NextResponse.json({ total: 0, today: 0 }, { status: 200 });
  }

  const row = data?.[0];
  return NextResponse.json(
    {
      total: row?.total_pv ?? 0,
      today: row?.today_pv ?? 0,
    },
    {
      // 🔥 强烈建议缓存，避免每个访问都打 DB
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
