"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { FaGithub, FaSearch, FaBars } from "react-icons/fa";
import { useState } from "react";

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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/LogoLight.png"
            alt="Logo"
            width={36}
            height={32}
            className="dark:hidden"
          />
          <Image
            src="/LogoDark.png"
            alt="Logo"
            width={36}
            height={32}
            className="hidden dark:block"
          />
          <span className="font-Zhi_Mang_Xing text-xl font-bold">
            半栈人生
          </span>
        </Link>

        {/* Center: Nav (desktop only) */}
        <nav className="hidden md:flex">
          <ul className="flex items-center gap-8 text-sm font-medium">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="hover:underline underline-offset-4 transition"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Search (desktop only) */}
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
            className="text-xl hover:opacity-70 transition"
          >
            <FaGithub />
          </a>

          <ThemeSwitcher />

          {/* Mobile menu button */}
          <button
            className="md:hidden text-xl"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div className="md:hidden border-t bg-background">
          <ul className="flex flex-col px-4 py-4 gap-4">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm hover:underline underline-offset-4"
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
