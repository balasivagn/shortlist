"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StepState = "pending" | "active" | "done";

interface StepEntry {
  label: string;
  detail?: string;
  state: StepState;
}

function stepTextClass(state: StepState): string {
  if (state === "done") return "text-muted-foreground";
  if (state === "active") return "text-foreground font-medium";
  return "text-muted-foreground/40";
}

export function ProgressCard({
  plan,
  completedSteps,
  activeStep,
  loading,
}: Readonly<{
  plan: string[];
  completedSteps: { label: string; detail?: string }[];
  activeStep: string | null;
  loading: boolean;
}>) {
  const steps: StepEntry[] = plan.map((label) => {
    const completed = completedSteps.find((c) => c.label === label);
    if (completed) return { label, detail: completed.detail, state: "done" };
    if (activeStep === label) return { label, state: "active" };
    return { label, state: "pending" };
  });

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
      <CardContent className="space-y-2">
        {steps.map((s) => (
          <div key={s.label} className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 w-4 flex justify-center">
              {s.state === "done" && <span className="text-[#22C55E] text-sm">✓</span>}
              {s.state === "active" && (
                <span className="inline-block w-3 h-3 mt-0.5 border-2 border-[#E85D2A] border-t-transparent rounded-full animate-spin" />
              )}
              {s.state === "pending" && (
                <span className="w-1.5 h-1.5 mt-1 rounded-full bg-border" />
              )}
            </span>
            <div className="min-w-0">
              <span className={`text-sm ${stepTextClass(s.state)}`}>
                {s.label}
              </span>
              {s.detail && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.detail}</p>
              )}
            </div>
          </div>
        ))}
        {plan.length === 0 && loading && (
          <div className="text-sm text-muted-foreground animate-pulse">Starting…</div>
        )}
      </CardContent>
    </Card>
  );
}
