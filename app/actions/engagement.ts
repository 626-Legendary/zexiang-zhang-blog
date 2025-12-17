// app/actions/engagement.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export type CommentActionState =
  | { ok: true; message: string }
  | { ok: false; message: string };

function mustKind(kind: string) {
  if (kind !== "thoughts" && kind !== "life") throw new Error("invalid kind");
  return kind as "thoughts" | "life";
}

async function getOrSetAnonId() {
  const store = await cookies();
  let anonId = store.get("anon_id")?.value;

  if (!anonId) {
    anonId = crypto.randomUUID();
    try {
      store.set("anon_id", anonId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    } catch {
      // ignore
    }
  }
  return anonId;
}

// ✅ 匿名/登录都可以点赞（不跳登录）
export async function toggleLikeAction(formData: FormData) {
  const kind = mustKind(String(formData.get("kind") ?? ""));
  const id = String(formData.get("id") ?? "");

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const anonId = user ? null : await getOrSetAnonId();

  const base = supabase
    .from("likes")
    .select("id")
    .eq("feed_kind", kind)
    .eq("feed_id", id);

  const { data: existing, error: e1 } = user
    ? await base.eq("user_id", user.id).maybeSingle()
    : await base.eq("anon_id", anonId!).maybeSingle();

  if (e1) throw e1;

  if (existing?.id) {
    const del = supabase.from("likes").delete().eq("id", existing.id);
    const { error } = user ? await del.eq("user_id", user.id) : await del.eq("anon_id", anonId!);
    if (error) throw error;
  } else {
    const payload: any = { feed_kind: kind, feed_id: id };
    if (user) payload.user_id = user.id;
    else payload.anon_id = anonId;

    const { error } = await supabase.from("likes").insert(payload);
    if (error) throw error;
  }

  revalidatePath(`/${kind}`);
}

// ✅ 匿名评论：支持回复 parent_id（同样审核）
export async function addCommentAction(
  _prev: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const kind = mustKind(String(formData.get("kind") ?? ""));
  const id = String(formData.get("id") ?? "");

  const nickname = String(formData.get("nickname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  const parentIdRaw = String(formData.get("parent_id") ?? "").trim();
  const parentId = parentIdRaw ? Number(parentIdRaw) : null;

  if (!nickname || !email || !body) {
    return { ok: false, message: "Please fill out all fields." };
  }

  // 可选：如果你用了 ADMIN_UID+owner_id 模式就保留；没用也不影响（列不存在会报错）
  const ownerId = process.env.ADMIN_UID;

  const supabase = await createClient();

  const payload: any = {
    feed_kind: kind,
    feed_id: id,
    nickname,
    email,
    body,
    is_approved: false,
    parent_id: parentId,
  };

  if (ownerId) payload.owner_id = ownerId;

  const { error } = await supabase.from("comments").insert(payload);

  if (error) {
    const msg = (error.message || "").includes("comment_rate_limited")
      ? "You’re commenting too fast. Please wait 30 seconds and try again."
      : error.message ?? "Failed to comment.";
    return { ok: false, message: msg };
  }

  revalidatePath(`/${kind}`);
  return { ok: true, message: "Thanks for your comment! It will show up after approval." };
}
