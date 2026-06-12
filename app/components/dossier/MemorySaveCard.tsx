"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MemorySaveCard({
  suggestions,
  userId = "demo-user",
}: {
  suggestions: string[];
  userId?: string;
}) {
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(text: string, idx: number) {
    setSaving(idx);
    setError(null);
    try {
      const res = await fetch("/api/memory/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, text, type: "preference" }),
      });
      const data = await res.json();
      if (data.ok) {
        setSaved((prev) => new Set([...prev, idx]));
      } else {
        setError(data.error ?? "Failed to save");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
          Save Preferences to Memory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground flex-1 italic font-mono">"{s}"</p>
            {saved.has(i) ? (
              <span className="text-xs text-[#22C55E] font-mono shrink-0">✓ Saved</span>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 px-2 shrink-0 border-border hover:bg-secondary"
                disabled={saving === i}
                onClick={() => handleSave(s, i)}
              >
                {saving === i ? "Saving…" : "Save"}
              </Button>
            )}
          </div>
        ))}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
