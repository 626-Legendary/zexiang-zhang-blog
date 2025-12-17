// app/admin/page.tsx
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  LayoutDashboard,
  MessageSquareWarning,
  NotebookPen,
  Camera,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle2,
  BarChart3,
} from "lucide-react";

type FeedRow = {
  id: string;
  content: string;
  image_url: string | null; // legacy
  image_urls: unknown; // jsonb from supabase
  is_public: boolean;
  created_at: string;
};

type PendingComment = {
  id: number;
  feed_kind: "thoughts" | "life";
  feed_id: string;
  nickname: string;
  email: string;
  body: string;
  created_at: string;
  is_approved: boolean;
};

type PageviewRow = {
  id: number;
  path: string;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
};

function normalizeUrls(row: Pick<FeedRow, "image_url" | "image_urls">): string[] {
  const arr = Array.isArray(row.image_urls) ? (row.image_urls as unknown[]) : [];
  const urls = arr.filter((x): x is string => typeof x === "string" && x.length > 0);
  if (urls.length === 0 && row.image_url) return [row.image_url];
  return urls;
}

// ✅ 避免 template string 引号/编码坑：用拼接
function formatWhen(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  return date + " • " + time;
}

function formatIP(ip: string | null) {
  if (!ip) return "-";
  // inet 有时会带 ::ffff: 前缀（IPv4 mapped）
  return ip.replace(/^::ffff:/, "");
}

