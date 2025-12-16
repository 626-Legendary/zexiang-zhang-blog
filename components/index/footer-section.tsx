import { CiLogin } from "react-icons/ci";
import { AuthButton } from "../auth-button"; // 让它走 server 版本
import { UptimeDays } from "./uptime-days";
import { FooterYear } from "./current-year";
import { Suspense } from "react";
export function FooterSection() {
  

  return (
    <footer className="border-t bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-base font-semibold tracking-tight">半栈人生</div>
            <p className="text-sm text-muted-foreground">坚持不自律，本身也是一种自律</p>

            <div className="pt-2 text-xs text-muted-foreground">
              运行天数：<UptimeDays />
            </div>

            <div className="pt-2 text-xs">
              <a
                href="mailto:zhangzexiang626@gmail.com"
                className="text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition"
              >
                zhangzexiang626@gmail.com
              </a>
            </div>
          </div>

          <div className="md:justify-self-end">
            <div className="text-xs font-medium tracking-wide text-muted-foreground">
              LICENSE
            </div>

            <div className="mt-3 space-y-2 text-sm">
              <a
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noreferrer"
                className="text-foreground/80 underline underline-offset-4 hover:text-foreground transition"
              >
                CC BY-NC-SA 4.0
              </a>

              <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                允许署名共享与改编（非商业），并以相同方式共享。
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© <Suspense fallback={<div>Loading...</div>}><FooterYear /></Suspense> 半栈人生</span>

          <span className="inline-flex items-center gap-1">
            <CiLogin /> 登录入口
          </span>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block">Built with</span>
            <Suspense fallback={<div className="h-8 w-40 rounded-md bg-muted" />}>
  <AuthButton />
</Suspense>
            
          </div>
        </div>
      </div>
    </footer>
  );
}
