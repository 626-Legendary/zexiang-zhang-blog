// app/notes/layout.tsx
import type { ReactNode } from "react";
import { Suspense } from "react";
import { buildNotesTree } from "@/lib/notes-tree";
import { NotesSidebar } from "@/components/notes/notes-sidebar";

function SidebarFallback() {
  return (
    <div className="rounded-xl border bg-card/50">
      <div className="px-3 py-2.5 text-xs font-medium tracking-wide text-muted-foreground">
        FILES
      </div>
      <div className="border-t" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-4/5 rounded bg-muted" />
        <div className="h-4 w-3/5 rounded bg-muted" />
        <div className="h-4 w-2/3 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
      </div>
    </div>
  );
}

async function SidebarServer() {
  // ✅ 把“读文件树”放到 Suspense 子树里（不阻塞整页）
  const tree = buildNotesTree();
  return <NotesSidebar tree={tree} />;
}

function TocFallback() {
  return (
    <div className="rounded-xl border bg-card/50 p-3">
      <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">ON THIS PAGE</div>
      <div className="space-y-2 px-2">
        <div className="h-3 w-4/5 rounded bg-muted" />
        <div className="h-3 w-3/5 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
      </div>
    </div>
  );
}

export default function NotesLayout({ children, toc }: { children: ReactNode; toc: ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-5">
        <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse, read, and jump sections.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr_240px]">
        {/* Left */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <Suspense fallback={<SidebarFallback />}>
              {/* ✅ 关键：SidebarServer 在 Suspense 内部 */}
              <SidebarServer />
            </Suspense>
          </div>
        </aside>

        {/* Middle */}
        <main className="min-w-0">{children}</main>

        {/* Right */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <Suspense fallback={<TocFallback />}>{toc}</Suspense>
          </div>
        </aside>
      </div>
    </div>
  );
}