function ImageGrid({ urls }: { urls: string[] }) {
  const count = urls.length;
  if (count === 0) return null;

  if (count === 1) {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border bg-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls[0]}
          alt=""
          loading="lazy"
          className="h-auto w-full max-h-[520px] object-contain"
        />
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {urls.slice(0, 2).map((u) => (
          <div key={u} className="aspect-square overflow-hidden rounded-lg border bg-card">
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
          <div key={u} className="relative aspect-square overflow-hidden rounded-lg border bg-card">
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

async function uploadImages(opts: { userId: string; folder: "thoughts" | "life"; files: File[] }) {
  const supabase = await createClient();
  const urls: string[] = [];

  for (const file of opts.files) {
    if (!file || file.size === 0) continue;

    const extRaw = file.name.split(".").pop() || "jpg";
    const ext = extRaw.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const filePath = `${opts.userId}/${opts.folder}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("thought-images")
      .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("thought-images").getPublicUrl(filePath);
    urls.push(data.publicUrl);
  }

  return urls;
}

// ---------- Thoughts actions ----------
async function createThoughtAction(formData: FormData) {
  "use server";

  const content = String(formData.get("content") ?? "").trim();
  const isPublic = formData.get("is_public") === "on";
  const files = formData.getAll("images").filter((x): x is File => x instanceof File && x.size > 0);

  if (!content) return;

  const supabase = await createClient();
  const { data: claims, error: claimsErr } = await supabase.auth.getClaims();
  if (claimsErr || !claims?.claims) redirect("/auth/login?next=/admin");

  const userId = String(claims.claims.sub);
  const imageUrls = await uploadImages({ userId, folder: "thoughts", files });

  const { error } = await supabase.from("thoughts").insert({
    author_id: userId,
    content,
    is_public: isPublic,
    image_urls: imageUrls,
  });

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/thoughts");
}

async function toggleThoughtVisibility(id: string, current: boolean) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.from("thoughts").update({ is_public: !current }).eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/thoughts");
}

async function deleteThought(id: string) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.from("thoughts").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/thoughts");
}

// ---------- Life actions ----------
async function createLifeAction(formData: FormData) {
  "use server";

  const content = String(formData.get("content") ?? "").trim();
  const isPublic = formData.get("is_public") === "on";
  const files = formData.getAll("images").filter((x): x is File => x instanceof File && x.size > 0);

  if (!content) return;

  const supabase = await createClient();
  const { data: claims, error: claimsErr } = await supabase.auth.getClaims();
  if (claimsErr || !claims?.claims) redirect("/auth/login?next=/admin");

  const userId = String(claims.claims.sub);
  const imageUrls = await uploadImages({ userId, folder: "life", files });

  const { error } = await supabase.from("life").insert({
    author_id: userId,
    content,
    is_public: isPublic,
    image_urls: imageUrls,
  });

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/life");
}

async function toggleLifeVisibility(id: string, current: boolean) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.from("life").update({ is_public: !current }).eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/life");
}

async function deleteLife(id: string) {
  "use server";
  const supabase = await createClient();
  const { error } = await supabase.from("life").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/life");
}

// ---------- Comment moderation actions ----------
async function approveComment(id: number, feedKind: "thoughts" | "life") {
  "use server";
  const supabase = await createClient();

  const { error } = await supabase.from("comments").update({ is_approved: true }).eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath(`/${feedKind}`);
}

async function deleteCommentById(id: number) {
  "use server";
  const supabase = await createClient();

  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/admin");
}

export default async function AdminPage() {
  const supabase = await createClient();

  // ✅ claims 鉴权（稳定）
  const { data: claims, error: claimsErr } = await supabase.auth.getClaims();
  if (claimsErr || !claims?.claims) redirect("/auth/login?next=/admin");

  const userId = String(claims.claims.sub);
  const email = (claims.claims as any).email ?? (claims.claims as any).user_email ?? "";

  const { data: thoughts, error: tErr } = await supabase
    .from("thoughts")
    .select("id, content, image_url, image_urls, is_public, created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (tErr) throw tErr;

  const { data: life, error: lErr } = await supabase
    .from("life")
    .select("id, content, image_url, image_urls, is_public, created_at")
    .eq("author_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (lErr) throw lErr;

  // ✅ Pending comments（join 优先）
  const { data: pendingComments, error: cErr } = await supabase
    .from("comments")
    .select(
      `
        id, feed_kind, feed_id, nickname, email, body, created_at, is_approved,
        thoughts:thoughts!comments_feed_id_fkey ( author_id ),
        life:life!comments_feed_id_fkey ( author_id )
      `
    )
    .eq("is_approved", false)
    .order("created_at", { ascending: false })
    .limit(200);

  // ✅ Analytics (admin-only by RLS)
  // 注意：非 admin 会因为 RLS 读不到，这里我们优雅降级为 0 + 空列表
  const now = new Date();
  const la = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
  );
  const laStart = new Date(la.getFullYear(), la.getMonth(), la.getDate(), 0, 0, 0);
  // 把“洛杉矶零点”转换成 UTC ISO 用于过滤 created_at(timestamptz)
  const laStartUtcISO = new Date(laStart.getTime() - (la.getTimezoneOffset() * 60 * 1000)).toISOString();

  const [totalRes, todayRes, recentRes] = await Promise.all([
    supabase.from("pageviews").select("*", { count: "exact", head: true }),
    supabase.from("pageviews").select("*", { count: "exact", head: true }).gte("created_at", laStartUtcISO),
    supabase
      .from("pageviews")
      .select("id, path, ip, user_agent, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const analytics = {
    totalPv: totalRes.count ?? 0,
    todayPv: todayRes.count ?? 0,
    recentViews: (recentRes.data ?? []) as PageviewRow[],
    canSee: !totalRes.error && !todayRes.error && !recentRes.error,
  };

  if (cErr) {
    const { data: pc2, error: e2 } = await supabase
      .from("comments")
      .select("id, feed_kind, feed_id, nickname, email, body, created_at, is_approved")
      .eq("is_approved", false)
      .order("created_at", { ascending: false })
      .limit(200);
    if (e2) throw e2;

    return renderAdmin({
      email: email || userId,
      thoughts: (thoughts ?? []) as FeedRow[],
      life: (life ?? []) as FeedRow[],
      pending: (pc2 ?? []) as PendingComment[],
      analytics,
      actions: {
        createThoughtAction,
        createLifeAction,
        toggleThoughtVisibility,
        toggleLifeVisibility,
        deleteThought,
        deleteLife,
        approveComment,
        deleteCommentById,
      },
    });
  }

  const raw = (pendingComments ?? []) as any[];
  const filtered = raw
    .filter((c) => {
      const tOwner = c.thoughts?.author_id;
      const lOwner = c.life?.author_id;
      return (tOwner && tOwner === userId) || (lOwner && lOwner === userId);
    })
    .map(
      (c) =>
        ({
          id: c.id,
          feed_kind: c.feed_kind,
          feed_id: c.feed_id,
          nickname: c.nickname,
          email: c.email,
          body: c.body,
          created_at: c.created_at,
          is_approved: c.is_approved,
        }) as PendingComment
    );

  return renderAdmin({
    email: email || userId,
    thoughts: (thoughts ?? []) as FeedRow[],
    life: (life ?? []) as FeedRow[],
    pending: filtered,
    analytics,
    actions: {
      createThoughtAction,
      createLifeAction,
      toggleThoughtVisibility,
      toggleLifeVisibility,
      deleteThought,
      deleteLife,
      approveComment,
      deleteCommentById,
    },
  });
}

function ComposeCard(opts: {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: (fd: FormData) => Promise<void>;
  placeholder: string;
}) {
  const { title, description, icon, action, placeholder } = opts;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={action} className="space-y-4">
          <Textarea name="content" placeholder={placeholder} required className="min-h-28 resize-y" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Input type="file" name="images" accept="image/*" multiple className="sm:max-w-[320px]" />
            </div>

            {/* ✅ 用原生 checkbox：Server Component 安全、formData 兼容 */}
            <div className="flex items-center gap-2">
              <input
                id={`${title}-public`}
                type="checkbox"
                name="is_public"
                defaultChecked
                className="h-4 w-4 rounded border"
              />
              <Label htmlFor={`${title}-public`} className="text-sm text-muted-foreground select-none">
                Public
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full sm:w-auto">
            Publish
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function FeedList(opts: {
  rows: FeedRow[];
  kind: "thoughts" | "life";
  onToggle: (id: string, current: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { rows, kind, onToggle, onDelete } = opts;

  if (!rows.length) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">No items yet.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {rows.map((t) => {
        const urls = normalizeUrls(t);
        return (
          <Card key={t.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm leading-6 whitespace-pre-wrap">{t.content}</p>
                </div>

                <Badge variant={t.is_public ? "default" : "secondary"} className="shrink-0">
                  {t.is_public ? "public" : "private"}
                </Badge>
              </div>

              <ImageGrid urls={urls} />

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{formatWhen(t.created_at)}</span>
                <span className="opacity-50">·</span>
                <span className="uppercase tracking-wide">{kind}</span>

                <span className="flex-1" />

                <form action={onToggle.bind(null, t.id, t.is_public)}>
<Button type="submit" variant="outline" size="sm" className="h-8 gap-2">
  {t.is_public ? (
    <>
      <EyeOff className="h-4 w-4" />
      隐藏
    </>
  ) : (
    <>
      <Eye className="h-4 w-4" />
      公开
    </>
  )}
</Button>

                </form>

                <form action={onDelete.bind(null, t.id)}>
                  <Button type="submit" variant="destructive" size="sm" className="h-8 gap-2">
                    <Trash2 className="h-4 w-4" />
                    删除
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PendingCommentsList(opts: {
  pending: PendingComment[];
  onApprove: (id: number, feedKind: "thoughts" | "life") => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const { pending, onApprove, onDelete } = opts;

  if (!pending.length) {
    return (
      <Card>
        <CardContent className="py-10 text-sm text-muted-foreground">No pending comments.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {pending.map((c) => (
        <Card key={c.id}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{c.nickname}</span>
                <Badge variant="secondary" className="capitalize">
                  {c.feed_kind}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">{formatWhen(c.created_at)}</div>
            </div>

            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{c.body}</p>

            <div className="mt-3 text-xs text-muted-foreground">
              Email (private): <span className="font-mono">{c.email}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <form action={onApprove.bind(null, c.id, c.feed_kind)}>
                <Button type="submit" size="sm" className="h-8 gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </Button>
              </form>

              <form action={onDelete.bind(null, c.id)}>
                <Button type="submit" variant="outline" size="sm" className="h-8 gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsPanel(opts: {
  analytics: {
    totalPv: number;
    todayPv: number;
    recentViews: PageviewRow[];
    canSee: boolean;
  };
}) {
  const { analytics } = opts;

  if (!analytics.canSee) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Analytics</CardTitle>
          <CardDescription>Admin-only</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          You don&apos;t have permission to view analytics.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Visits</CardTitle>
            <CardDescription>All-time pageviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{analytics.totalPv}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Today Visits</CardTitle>
            <CardDescription>America/Los_Angeles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tabular-nums">{analytics.todayPv}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recent Visits</CardTitle>
          <CardDescription>Latest 50 pageviews (admin-only)</CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Path</th>
                  <th className="px-4 py-3 text-left font-medium">IP</th>
                  <th className="px-4 py-3 text-left font-medium">UA</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentViews.map((v) => (
                  <tr key={v.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatWhen(v.created_at)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{v.path}</td>
                    <td className="px-4 py-3 font-mono text-xs">{formatIP(v.ip)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="line-clamp-1">{v.user_agent ?? "-"}</span>
                    </td>
                  </tr>
                ))}
                {!analytics.recentViews.length ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No pageviews yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function renderAdmin(opts: {
  email: string;
  thoughts: FeedRow[];
  life: FeedRow[];
  pending: PendingComment[];
  analytics: {
    totalPv: number;
    todayPv: number;
    recentViews: PageviewRow[];
    canSee: boolean;
  };
  actions: {
    createThoughtAction: (fd: FormData) => Promise<void>;
    createLifeAction: (fd: FormData) => Promise<void>;
    toggleThoughtVisibility: (id: string, current: boolean) => Promise<void>;
    toggleLifeVisibility: (id: string, current: boolean) => Promise<void>;
    deleteThought: (id: string) => Promise<void>;
    deleteLife: (id: string) => Promise<void>;
    approveComment: (id: number, feedKind: "thoughts" | "life") => Promise<void>;
    deleteCommentById: (id: number) => Promise<void>;
  };
}) {
  const { email, thoughts, life, pending, analytics, actions } = opts;

  const stats = {
    thoughts: thoughts.length,
    life: life.length,
    pending: pending.length,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Top bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="secondary">{stats.thoughts} thoughts</Badge>
              <Badge variant="secondary">{stats.life} life</Badge>
              <Badge variant={stats.pending ? "default" : "secondary"} className="gap-1">
                <MessageSquareWarning className="h-3.5 w-3.5" />
                {stats.pending} pending
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md border bg-card px-2 py-1">/thoughts</span>
            <span className="opacity-50">·</span>
            <span className="rounded-md border bg-card px-2 py-1">/life</span>
          </div>
          <LogoutButton />
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Left tabs + right content */}
      <Tabs defaultValue="thoughts" className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Left nav */}
        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Workspace</CardTitle>
            <CardDescription className="text-xs">Compose & manage content</CardDescription>
          </CardHeader>

          <CardContent className="pt-0">
            <TabsList className="grid h-auto w-full grid-cols-1 gap-1 bg-transparent p-0">
              <TabsTrigger
                value="thoughts"
                className="justify-start gap-2 data-[state=active]:bg-accent data-[state=active]:shadow-none"
              >
                <NotebookPen className="h-4 w-4" />
                Thoughts
                <span className="ml-auto text-xs text-muted-foreground">{stats.thoughts}</span>
              </TabsTrigger>

              <TabsTrigger
                value="life"
                className="justify-start gap-2 data-[state=active]:bg-accent data-[state=active]:shadow-none"
              >
                <Camera className="h-4 w-4" />
                Life
                <span className="ml-auto text-xs text-muted-foreground">{stats.life}</span>
              </TabsTrigger>

              <TabsTrigger
                value="comments"
                className="justify-start gap-2 data-[state=active]:bg-accent data-[state=active]:shadow-none"
              >
                <MessageSquareWarning className="h-4 w-4" />
                Pending Comments
                <span className="ml-auto text-xs text-muted-foreground">{stats.pending}</span>
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="justify-start gap-2 data-[state=active]:bg-accent data-[state=active]:shadow-none"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
                <span className="ml-auto text-xs text-muted-foreground">
                  {analytics.canSee ? analytics.todayPv : "-"}
                </span>
              </TabsTrigger>
            </TabsList>

            <Separator className="my-4" />

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Quick stats</span>
                <Badge variant="secondary" className="font-normal">
                  {stats.thoughts + stats.life} total
                </Badge>
              </div>
              <p className="leading-relaxed">
                Tips: use <span className="font-mono">private</span> for drafts, approve comments to
                make them visible.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right panel */}
        <div className="space-y-6">
          <TabsContent value="thoughts" className="m-0 space-y-6">
            <ComposeCard
              title="Thoughts"
              description="Notes / ideas."
              icon={<NotebookPen className="h-4 w-4" />}
              action={actions.createThoughtAction}
              placeholder="Write a thought..."
            />

            <FeedList
              rows={thoughts}
              kind="thoughts"
              onToggle={actions.toggleThoughtVisibility}
              onDelete={actions.deleteThought}
            />
          </TabsContent>

          <TabsContent value="life" className="m-0 space-y-6">
            <ComposeCard
              title="Life"
              description="Life sharing (photo-friendly)."
              icon={<Camera className="h-4 w-4" />}
              action={actions.createLifeAction}
              placeholder="Share something about life..."
            />

            <FeedList
              rows={life}
              kind="life"
              onToggle={actions.toggleLifeVisibility}
              onDelete={actions.deleteLife}
            />
          </TabsContent>

          <TabsContent value="comments" className="m-0 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Pending Comments</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  New comments are hidden until you approve them.
                </p>
              </div>

              <Badge variant="secondary" className="w-fit">
                {pending.length} pending
              </Badge>
            </div>

            <PendingCommentsList
              pending={pending}
              onApprove={actions.approveComment}
              onDelete={actions.deleteCommentById}
            />
          </TabsContent>

          <TabsContent value="analytics" className="m-0">
            <AnalyticsPanel analytics={analytics} />
          </TabsContent>
        </div>
      </Tabs>
    </main>
  );
}
