"use client";
import { useState } from "react";
import { CheckCircle, AlertTriangle, Star, ExternalLink, Globe, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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

function ProductImage({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setFailed(true)}
        className="w-16 h-16 object-contain rounded-lg bg-secondary/60 shrink-0 border border-border/40"
      />
    );
  }
  return (
    <div className="w-16 h-16 rounded-lg bg-[#FFF0EB] flex items-center justify-center shrink-0 border border-[#E85D2A]/20">
      <span className="text-xl font-semibold text-[#E85D2A]">{initial}</span>
    </div>
  );
}

export function ProductCard({ product, rank, criteriaLabels }: {
  readonly product: RankedProduct;
  readonly rank: number;
  readonly criteriaLabels?: Record<string, string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const vc = verdictConfig[product.verdict];
  const imageUrl = product.product.thumbnail ?? product.product.imageUrl;
  const amazonUrl = product.product.amazonUrl ?? `https://www.amazon.in/s?k=${encodeURIComponent(product.product.name)}`;
  const sourceIsAmazon = product.product.discoverySource === "serpapi";
  const topRedFlag = product.redFlags[0];

  return (
    <Card className={rank === 0 ? "border-[#E85D2A]/40" : ""}>
      {/* Always-visible summary row */}
      <div className="p-4 flex items-start gap-3">
        <ProductImage src={imageUrl} name={product.product.name} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="font-mono text-sm text-muted-foreground">#{rank + 1}</span>
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border ${vc.classes}`}>
                  {vc.label}
                </span>
                {(() => {
                  const src = sourceLabel(product.product.discoverySource);
                  return src ? (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded border ${src.classes}`}>
                      {src.icon === "amazon" ? <ShoppingBag className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                      {src.label}
                    </span>
                  ) : null;
                })()}
              </div>
              <p className="text-base font-medium text-foreground leading-snug">{product.product.name}</p>
              {product.product.brand && (
                <p className="text-sm text-muted-foreground font-mono">{product.product.brand}</p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-base font-semibold font-mono text-foreground" title="Fit score for your constraints out of 100">
                {product.totalScore}<span className="text-xs font-normal text-muted-foreground"> fit</span>
              </span>
              {product.product.rating != null && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-3.5 h-3.5 fill-[#E85D2A] text-[#E85D2A]" />
                  <span className="font-mono">{product.product.rating.toFixed(1)}</span>
                  {product.product.reviewCount != null && (
                    <span className="font-mono text-muted-foreground/60">({product.product.reviewCount.toLocaleString()})</span>
                  )}
                </span>
              )}
              {product.product.priceText && (
                <span className="text-sm font-mono font-medium text-foreground">{product.product.priceText}</span>
              )}
            </div>
          </div>

          {/* Top red flag — always visible, never buried */}
          {topRedFlag && (
            <div className={`mt-2 flex items-start gap-1.5 text-sm rounded-md px-2.5 py-2 ${
              topRedFlag.severity === "high"
                ? "bg-destructive/8 text-destructive"
                : "bg-[#FFF0EB] text-[#E85D2A]"
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{topRedFlag.risk}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expand / collapse */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-border/60 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
      >
        <span>{expanded ? "Hide details" : "Show evidence & scores"}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {expanded && (
        <CardContent className="space-y-4 pt-3 pb-4">
          <p className="text-base text-muted-foreground leading-relaxed">{product.fitSummary}</p>

          {product.constraintScores.length > 0 && (
            <div className="space-y-2">
              {product.constraintScores.slice(0, 4).map((cs) => (
                <div key={cs.criterionId} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-40 truncate">
                    {criteriaLabels?.[cs.criterionId] ?? cs.criterionId.replaceAll("-", " ")}
                  </span>
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-[#E85D2A] h-2 rounded-full"
                      style={{ width: `${cs.score * 10}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono text-foreground w-4 text-right">{cs.score}</span>
                </div>
              ))}
            </div>
          )}

          {product.topEvidence.length > 0 && (
            <div>
              <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.08em] mb-2">Evidence</p>
              <ul className="space-y-2">
                {product.topEvidence.slice(0, 2).map((e) => (
                  <li key={e.sourceUrl ?? e.claim} className="text-sm text-muted-foreground flex gap-2">
                    <CheckCircle className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
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
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.redFlags.length > 1 && (
            <div>
              <p className="text-sm font-mono text-destructive uppercase tracking-[0.08em] mb-2">All Red Flags</p>
              <ul className="space-y-2">
                {product.redFlags.map((r, i) => (
                  <li key={`${r.risk}-${i}`} className="text-sm text-muted-foreground flex gap-2">
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${severityConfig[r.severity]}`} />
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
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <a
              href={amazonUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#E85D2A] hover:underline font-mono"
            >
              {sourceIsAmazon ? "View on Amazon India" : "Search on Amazon India"}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            {!sourceIsAmazon && product.product.url && (
              <a
                href={product.product.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline font-mono"
              >
                View source
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
