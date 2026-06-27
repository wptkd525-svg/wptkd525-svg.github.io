"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getStoredProfileId } from "@/lib/profile-storage";
import { EquipmentSurvey } from "@/components/survey/EquipmentSurvey";
import { Skeleton } from "@/components/ui/skeleton";

export function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);

  useEffect(() => {
    const id = getStoredProfileId();
    if (!id) {
      setLoading(false);
      return;
    }

    fetch(`/api/profile?id=${id}`)
      .then(async (res) => {
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!isEdit) {
          router.replace("/workout");
          return;
        }
        setProfileId(data.id);
        setEquipment(data.equipment);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router, isEdit]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <EquipmentSurvey
      initialEquipment={equipment}
      profileId={profileId ?? undefined}
      mode={isEdit ? "edit" : "create"}
    />
  );
}
