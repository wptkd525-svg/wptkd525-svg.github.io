"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/data/chat-types";
import { glassCardInnerClass } from "@/lib/ui-classes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkoutChatProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  loading: boolean;
  disabled?: boolean;
}

export function WorkoutChat({
  messages,
  input,
  onInputChange,
  onSend,
  loading,
  disabled,
}: WorkoutChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && !disabled && input.trim()) {
        onSend();
      }
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-[420px] border border-white/15 rounded-lg overflow-hidden",
        glassCardInnerClass,
      )}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-white/60 text-center py-8">
            운동 코치에게 자유롭게 요청해 보세요.
            <br />
            <span className="text-xs text-white/45">
              예: &quot;어깨 아파서 오버헤드 프레스 빼줘&quot;, &quot;초보자용으로 쉽게&quot;
            </span>
          </p>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex",
              msg.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap",
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-black/50 border border-white/15 text-white/90",
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-white/60">
              루틴을 구성하고 있습니다...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3 flex gap-2 bg-black/30">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="루틴 수정이나 요청을 입력하세요..."
          disabled={loading || disabled}
          rows={2}
          className="flex-1 resize-none rounded-lg border border-white/15 bg-black/40 text-white placeholder:text-white/40 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
        />
        <Button
          onClick={onSend}
          disabled={loading || disabled || !input.trim()}
          className="self-end"
        >
          전송
        </Button>
      </div>
    </div>
  );
}
