import { NextResponse } from "next/server";

const TTL_SECONDS = 2 * 60 * 60; // 2 hours

function pickGeo(req: Request) {
  const city = req.headers.get("x-vercel-ip-city") ?? "";
  const region = req.headers.get("x-vercel-ip-country-region") ?? "";
  const country = req.headers.get("x-vercel-ip-country") ?? "";
  return { city, region, country };
}

async function fetchJSON(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`请求失败 (${res.status})`);
  return res.json();
}

async function geocodeToLatLon(opts: { city: string; region: string; country: string; key: string }) {
  const q = [opts.city, opts.region, opts.country].filter(Boolean).join(",");
  if (!q) return null;

  // OpenWeather Geocoding API: city -> lat/lon
  const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${opts.key}`;
  const arr = (await fetchJSON(url)) as any[];
  const first = arr?.[0];
  const lat = Number(first?.lat);
  const lon = Number(first?.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon, name: String(first?.name ?? opts.city) };
}

export async function GET(req: Request) {
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error("缺少 OPENWEATHER_API_KEY");

    const { city, region, country } = pickGeo(req);

    // 本地开发/拿不到 geo headers 时：fallback（你也可以改成你的默认城市）
    const fallback = { city: "Los Angeles", region: "CA", country: "US" };
    const geo = city ? { city, region, country } : fallback;

    const loc = await geocodeToLatLon({ ...geo, key });
    if (!loc) throw new Error("无法将城市解析为经纬度");

    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${loc.lat}&lon=${loc.lon}&appid=${key}&units=metric&lang=zh_cn`;

    const data = await fetchJSON(weatherUrl);

    const payload = {
      temp: Number(data?.main?.temp),
      tempMin: Number(data?.main?.temp_min),
      tempMax: Number(data?.main?.temp_max),
      description: String(data?.weather?.[0]?.description ?? "—"),
      icon: `https://openweathermap.org/img/wn/${data?.weather?.[0]?.icon}@2x.png`,
      country: String(data?.sys?.country ?? geo.country ?? ""),
      name: String(data?.name ?? loc.name ?? geo.city ?? ""),
      fetchedAt: new Date().toISOString(),
      // 额外：你想展示“访客位置”，这里直接返回给前端（无 IP）
      visitorGeo: geo,
    };

    if (![payload.temp, payload.tempMin, payload.tempMax].every(Number.isFinite) || !payload.name) {
      throw new Error("天气数据解析失败");
    }

    return NextResponse.json(payload, {
      headers: {
        // ✅ 2小时 CDN 缓存：用户怎么刷都不会打爆第三方
        "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=600`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Weather unavailable" }, { status: 200 });
  }
}
