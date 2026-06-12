"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserMemory } from "@/lib/contracts";

const typeColor: Record<string, string> = {
  preference: "bg-secondary text-foreground border border-border",
  constraint: "bg-[#FFF0EB] text-[#E85D2A] border border-[#E85D2A]/20",
  context: "bg-secondary text-muted-foreground border border-border",
  decision_rule: "bg-secondary text-foreground border border-border",
};

export function MemoryCard({ memories }: { memories: UserMemory[] }) {
  if (!memories.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
          Remembered Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {memories.map((m, i) => (
          <span
            key={m.id ?? i}
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${typeColor[m.type] ?? "bg-secondary text-muted-foreground border border-border"}`}
          >
            {m.text}
          </span>
        ))}
      </CardContent>
    </Card>
  );
}
