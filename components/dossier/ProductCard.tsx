"use client";
import { CheckCircle, AlertTriangle, Star, ExternalLink, Globe, ShoppingBag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RankedProduct } from "@/lib/contracts";

const verdictConfig = {
  top_pick: { label: "Top Pick", classes: "bg-[#FFF0EB] text-[#E85D2A] border-[#E85D2A]/30" },
  good_option: { label: "Good Option", classes: "bg-secondary text-foreground border-border" },
  avoid: { label: "Avoid", classes: "bg-destructive/10 text-destructive border-destructive/30" },
  needs_more_research: { label: "Needs Research", classes: "bg-secondary text-muted-foreground border-border" },
};

const severityConfig = { low: "text-muted-foreground", medium: "text-[#E85D2A]", high: "text-destructive" };


function truncateDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function sourceLabel(src: string): { label: string; classes: string; icon: "amazon" | "web" } | null {
  if (src.includes("amazon") || src === "serpapi") return { label: "Amazon", classes: "bg-[#FFF0EB] text-[#E85D2A] border-[#E85D2A]/20", icon: "amazon" };
  if (src === "fallback") return null;
  return { label: "Web", classes: "bg-secondary text-muted-foreground border-border", icon: "web" };
}

export function ProductCard({ product, rank }: Readonly<{ product: RankedProduct; rank: number }>) {
  const vc = verdictConfig[product.verdict];
  return (
    <Card className={rank === 0 ? "border-[#E85D2A]/40" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">#{rank + 1}</span>
              <CardTitle className="text-base font-medium text-foreground">
                {product.product.name}
              </CardTitle>
              {(() => {
                const src = sourceLabel(product.product.discoverySource);
                return src ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${src.classes}`}>
                    {src.icon === "amazon" ? <ShoppingBag className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                    {src.label}
                  </span>
                ) : null;
              })()}
            </div>
            {product.product.brand && (
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">{product.product.brand}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${vc.classes}`}>
              {vc.label}
            </span>
            <span className="text-xs text-muted-foreground font-mono">{product.totalScore}/100</span>
            {product.product.rating != null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-[#E85D2A] text-[#E85D2A]" />
                <span className="font-mono">{product.product.rating.toFixed(1)}</span>
                {product.product.reviewCount != null && (
                  <span className="font-mono text-muted-foreground/60">({product.product.reviewCount.toLocaleString()})</span>
                )}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{product.fitSummary}</p>

        {product.constraintScores.length > 0 && (
          <div className="space-y-1">
            {product.constraintScores.slice(0, 4).map((cs) => (
              <div key={cs.criterionId} className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-full h-1.5">
                  <div
                    className="bg-[#E85D2A] h-1.5 rounded-full"
                    style={{ width: `${cs.score * 10}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-28 truncate font-mono">{cs.criterionId}</span>
                <span className="text-xs font-mono text-foreground w-6 text-right">{cs.score}</span>
              </div>
            ))}
          </div>
        )}

        {product.topEvidence.length > 0 && (
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-[0.08em] mb-1">Evidence</p>
            <ul className="space-y-1.5">
              {product.topEvidence.slice(0, 2).map((e, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#22C55E] shrink-0 mt-0.5" />
                  <span>
                    <span className="line-clamp-2">{e.claim}</span>
                    {e.sourceUrl && (
                      <a
                        href={e.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 ml-1 text-[#E85D2A] hover:underline"
                        title={e.sourceTitle ?? e.sourceUrl}
                      >
                        [{truncateDomain(e.sourceUrl)}]
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {product.redFlags.length > 0 && (
          <div>
            <p className="text-xs font-mono text-destructive uppercase tracking-[0.08em] mb-1">Red Flags</p>
            <ul className="space-y-1.5">
              {product.redFlags.map((r, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${severityConfig[r.severity]}`} />
                  <span>
                    <span className="line-clamp-2">{r.risk}</span>
                    {r.sourceUrl && (
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 ml-1 text-[#E85D2A] hover:underline"
                        title={r.sourceTitle ?? r.sourceUrl}
                      >
                        [{truncateDomain(r.sourceUrl)}]
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {product.product.url && (
          <a
            href={product.product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[#E85D2A] hover:underline font-mono"
          >
            View on {product.product.marketplace ?? "store"}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
}
