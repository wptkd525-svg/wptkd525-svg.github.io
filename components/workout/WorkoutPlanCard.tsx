import type { Exercise, Stretch, WorkoutPlan } from "@/lib/data/types";
import { glassCardClass } from "@/lib/ui-classes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WorkoutPlanCardProps {
  plan: WorkoutPlan;
}

function StretchSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Stretch[];
}) {
  if (items.length === 0) return null;

  return (
    <Card className={glassCardClass}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((stretch, index) => (
          <div
            key={stretch.id}
            className="flex gap-3 rounded-lg border border-white/10 p-4 bg-white/5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {index + 1}
            </span>
            <div className="flex-1">
              <p className="font-medium">{stretch.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {stretch.duration} · {stretch.description}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ExerciseSection({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: Exercise[];
}) {
  if (items.length === 0) return null;

  return (
    <Card className={glassCardClass}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((exercise, index) => (
          <div
            key={exercise.id}
            className="flex gap-3 rounded-lg border border-white/10 p-4 bg-white/5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {index + 1}
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium">{exercise.name}</p>
                <Badge variant="outline" className="text-xs">
                  {exercise.type === "compound" ? "복합" : "고립"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {exercise.defaultSets}세트 × {exercise.defaultReps} · 휴식{" "}
                {exercise.restSeconds}초
              </p>
              <p className="text-sm mt-1">{exercise.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function WorkoutPlanCard({ plan }: WorkoutPlanCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {plan.bodyParts.map((part) => (
          <Badge key={part} variant="secondary">
            {part}
          </Badge>
        ))}
      </div>

      {plan.missingEquipment && plan.missingEquipment.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-950/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-base text-amber-300">
              추가 기구가 있으면 더 다양한 운동이 가능합니다
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {plan.missingEquipment.map((item) => (
                <Badge key={item} variant="outline">
                  {item}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <StretchSection
        title="워밍업 스트레칭"
        description="본 운동 전 몸을 풀어주세요."
        items={plan.warmup}
      />

      <ExerciseSection
        title="메인 운동"
        description={`${plan.mainExercises.length}가지 운동을 순서대로 진행하세요.`}
        items={plan.mainExercises}
      />

      <StretchSection
        title="쿨다운"
        description="운동 후 근육을 이완하세요."
        items={plan.cooldown}
      />

      {plan.tips && (
        <Card className={glassCardClass}>
          <CardHeader>
            <CardTitle className="text-lg">코치 팁</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {plan.tips}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
