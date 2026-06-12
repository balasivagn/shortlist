"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResearchResult } from "@/lib/contracts";

export function RecommendationCard({
  recommendation,
  shortlist,
}: {
  recommendation: ResearchResult["recommendation"];
  shortlist: ResearchResult["shortlist"];
}) {
  const product = shortlist.find((p) => p.product.id === recommendation.productId);
  const confidence = Math.round(recommendation.confidence * 100);

  return (
    <Card className="border-[#E85D2A]/30 bg-[#FFF0EB]/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[#E85D2A] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
          Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-foreground">{recommendation.headline}</p>
          {product && (
            <p className="text-xs text-[#E85D2A] mt-0.5 font-mono">{product.product.name}</p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{recommendation.why}</p>

        {recommendation.watchOuts.length > 0 && (
          <div>
            <p className="text-xs font-medium text-foreground mb-1">Watch-outs</p>
            <ul className="space-y-0.5">
              {recommendation.watchOuts.map((w, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-[#E85D2A] shrink-0">⚠</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">Confidence</span>
          <div className="flex-1 bg-border rounded-full h-1.5">
            <div
              className="bg-[#E85D2A] h-1.5 rounded-full transition-all"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-xs font-mono text-[#E85D2A]">{confidence}%</span>
        </div>
      </CardContent>
    </Card>
  );
}
