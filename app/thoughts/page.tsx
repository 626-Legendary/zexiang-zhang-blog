// app/page.tsx
import { Suspense } from "react";

async function SlowBlock() {
  await new Promise((r) => setTimeout(r, 1000)); // ⏱ 1 秒
  return <div>内容加载完成</div>;
}

export default function Page() {
  return (
    <div>
      <Suspense>
        <SlowBlock />
      </Suspense>
    </div>
  );
}