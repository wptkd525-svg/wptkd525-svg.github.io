import { Suspense } from "react";
import { SurveyContent } from "@/components/survey/SurveyContent";
import { PageShell } from "@/components/layout/PageShell";
import { pageSubtitleClass, pageTitleClass } from "@/lib/ui-classes";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function SurveyPage() {
  return (
    <PageShell maxWidth="2xl">
      <div className="text-center mb-8">
        <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-2">
          Step 1
        </p>
        <h1 className={pageTitleClass}>헬스장 기구 설문</h1>
        <p className={cn(pageSubtitleClass, "max-w-lg mx-auto")}>
          사용 가능한 기구를 알려주시면 맞춤 운동 루틴을 추천해 드립니다.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-64 mx-auto bg-white/10" />
            <Skeleton className="h-64 w-full bg-white/10" />
          </div>
        }
      >
        <SurveyContent />
      </Suspense>
    </PageShell>
  );
}
