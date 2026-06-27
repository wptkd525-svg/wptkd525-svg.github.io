"use client";

import { BODY_PARTS, type BodyPart } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BodyPartSelectorProps {
  selected: BodyPart[];
  onChange: (parts: BodyPart[]) => void;
}

export function BodyPartSelector({ selected, onChange }: BodyPartSelectorProps) {
  const toggle = (part: BodyPart) => {
    if (selected.includes(part)) {
      onChange(selected.filter((p) => p !== part));
    } else {
      onChange([...selected, part]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {BODY_PARTS.map((part) => {
        const isSelected = selected.includes(part);
        return (
          <button
            key={part}
            type="button"
            onClick={() => toggle(part)}
            className={cn(
              "rounded-full transition-colors",
              isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-black/80" : "",
            )}
          >
            <Badge
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "px-4 py-2 text-sm cursor-pointer",
                isSelected
                  ? ""
                  : "border-white/25 bg-black/30 text-white hover:bg-white/10",
              )}
            >
              {part}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
