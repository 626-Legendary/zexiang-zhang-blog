// components/notes/notes-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { TreeNode } from "@/lib/notes-tree";
import { cn } from "@/lib/utils";

import { FaFolder, FaFolderOpen, FaRegFile } from "react-icons/fa";

/* -------------------------------- helpers -------------------------------- */

function decodePathSafely(p: string) {
  // decode each segment safely (avoid crashing on malformed %)
  return p
    .split("/")
    .map((seg) => {
      if (!seg) return seg;
      try {
        return decodeURIComponent(seg);
      } catch {
        return seg;
      }
    })
    .join("/");
}

function normalizePath(p: string) {
  if (!p) return "/";
  const trimmed = p.length > 1 ? p.replace(/\/+$/, "") : p;
  return decodePathSafely(trimmed);
}

function getActiveSlugParts(pathname: string) {
  // pathname might be encoded -> decode first
  const p = normalizePath(pathname);
  if (!p.startsWith("/notes")) return [];
  const rest = p.replace(/^\/notes\/?/, "");
  if (!rest) return [];
  return rest.split("/").filter(Boolean);
}

function isPrefixPath(prefix: string[], full: string[]) {
  if (prefix.length > full.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (prefix[i] !== full[i]) return false;
  }
  return true;
}

/* -------------------------------- Folder -------------------------------- */

function FolderRow({
  node,
  level,
  activeSlugParts,
}: {
  node: Extract<TreeNode, { type: "folder" }>;
  level: number;
  activeSlugParts: string[];
}) {
  const shouldOpen = isPrefixPath(node.pathParts, activeSlugParts);

  // keep user manual toggle, but always open when active path is inside
  const [open, setOpen] = useState<boolean>(shouldOpen);

  useEffect(() => {
    if (shouldOpen) setOpen(true);
  }, [shouldOpen]);

  return (
    <details open={open} className="group">
      <summary
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className={cn(
          "flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5",
          "text-sm font-medium text-foreground/90 hover:bg-muted/60",
        )}
        style={{ paddingLeft: 10 + level * 14 }}
      >
        <span className="text-muted-foreground">
          {open ? <FaFolderOpen size={14} /> : <FaFolder size={14} />}
        </span>

        <span className="truncate">{node.name}</span>
      </summary>

      <div className="mt-1 space-y-1">
        {node.children.map((child) =>
          child.type === "folder" ? (
            <FolderRow
              key={`f:${child.pathParts.join("/")}`}
              node={child}
              level={level + 1}
              activeSlugParts={activeSlugParts}
            />
          ) : (
            <FileRow key={`p:${child.pathParts.join("/")}`} node={child} level={level + 1} />
          ),
        )}
      </div>
    </details>
  );
}

/* -------------------------------- File -------------------------------- */

function FileRow({
  node,
  level,
}: {
  node: Extract<TreeNode, { type: "file" }>;
  level: number;
}) {
  const pathname = usePathname();

  // href uses raw (unencoded) segments; Next/Browser will handle encoding automatically
  const href = `/notes/${node.pathParts.join("/")}`;

  // ✅ Compare after decoding so direct encoded URL works:
  // /notes/%E4%BD%90... === /notes/佐...
  const active = pathname ? normalizePath(pathname) === normalizePath(href) : false;

  return (
    <div style={{ paddingLeft: 10 + level * 14 }}>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex items-start gap-2 rounded-md px-2 py-1.5 transition",
          "hover:bg-muted/60",
          active && "bg-muted/70",
        )}
      >
        <span className={cn("mt-[2px] text-muted-foreground", active && "text-foreground/80")}>
          <FaRegFile size={13} />
        </span>

        <div className="min-w-0 flex-1">
          <div className={cn("truncate text-sm leading-5", active ? "font-semibold" : "font-medium")}>
            {node.title}
          </div>

          {node.date ? (
            <div className="truncate text-xs text-muted-foreground">{node.date}</div>
          ) : null}
        </div>

        {/* Left accent (active) */}
        {active && (
          <span className="absolute left-0 top-1.5 h-[calc(100%-12px)] w-0.5 rounded-full bg-foreground/70" />
        )}
      </Link>
    </div>
  );
}

/* -------------------------------- Sidebar -------------------------------- */

export function NotesSidebar({ tree }: { tree: TreeNode[] }) {
  const pathname = usePathname();

  const activeSlugParts = useMemo(() => {
    if (!pathname) return [];
    return getActiveSlugParts(pathname);
  }, [pathname]);

  // auto scroll active item into view (works for direct open too)
  useEffect(() => {
    const el = document.querySelector('[aria-current="page"]') as HTMLElement | null;
    el?.scrollIntoView({ block: "center", inline: "nearest" });
  }, [pathname]);

  return (
    <div className="rounded-xl border bg-card/50">
      <div className="px-3 py-2.5 text-xs font-medium tracking-wide text-muted-foreground">
        FILES
      </div>

      <div className="border-t" />

      <div className="max-h-[calc(100vh-140px)] overflow-auto p-2 pr-1">
        {tree.length ? (
          <div className="space-y-1">
            {tree.map((node) =>
              node.type === "folder" ? (
                <FolderRow
                  key={`root:${node.pathParts.join("/")}`}
                  node={node}
                  level={0}
                  activeSlugParts={activeSlugParts}
                />
              ) : (
                <FileRow key={`rootfile:${node.pathParts.join("/")}`} node={node} level={0} />
              ),
            )}
          </div>
        ) : (
          <p className="px-2 py-2 text-sm text-muted-foreground">No notes found.</p>
        )}
      </div>
    </div>
  );
}
