// app/loading.tsx
export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(0 0 0 / 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgb(0 0 0 / 0.12) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* soft vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, rgb(0 0 0 / 0.06) 0%, transparent 55%), radial-gradient(80% 80% at 50% 60%, rgb(0 0 0 / 0.08) 0%, transparent 60%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-4">
        {/* mark */}
        <div className="relative">
          {/* outer ring */}
          <div className="h-14 w-14 rounded-full border border-foreground/15" />
          {/* spinner */}
          <div className="absolute inset-0 rounded-full border-2 border-foreground/10 border-t-foreground/70 animate-spin" />
          {/* inner dot */}
          <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/70" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-sm font-medium tracking-tight text-foreground/80">
            Loading
            <span className="inline-flex w-8 justify-start">
              <span className="animate-[pulse_1.2s_ease-in-out_infinite]">.</span>
              <span className="animate-[pulse_1.2s_ease-in-out_infinite] [animation-delay:200ms]">
                .
              </span>
              <span className="animate-[pulse_1.2s_ease-in-out_infinite] [animation-delay:400ms]">
                .
              </span>
            </span>
          </div>

          {/* thin progress shimmer */}
          <div className="h-[2px] w-44 overflow-hidden rounded-full bg-foreground/10">
            <div className="h-full w-1/2 animate-[shimmer_1.1s_ease-in-out_infinite] bg-foreground/55" />
          </div>

          <div className="text-xs text-muted-foreground">
            正在准备内容，请稍候
          </div>
        </div>
      </div>

      {/* local keyframes (works without tailwind config) */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  );
}
