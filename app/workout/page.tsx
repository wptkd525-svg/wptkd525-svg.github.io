"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredProfileId } from "@/lib/profile-storage";
import {
  clearChatSession,
  createMessageId,
  loadChatSession,
  saveChatSession,
} from "@/lib/chat-storage";
import type { ChatMessage } from "@/lib/data/chat-types";
import type { BodyPart, WorkoutPlan } from "@/lib/data/types";
import { BodyPartSelector } from "@/components/workout/BodyPartSelector";
import { WorkoutChat } from "@/components/workout/WorkoutChat";
import { WorkoutPlanCard } from "@/components/workout/WorkoutPlanCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageShell } from "@/components/layout/PageShell";
import { glassCardClass, pageSubtitleClass, pageTitleClass } from "@/lib/ui-classes";

export default function WorkoutPage() {
  const router = useRouter();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [selectedParts, setSelectedParts] = useState<BodyPart[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const id = getStoredProfileId();
    if (!id) {
      router.replace("/survey");
      return;
    }

    fetch(`/api/profile?id=${id}`)
      .then((res) => {
        if (!res.ok) {
          router.replace("/survey");
          return;
        }
        setProfileId(id);

        const session = loadChatSession();
        if (session && session.profileId === id) {
          setSelectedParts(session.bodyParts);
          setMessages(session.messages);
          setPlan(session.plan);
        }
      })
      .catch(() => router.replace("/survey"))
      .finally(() => setCheckingProfile(false));
  }, [router]);

  useEffect(() => {
    if (!profileId) return;
    saveChatSession({
      profileId,
      bodyParts: selectedParts,
      messages,
      plan,
    });
  }, [profileId, selectedParts, messages, plan]);

  const sendChat = async (userMessage: string) => {
    if (!profileId || selectedParts.length === 0) {
      setError("운동 부위를 하나 이상 선택해 주세요.");
      return;
    }

    const userMsg: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: userMessage,
      timestamp: Date.now(),
    };

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/workout/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          bodyParts: selectedParts,
          message: userMessage,
          history,
          currentPlan: plan,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "요청 처리에 실패했습니다.");
      }

      const assistantMsg: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        content: data.reply as string,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setPlan(data.plan as WorkoutPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "요청 처리에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    const parts = selectedParts.join(", ");
    void sendChat(`오늘 ${parts} 운동 루틴을 만들어 주세요.`);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    void sendChat(msg);
  };

  const handleReset = () => {
    clearChatSession();
    setMessages([]);
    setPlan(null);
    setChatInput("");
    setError(null);
  };

  if (checkingProfile) {
    return (
      <PageShell>
        <Skeleton className="h-10 w-64 bg-white/10" />
        <Skeleton className="h-32 w-full bg-white/10 mt-4" />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-primary text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            WorkOut Agent
          </p>
          <h1 className={pageTitleClass}>오늘의 운동 계획</h1>
          <p className={pageSubtitleClass}>
            부위를 선택하고 코치와 대화하며 루틴을 만들어 보세요.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-white/20 bg-black/30 text-white hover:bg-white/10"
          >
            대화 초기화
          </Button>
          <Link
            href="/survey?edit=true"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-white/20 bg-black/30 text-white hover:bg-white/10",
            )}
          >
            기구 수정
          </Link>
        </div>
      </div>

      <Card className={cn("mb-6", glassCardClass)}>
        <CardHeader>
          <CardTitle>운동 부위 선택</CardTitle>
          <CardDescription>
            오늘 운동할 부위를 선택한 뒤 루틴을 생성하거나 채팅으로 수정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <BodyPartSelector
            selected={selectedParts}
            onChange={setSelectedParts}
          />
          <Button
            onClick={handleGenerate}
            disabled={loading || selectedParts.length === 0}
          >
            {loading && messages.length === 0
              ? "루틴 생성 중..."
              : "운동 루틴 생성"}
          </Button>
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>

      <Card className={cn("mb-6", glassCardClass)}>
        <CardHeader>
          <CardTitle className="text-white">운동 코치</CardTitle>
          <CardDescription>
            루틴 수정, 난이도 조절, 운동 제외 등을 요청할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkoutChat
            messages={messages}
            input={chatInput}
            onInputChange={setChatInput}
            onSend={handleChatSend}
            loading={loading}
            disabled={selectedParts.length === 0}
          />
        </CardContent>
      </Card>

      {plan && !loading && <WorkoutPlanCard plan={plan} />}
      {loading && messages.length > 0 && (
        <div className="space-y-4 mt-6">
          <Skeleton className="h-32 w-full bg-white/10" />
          <Skeleton className="h-48 w-full bg-white/10" />
        </div>
      )}
    </PageShell>
  );
}
