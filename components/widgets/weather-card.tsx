"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type WeatherData = {
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  country: string;
  name: string;
  fetchedAt?: string;
};

type State =
  | { status: "loading"; data: null; error: null }
  | { status: "error"; data: null; error: string }
  | { status: "ready"; data: WeatherData; error: null };

async function fetchWeather(signal: AbortSignal): Promise<WeatherData> {
  const res = await fetch("/api/weather", { signal, cache: "no-store" });
  const data = await res.json().catch(() => ({}));
  if (data?.error) throw new Error(String(data.error));
  return data as WeatherData;
}

export function WeatherCard() {
  const [state, setState] = useState<State>({ status: "loading", data: null, error: null });
  const inFlight = useRef<AbortController | null>(null);

  const load = useCallback(async (opts?: { force?: boolean }) => {
    inFlight.current?.abort();
    const controller = new AbortController();
    inFlight.current = controller;

    setState({ status: "loading", data: null, error: null });

    try {
      // force：通过 querystring 绕开 CDN 缓存（仅你手动刷新用）
      const w = await (opts?.force
        ? (async () => {
            const res = await fetch(`/api/weather?ts=${Date.now()}`, { signal: controller.signal, cache: "no-store" });
            const data = await res.json().catch(() => ({}));
            if (data?.error) throw new Error(String(data.error));
            return data as WeatherData;
          })()
        : fetchWeather(controller.signal));

      setState({ status: "ready", data: w, error: null });
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      setState({ status: "error", data: null, error: e?.message ?? "未知错误" });
    } finally {
      if (inFlight.current === controller) inFlight.current = null;
    }
  }, []);

  useEffect(() => {
    load();
    return () => inFlight.current?.abort();
  }, [load]);

  const cityLine = useMemo(() => {
    if (state.status !== "ready") return "";
    const w = state.data;
    return w.country ? `${w.name}, ${w.country}` : w.name;
  }, [state]);

  if (state.status === "loading") {
    return <Card className="w-full rounded-2xl p-5 border bg-background/60">Loading…</Card>;
  }

  if (state.status === "error") {
    return (
      <Card className="w-full p-4 rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Weather</div>
            <div className="mt-2 text-sm text-red-500">{state.error}</div>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => load({ force: true })}>
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </div>
      </Card>
    );
  }

  const w = state.data;

  return (
    <Card className="w-full p-4 rounded-2xl">
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60">
            <Image src={w.icon} alt={w.description} width={56} height={56} priority />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Weather</div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => load({ force: (e as any).shiftKey })}
                title="刷新（Shift+点击 强制刷新）"
                aria-label="刷新天气"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <div className="truncate text-base font-medium">{w.description}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-5xl font-semibold tracking-tight">{Math.round(w.temp)}°</div>
        </div>
      </div>

      <div className="mt-1 text-sm font-medium flex justify-end">{cityLine}</div>
      <div className="mt-1 text-sm text-muted-foreground flex justify-end">
        最低 {Math.round(w.tempMin)}° / 最高 {Math.round(w.tempMax)}°
      </div>
    </Card>
  );
}
