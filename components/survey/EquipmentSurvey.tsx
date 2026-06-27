"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EQUIPMENT_CATEGORIES } from "@/lib/data/equipment";
import { setStoredProfileId } from "@/lib/profile-storage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { glassCardClass, glassCardInnerClass } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

interface EquipmentSurveyProps {
  initialEquipment?: string[];
  profileId?: string;
  mode?: "create" | "edit";
}

export function EquipmentSurvey({
  initialEquipment = [],
  profileId,
  mode = "create",
}: EquipmentSurveyProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initialEquipment),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = EQUIPMENT_CATEGORIES.length + 1;
  const isConfirmStep = step === EQUIPMENT_CATEGORIES.length;
  const currentCategory = EQUIPMENT_CATEGORIES[step];
  const progress = ((step + 1) / totalSteps) * 100;

  const toggleEquipment = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNext = () => {
    if (!isConfirmStep && step < EQUIPMENT_CATEGORIES.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (!isConfirmStep) {
      setStep(EQUIPMENT_CATEGORIES.length);
      return;
    }
    void handleSubmit();
  };

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    if (selected.size === 0) {
      setError("최소 하나 이상의 기구를 선택해 주세요.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const equipment = [...selected];
      const response = await fetch("/api/profile", {
        method: mode === "edit" && profileId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "edit" && profileId
            ? { id: profileId, equipment }
            : { equipment },
        ),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "저장에 실패했습니다.");
      }

      const data = await response.json();
      setStoredProfileId(data.id);
      router.push("/workout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", glassCardClass)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">
            {step + 1} / {totalSteps}
          </Badge>
        </div>
        <Progress value={progress} className="mb-4" />
        <CardTitle>
          {isConfirmStep ? "선택 확인" : currentCategory.title}
        </CardTitle>
        <CardDescription>
          {isConfirmStep
            ? "선택한 기구를 확인하고 저장해 주세요."
            : currentCategory.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isConfirmStep ? (
          <div className="space-y-4">
            {selected.size === 0 ? (
              <p className="text-muted-foreground text-sm">
                선택된 기구가 없습니다. 이전 단계로 돌아가 기구를 선택해 주세요.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {[...selected].map((id) => (
                  <Badge key={id} variant="outline">
                    {id}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {currentCategory.items.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <Checkbox
                  checked={selected.has(item.id)}
                  onCheckedChange={() => toggleEquipment(item.id)}
                />
                <span className="font-medium">{item.name}</span>
              </label>
            ))}
          </div>
        )}

        {error && (
          <p className="text-destructive text-sm mt-4">{error}</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0 || loading}
        >
          이전
        </Button>
        <Button onClick={handleNext} disabled={loading}>
          {loading
            ? "저장 중..."
            : isConfirmStep
              ? "저장하고 시작하기"
              : "다음"}
        </Button>
      </CardFooter>
    </Card>
  );
}
