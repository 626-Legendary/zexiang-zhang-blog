// components/comment-thread.tsx
"use client";

import { useState } from "react";
import { CommentForm } from "@/components/comment-form";

type Comment = {
  id: number;
  nickname: string;
  body: string;
  created_at: string;
};

function initials(name: string) {
  const s = name.trim();
  return (s[0] || "?").toUpperCase();
}

export function CommentThread(props: {
  kind: "thoughts" | "life";
  feedId: string;
  roots: Comment[];
  repliesByParent: Map<number, Comment[]>;
}) {
  const { kind, feedId, roots, repliesByParent } = props;
  const [replyTo, setReplyTo] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {roots.length ? (
        roots.slice(0, 6).map((c) => (
          <div key={c.id} className="space-y-2">
            {/* root */}
            <div className="flex gap-3">
              <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full border bg-background text-xs font-medium">
                {initials(c.nickname)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-medium">{c.nickname}</div>

                  <button
                    type="button"
                    onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Reply
                  </button>
                </div>

                <div className="text-sm text-muted-foreground leading-6 whitespace-pre-wrap">
                  {c.body}
                </div>
              </div>
            </div>

            {/* replies */}
            {(repliesByParent.get(c.id) ?? []).slice(0, 6).map((r) => (
              <div key={r.id} className="ml-10 flex gap-3">
                <div className="mt-0.5 grid h-6 w-6 place-items-center rounded-full border bg-background text-[10px] font-medium">
                  {initials(r.nickname)}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-medium">{r.nickname}</div>
                  <div className="text-sm text-muted-foreground leading-6 whitespace-pre-wrap">
                    {r.body}
                  </div>
                </div>
              </div>
            ))}

            {/* reply form */}
            {replyTo === c.id ? (
              <div className="ml-10 rounded-md border bg-card p-3">
                <div className="mb-2 text-xs text-muted-foreground">
                  Replying to{" "}
                  <span className="font-medium text-foreground">@{c.nickname}</span>{" "}
                  (will appear after approval)
                </div>

                <CommentForm
                  kind={kind}
                  id={feedId}
                  parentId={c.id}
                  defaultBody={`@${c.nickname} `}
                />
              </div>
            ) : null}
          </div>
        ))
      ) : (
        <div className="text-sm text-muted-foreground">No comments yet.</div>
      )}

      {/* new root comment */}
      <CommentForm kind={kind} id={feedId} />
    </div>
  );
}
