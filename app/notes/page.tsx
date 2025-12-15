import Link from "next/link";
import { buildNotesTree, TreeNode } from "@/lib/notes-tree";

function Folder({ node, level = 0 }: { node: Extract<TreeNode, { type: "folder" }>; level?: number }) {
  return (
    <details open className="group">
      <summary
        className="cursor-pointer select-none rounded-md px-2 py-1 hover:bg-muted"
        style={{ paddingLeft: 8 + level * 14 }}
      >
        <span className="font-medium">{node.name}</span>
      </summary>

      <div className="mt-1 space-y-1">
        {node.children.map((child) =>
          child.type === "folder" ? (
            <Folder key={`f:${child.pathParts.join("/")}`} node={child} level={level + 1} />
          ) : (
            <File key={`p:${child.pathParts.join("/")}`} node={child} level={level + 1} />
          ),
        )}
      </div>
    </details>
  );
}

function File({ node, level = 0 }: { node: Extract<TreeNode, { type: "file" }>; level?: number }) {
  const href = `/notes/${node.pathParts.join("/")}`;
  return (
    <div
      className="rounded-md px-2 py-1 hover:bg-muted"
      style={{ paddingLeft: 8 + level * 14 }}
    >
      <Link className="block" href={href}>
        <div className="text-sm font-medium leading-5">{node.title}</div>
        {node.date ? (
          <div className="text-xs text-muted-foreground">{node.date}</div>
        ) : null}
      </Link>
    </div>
  );
}

export default function NotesPage() {
  const tree = buildNotesTree();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Notes</h1>

      <div className="mt-8 rounded-lg border p-3">
        {tree.length ? (
          <div className="space-y-1">
            {tree.map((node) =>
              node.type === "folder" ? (
                <Folder key={`root:${node.pathParts.join("/")}`} node={node} />
              ) : (
                <File key={`rootfile:${node.pathParts.join("/")}`} node={node} />
              ),
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No notes found.</p>
        )}
      </div>
    </main>
  );
}
