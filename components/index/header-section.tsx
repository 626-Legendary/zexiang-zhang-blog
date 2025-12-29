"use client";

import { ZMX } from "@/app/fonts";
import Image from "next/image";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FaGithub, FaSearch, FaBars } from "react-icons/fa";
import { useState } from "react";
import { usePathname } from "next/navigation";

type NavItem = {
  name: string;
  href: string;
};

const navItems: NavItem[] = [
  { name: "主页", href: "/" },
  { name: "笔记", href: "/notes" },
  { name: "随想", href: "/thoughts" },
  { name: "生活", href: "/life" },
  { name: "分享", href: "/share" },
];

export function HeaderSection() {
  const pathname = usePathname(); // 响应式路由
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    return pathname === href; // 单级高亮
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex w-1/2 md:w-1/3 items-center gap-2">
          <Image
            src="/LogoLight.png"
            alt="Logo"
            width={54}
            height={48}
            className="dark:hidden"
          />
          <Image
            src="/LogoDark.png"
            alt="Logo"
            width={36}
            height={32}
            className="hidden dark:block"
          />
          <span className={`${ZMX.className} text-xl md:text-2xl font-bold`}>
            半栈人生
          </span>
        </Link>

        {/* Center: Nav (desktop) */}
        <nav className="hidden w-1/3 justify-center md:flex">
          <ul className="flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`
                    transition underline-offset-4
                    ${isActive(item.href)
                      ? "text-foreground underline"
                      : "text-muted-foreground hover:text-foreground hover:underline"
                    }
                  `}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="flex w-2/3 md:w-1/3 items-center justify-end gap-4">
          <div className="relative hidden md:block">
            <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="h-9 w-48 rounded-md border bg-background pl-9 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <a
            href="https://github.com/626-Legendary"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-xl transition hover:opacity-70"
          >
            <FaGithub />
          </a>

          <ThemeSwitcher />

          <button
            className="text-xl md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="border-t bg-background md:hidden">
          <ul className="flex flex-col gap-4 px-4 py-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    block text-sm transition px-2
                    ${isActive(item.href)
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
}
