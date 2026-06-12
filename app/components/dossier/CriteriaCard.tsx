"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvaluationCriterion } from "@/lib/contracts";

const sourceColor: Record<string, string> = {
  explicit: "text-[#22C55E]",
  memory: "text-[#E85D2A]",
  inferred: "text-muted-foreground",
};

export function CriteriaCard({ criteria }: { criteria: EvaluationCriterion[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
          Evaluation Criteria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {criteria.map((c) => (
          <div key={c.id} className="flex items-center justify-between text-sm">
            <span className="text-foreground">{c.label}</span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${sourceColor[c.source] ?? "text-muted-foreground"}`}>{c.source}</span>
              <span className="text-xs font-mono text-muted-foreground w-8 text-right">
                {c.weight}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
