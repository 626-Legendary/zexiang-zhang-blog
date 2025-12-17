import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 从各种反代/CDN header 里尽量取到真实 IP
function getIP(req: Request) {
  const h = req.headers;

  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const real = h.get("x-real-ip");
  if (real) return real.trim();

  return null;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path : "/";

  const ip = getIP(req);
  const user_agent = req.headers.get("user-agent") ?? null;

  const supabase = await createClient();

  const { error } = await supabase.from("pageviews").insert({
    path,
    ip,          // inet 列可以直接插入字符串 ip（Postgres 会转）
    user_agent,
  });

  if (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
