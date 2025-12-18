// app/life/page.tsx
import { createClient } from "@/lib/supabase/server";
import { toggleLikeAction } from "@/app/actions/engagement";
import { CommentThread } from "@/components/comment-thread";
import { ZMX } from "../fonts";

type Life = {
  id: string;
  content: string;
  image_url: string | null;
  image_urls: unknown;
  created_at: string;
};

type CountRow = { feed_id: string; like_count?: number; comment_count?: number };
type LikeRow = { feed_id: string };

type CommentRow = {
  id: number;
  feed_id: string;
  parent_id: number | null;
  nickname: string;
  body: string;
  created_at: string;
};

function normalizeUrls(row: Pick<Life, "image_url" | "image_urls">): string[] {
  const arr = Array.isArray(row.image_urls) ? (row.image_urls as unknown[]) : [];
  const urls = arr.filter((x): x is string => typeof x === "string" && x.length > 0);
  if (urls.length === 0 && row.image_url) return [row.image_url];
  return urls;
}

function ImageGrid({ urls }: { urls: string[] }) {
  const count = urls.length;
  if (count === 0) return null;

  if (count === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-md border bg-background">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urls[0]} alt="" loading="lazy" className="h-auto w-full max-h-[520px] object-contain" />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {urls.slice(0, 2).map((u) => (
          <div key={u} className="aspect-square overflow-hidden rounded-md border bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" loading="lazy" className="h-full w-full object-cover" />
          </div>
        ))}
      </div>
    );
  }

  const shown = urls.slice(0, 9);
  const extra = count - shown.length;

  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {shown.map((u, i) => {
        const isLast = i === shown.length - 1 && extra > 0;
        return (
          <div key={u} className="relative aspect-square overflow-hidden rounded-md border bg-background">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" loading="lazy" className="h-full w-full object-cover" />
            {isLast ? (
              <div className="absolute inset-0 grid place-items-center bg-black/45 text-white text-sm font-medium">
                +{extra}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function buildThreads(list: CommentRow[]) {
  const roots: CommentRow[] = [];
  const repliesByParent = new Map<number, CommentRow[]>();

  for (const c of list) {
    if (c.parent_id == null) roots.push(c);
    else {
      const arr = repliesByParent.get(c.parent_id) ?? [];
      arr.push(c);
      repliesByParent.set(c.parent_id, arr);
    }
  }
  return { roots, repliesByParent };
}

export default async function LifePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;

  const { data, error } = await supabase
    .from("life")
    .select("id, content, image_url, image_urls, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;

  const items = (data ?? []) as Life[];
  const ids = items.map((t) => t.id);

  const [{ data: likeCounts }, { data: commentCounts }] = await Promise.all([
    ids.length
      ? supabase.from("like_counts").select("feed_id, like_count").eq("feed_kind", "life").in("feed_id", ids)
      : Promise.resolve({ data: [] as any }),
    ids.length
      ? supabase.from("comment_counts").select("feed_id, comment_count").eq("feed_kind", "life").in("feed_id", ids)
      : Promise.resolve({ data: [] as any }),
  ]);

  const likeMap = new Map<string, number>(
    (likeCounts as CountRow[] | null)?.map((r) => [r.feed_id, r.like_count ?? 0]) ?? []
  );
  const commentMap = new Map<string, number>(
    (commentCounts as CountRow[] | null)?.map((r) => [r.feed_id, r.comment_count ?? 0]) ?? []
  );

  let likedSet = new Set<string>();
  if (user && ids.length) {
    const { data: likedRows } = await supabase
      .from("likes")
      .select("feed_id")
      .eq("feed_kind", "life")
      .eq("user_id", user.id)
      .in("feed_id", ids);

    likedSet = new Set((likedRows as LikeRow[] | null)?.map((r) => r.feed_id) ?? []);
  }

  const { data: commentsRaw } = ids.length
    ? await supabase
      .from("comments")
      .select("id, feed_id, parent_id, nickname, body, created_at")
      .eq("feed_kind", "life")
      .eq("is_approved", true)
      .in("feed_id", ids)
      .order("created_at", { ascending: true })
      .limit(600)
    : { data: [] as any };

  const commentsByFeed = new Map<string, CommentRow[]>();
  for (const c of (commentsRaw as CommentRow[] | null) ?? []) {
    const arr = commentsByFeed.get(c.feed_id) ?? [];
    arr.push(c);
    commentsByFeed.set(c.feed_id, arr);
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">生活</h1>
        <div className={ZMX.className}>
          
          <p className="mt-1 text-xl text-muted-foreground">人间至味是清欢</p>
        </div>

      </header>

      <section className="divide-y rounded-lg border bg-card">
        {items.length > 0 ? (
          items.map((t) => {
            const urls = normalizeUrls(t);
            const likeCount = likeMap.get(t.id) ?? 0;
            const commentCount = commentMap.get(t.id) ?? 0;
            const liked = likedSet.has(t.id);

            const list = commentsByFeed.get(t.id) ?? [];
            const { roots, repliesByParent } = buildThreads(list);

            return (
              <article key={t.id} className="p-5">
                <p className="text-sm leading-6 whitespace-pre-wrap">{t.content}</p>

                <ImageGrid urls={urls} />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>

                  <div className="flex items-center gap-2">
                    <form action={toggleLikeAction}>
                      <input type="hidden" name="kind" value="life" />
                      <input type="hidden" name="id" value={t.id} />
                      <button className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs hover:bg-accent">
                        <span>{liked ? "♥" : "♡"}</span>
                        <span>{likeCount}</span>
                      </button>
                    </form>

                    <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground">
                      💬 <span>{commentCount}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <CommentThread kind="life" feedId={t.id} roots={roots} repliesByParent={repliesByParent} />
                </div>
              </article>
            );
          })
        ) : (
          <p className="p-6 text-sm text-muted-foreground">No public life updates yet.</p>
        )}
      </section>
    </main>
  );
}
