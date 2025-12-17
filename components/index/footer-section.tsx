import { CiLogin, CiCoffeeCup } from "react-icons/ci";
import { AuthButton } from "../auth-button"; // server 版本
import { UptimeDays } from "./uptime-days";
import { FooterYear } from "./current-year";
import { Suspense } from "react";
import Link from "next/link";

export function FooterSection() {
  return (
    <footer className="border-t border-border py-8 px-4 text-center mx-auto space-y-4">
      
      {/* 支持咖啡 */}
      <div className="font-semibold text-lg">
        <Link
          href="https://www.buymeacoffee.com/zexiangzhang"
          target="_blank"
          className="inline-flex items-center gap-2 hover:text-primary transition-colors"
        >
          <CiCoffeeCup className="inline" />
          如果内容对您有启发，请我喝一杯热咖啡支持我的创作。
        </Link>
      </div>

      {/* Uptime */}
      <div className="text-muted-foreground text-sm">
        本站已稳定运行&nbsp;<UptimeDays />，感谢您的访问。
      </div>

      {/* 版权所有 */}
      <div className="text-muted-foreground text-sm">
        © <Suspense fallback={<span>Loading...</span>}><FooterYear /></Suspense> 半栈人生. All Rights Reserved.
      </div>

      {/* 许可协议 */}
      <div className="text-muted-foreground text-sm">
        除非另有说明，本站所有文章均采用{" "}
        <Link
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en"
          target="_blank"
          className="underline hover:text-accent transition-colors"
        >
          CC BY-NC-SA 4.0 许可协议
        </Link>{" "}
        授权。
      </div>

      {/* 后台登录 */}
      <div className="text-muted-foreground text-xs text-end">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 hover:text-accent transition-colors"
        >
          <CiLogin className="inline" />
          后台登陆
        </Link>
      </div>
    </footer>
  );
}
