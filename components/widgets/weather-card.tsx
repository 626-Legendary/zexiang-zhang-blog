"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";

type WeatherData = {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  country: string;
  name: string; // city
};

export function WeatherCard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const key = process.env.NEXT_PUBLIC_WEATHER_KEY;

  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        setLoading(true);
        setError(null);

        if (!key) throw new Error("缺少 NEXT_PUBLIC_WEATHER_KEY（OpenWeather API Key）");

        const locRes = await fetch("https://ipapi.co/json/", { cache: "no-store" });
        if (!locRes.ok) throw new Error("定位服务不可用");
        const locData = await locRes.json();

        const lat = Number(locData?.latitude);
        const lon = Number(locData?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) throw new Error("无法获取经纬度");

        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=zh_cn`,
          { cache: "no-store" }
        );
        if (!weatherRes.ok) throw new Error("天气获取失败");

        const data = await weatherRes.json();

        const w: WeatherData = {
          temp: Number(data?.main?.temp),
          tempMin: Number(data?.main?.temp_min),
          tempMax: Number(data?.main?.temp_max),
          description: String(data?.weather?.[0]?.description ?? ""),
          icon: `https://openweathermap.org/img/wn/${data?.weather?.[0]?.icon}@2x.png`,
          country: String(data?.sys?.country ?? ""),
          name: String(data?.name ?? ""),
        };

        if (![w.temp, w.tempMin, w.tempMax].every(Number.isFinite) || !w.name) {
          throw new Error("天气数据解析失败");
        }

        if (!cancelled) setWeather(w);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "未知错误");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWeather();
    return () => {
      cancelled = true;
    };
  }, [key]);

  const cityLine = useMemo(() => {
    if (!weather) return "";
    return weather.country ? `${weather.name}, ${weather.country}` : weather.name;
  }, [weather]);

  if (loading) {
    return (
      <Card className="w-full rounded-2xl p-5 shadow-sm border border-border bg-background/60">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-muted animate-pulse" />
              <div className="h-4 w-20 rounded bg-muted animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-10 w-20 rounded bg-muted animate-pulse ml-auto" />
            <div className="h-4 w-40 rounded bg-muted animate-pulse ml-auto" />
            <div className="h-4 w-32 rounded bg-muted animate-pulse ml-auto" />
          </div>
        </div>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="w-full rounded-2xl p-5 shadow-sm border border-border bg-background/60">
        <div className="text-sm text-muted-foreground">Weather</div>
        <div className="mt-2 text-sm text-red-500">{error ?? "天气不可用"}</div>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-2xl p-5 shadow-sm border border-border hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between gap-6">
        {/* 左侧：天气图标 + 描述 */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
            <Image src={weather.icon} alt={weather.description} width={56} height={56} priority />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">Weather</div>
            <div className="truncate text-base font-medium text-foreground">
              {weather.description}
            </div>
          </div>
        </div>

        {/* 右侧：温度 + 城市 + 范围 */}
        <div className="text-right">
          <div className="text-5xl font-semibold tracking-tight text-foreground">
            {Math.round(weather.temp)}°
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">{cityLine}</div>
          <div className="mt-1 text-sm text-muted-foreground leading-5">
            最低 {Math.round(weather.tempMin)}° / 最高 {Math.round(weather.tempMax)}°
          </div>
        </div>
      </div>
    </Card>
  );
}
