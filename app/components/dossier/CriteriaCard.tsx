"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EvaluationCriterion } from "@/lib/contracts";

const sourceConfig: Record<string, { label: string; classes: string }> = {
  explicit: { label: "you said this", classes: "bg-[#F0FDF4] text-[#22C55E] border-[#22C55E]/30" },
  memory: { label: "from memory", classes: "bg-[#FFF0EB] text-[#E85D2A] border-[#E85D2A]/30" },
  inferred: { label: "inferred", classes: "bg-secondary text-muted-foreground border-border" },
};

export function CriteriaCard({ criteria }: { criteria: EvaluationCriterion[] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
          Evaluation Criteria
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Each product is scored 0–10 on these criteria. The % is how much each one counts toward the final score.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {criteria.map((c) => {
          const src = sourceConfig[c.source] ?? sourceConfig.inferred;
          return (
            <div key={c.id} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-foreground truncate">{c.label}</span>
                  <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${src.classes}`}>
                    {src.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-semibold text-foreground shrink-0">
                  {c.weight}% of score
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-[#E85D2A] h-1.5 rounded-full"
                    style={{ width: `${c.weight}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
