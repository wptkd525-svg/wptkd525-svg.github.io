"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredProfileId } from "@/lib/profile-storage";
import { PageShell } from "@/components/layout/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const profileId = getStoredProfileId();
    if (!profileId) {
      router.replace("/survey");
      return;
    }

    fetch(`/api/profile?id=${profileId}`)
      .then((res) => {
        if (res.ok) {
          router.replace("/workout");
        } else {
          router.replace("/survey");
        }
      })
      .catch(() => router.replace("/survey"));
  }, [router]);

  return (
    <PageShell maxWidth="2xl" className="flex flex-col items-center justify-center min-h-screen text-center">
      <p className="text-primary text-xs font-semibold tracking-[0.3em] uppercase mb-4">
        AI Workout Coach
      </p>
      <h1 className={cn(pageTitleClass, "text-5xl sm:text-6xl mb-4")}>WorkOut</h1>
      <p className={cn(pageSubtitleClass, "mb-10 max-w-md")}>
        나의 헬스장 기구에 맞는 맞춤 운동 루틴을 AI 코치가 추천해 드립니다.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/survey" className={cn(buttonVariants(), "px-8")}>
          시작하기
        </Link>
        <Link
          href="/workout"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-white/20 bg-black/30 text-white hover:bg-white/10 px-8",
          )}
        >
          운동 계획
        </Link>
      </div>
    </PageShell>
  );
}
