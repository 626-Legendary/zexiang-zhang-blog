//server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // ✅ 你的 Next 版本里 cookies() 是 Promise，所以必须 await
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          // ✅ await 后 cookieStore 就有 getAll()
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            // ✅ Server Component 里 cookieStore 类型是 ReadonlyRequestCookies
            //    类型上没有 set，但某些运行时场景可能允许/需要
            //    所以这里用类型断言绕过 TS
            const store = cookieStore as unknown as {
              set: (name: string, value: string, options?: any) => void;
            };

            cookiesToSet.forEach(({ name, value, options }) => {
              store.set(name, value, options);
            });
          } catch {
            // 在 Server Component 场景下 set 可能不允许，忽略即可
          }
        },
      },
    }
  );
}
