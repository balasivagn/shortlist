"use client";
import { useState } from "react";
import { ExternalLink, Share2, ChevronDown, ChevronUp, Star, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ResearchResult } from "@/lib/contracts";

export function RecommendationCard({
  recommendation,
  shortlist,
}: {
  recommendation: ResearchResult["recommendation"];
  shortlist: ResearchResult["shortlist"];
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const ranked = shortlist.find((p) => p.product.id === recommendation.productId);
  const product = ranked?.product;
  const confidence = Math.round(recommendation.confidence * 100);

  function handleShare() {
    const url = product?.url ?? globalThis.location.href;
    const text = `ShortList pick: ${product?.name ?? "Top pick"}\n${recommendation.headline}\n\n${url}`;
    if (navigator.share) {
      navigator.share({ title: "My ShortList pick", text, url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <Card className="border-[#E85D2A]/40 bg-[#FFF0EB]/40 overflow-hidden">
      {/* Top label */}
      <div className="px-5 pt-4 pb-0 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
        <span className="text-xs font-mono tracking-[0.1em] uppercase text-[#E85D2A]">Top Pick</span>
        <span className="ml-auto text-xs font-mono text-muted-foreground">{confidence}% confidence</span>
      </div>

      <CardContent className="pt-3 pb-4 space-y-4">
        {/* Winner name + price + rating */}
        <div>
          <h2 className="text-xl font-semibold text-foreground leading-snug">
            {product?.name ?? "—"}
          </h2>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {product?.priceText && (
              <span className="text-sm font-mono text-foreground">{product.priceText}</span>
            )}
            {product?.rating != null && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="w-3 h-3 fill-[#E85D2A] text-[#E85D2A]" />
                <span className="font-mono">{product.rating.toFixed(1)}</span>
                {product.reviewCount != null && (
                  <span className="font-mono text-muted-foreground/60">({product.reviewCount.toLocaleString()} reviews)</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* One-line why */}
        <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.headline}</p>

        {/* Primary actions */}
        <div className="flex gap-2">
          {product?.url ? (
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E85D2A] hover:bg-[#d14e1f] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.97]"
            >
              <ExternalLink className="w-4 h-4" />
              Shop on {product.marketplace ?? "Amazon"}
            </a>
          ) : (
            <a
              href={`https://www.amazon.in/s?k=${encodeURIComponent(product?.name ?? "vegetable chopper")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E85D2A] hover:bg-[#d14e1f] text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.97]"
            >
              <ExternalLink className="w-4 h-4" />
              Search on Amazon India
            </a>
          )}
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 border border-border bg-background hover:bg-secondary text-sm px-4 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.97]"
          >
            {copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Share2 className="w-4 h-4" />}
            {copied ? "Copied" : "Share"}
          </button>
        </div>

        {/* Expandable detail */}
        <button
          onClick={() => setDetailOpen((v) => !v)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {detailOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {detailOpen ? "Hide detail" : "Why this pick + watch-outs"}
        </button>

        {detailOpen && (
          <div className="space-y-3 pt-1 border-t border-border/60">
            <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.why}</p>

            {recommendation.watchOuts.length > 0 && (
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Watch-outs</p>
                <ul className="space-y-1.5">
                  {recommendation.watchOuts.map((w) => (
                    <li key={w} className="text-xs text-muted-foreground flex gap-1.5">
                      <span className="text-[#E85D2A] shrink-0 mt-0.5">⚠</span>
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
                  className="bg-[#E85D2A] h-1.5 rounded-full"
                  style={{ width: `${confidence}%` }}
                />
              </div>
              <span className="text-xs font-mono text-[#E85D2A]">{confidence}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
