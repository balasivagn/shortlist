"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProgressCard({
  steps,
  loading,
}: {
  steps: string[];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
          Research Progress
          {loading && (
            <span className="ml-1 inline-block w-3 h-3 border-2 border-[#E85D2A] border-t-transparent rounded-full animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {steps.filter((s) => s?.trim()).map((s) => (
          <div key={s} className="flex items-start gap-2 text-sm text-muted-foreground">
            <span className="text-[#22C55E] mt-0.5 shrink-0">✓</span>
            <span>{s}</span>
          </div>
        ))}
        {loading && steps.length === 0 && (
          <div className="text-sm text-muted-foreground animate-pulse">Starting research…</div>
        )}
      </CardContent>
    </Card>
  );
}
