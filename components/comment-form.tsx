// components/comment-form.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useActionState } from "react";
import { addCommentAction, type CommentActionState } from "@/app/actions/engagement";

export function CommentForm(props: {
  kind: "thoughts" | "life";
  id: string;
  parentId?: number;
  defaultBody?: string;
}) {
  const initialState: CommentActionState = useMemo(
    () => ({ ok: true, message: "" }),
    []
  );

  const [state, formAction, pending] = useActionState(addCommentAction, initialState);

  // 提交成功后：清空 body（简单处理：依赖 key 变化强制 reset）
  // 这里不搞复杂 ref，保持稳定即可
  useEffect(() => {
    // no-op (UI会显示成功提示)
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="kind" value={props.kind} />
      <input type="hidden" name="id" value={props.id} />
      {props.parentId ? <input type="hidden" name="parent_id" value={String(props.parentId)} /> : null}

      <div className="grid gap-2 sm:grid-cols-2">
        <input
          name="nickname"
          placeholder="Nickname"
          required
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        />
        <input
          name="email"
          placeholder="Email (private)"
          type="email"
          required
          className="h-9 w-full rounded-md border bg-background px-3 text-sm"
        />
      </div>

      <textarea
        name="body"
        defaultValue={props.defaultBody ?? ""}
        placeholder="Write a comment..."
        required
        className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm leading-6"
      />

      <div className="flex items-center justify-between gap-3">
        <div className="text-xs">
          {state.message ? (
            <span className={state.ok ? "text-muted-foreground" : "text-red-500"}>
              {state.message}
            </span>
          ) : (
            <span className="text-muted-foreground">
              Comments are reviewed before they appear.
            </span>
          )}
        </div>

        <button
          disabled={pending}
          className="rounded-md bg-primary px-3 py-2 text-xs text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
