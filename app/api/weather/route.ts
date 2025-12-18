import { NextResponse } from "next/server";

const TTL_SECONDS = 2 * 60 * 60; // 2 hours

function pickGeo(req: Request) {
  const lat = req.headers.get("x-vercel-ip-latitude");
  const lon = req.headers.get("x-vercel-ip-longitude");

  const city = req.headers.get("x-vercel-ip-city") ?? "";
  const country = req.headers.get("x-vercel-ip-country") ?? "";

  return { lat, lon, city, country };
}

async function fetchJSON(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`请求失败 (${res.status})`);
  return res.json();
}

export async function GET(req: Request) {
  try {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error("缺少 OPENWEATHER_API_KEY");

    const geo = pickGeo(req);

    // === 1️⃣ 优先使用 Vercel 提供的经纬度 ===
    let lat = Number(geo.lat);
    let lon = Number(geo.lon);
    let cityName = geo.city;
    let countryCode = geo.country;

    // === 2️⃣ 本地开发 / headers 缺失时兜底 ===
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      lat = 34.0522;
      lon = -118.2437;
      cityName = "Los Angeles";
      countryCode = "US";
    }

    // === 3️⃣ 直接用 lat/lon 请求天气（最稳定） ===
    const weatherUrl =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=zh_cn`;

    const data = await fetchJSON(weatherUrl);

    const payload = {
      temp: Number(data?.main?.temp),
      tempMin: Number(data?.main?.temp_min),
      tempMax: Number(data?.main?.temp_max),
      description: String(data?.weather?.[0]?.description ?? "—"),
      icon: `https://openweathermap.org/img/wn/${data?.weather?.[0]?.icon}@2x.png`,
      country: String(data?.sys?.country ?? countryCode ?? ""),
      name: String(data?.name ?? cityName ?? "Unknown"),
      fetchedAt: new Date().toISOString(),

      // 调试用（前端不展示）
      visitorGeo: {
        lat,
        lon,
        city: geo.city,
        country: geo.country,
      },
    };

    if (![payload.temp, payload.tempMin, payload.tempMax].every(Number.isFinite)) {
      throw new Error("天气数据解析失败");
    }

    return NextResponse.json(payload, {
      headers: {
        // CDN 缓存，避免打爆第三方 API
        "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=600`,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Weather unavailable" },
      { status: 200 }
    );
  }
}
