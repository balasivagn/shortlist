"use client";
import { useState } from "react";
import { ExternalLink, Share2, Check, Star, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { ResearchResult } from "@/lib/contracts";

function confidenceColor(pct: number): string {
  if (pct >= 75) return "bg-[#22C55E]";
  if (pct >= 50) return "bg-[#E85D2A]";
  return "bg-destructive";
}

function ConfidenceBar({ value }: { readonly value: number }) {
  const pct = Math.round(value * 100);
  const color = confidenceColor(pct);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-border/60 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-mono text-muted-foreground">{pct}% confident</span>
    </div>
  );
}

export function RecommendationCard({
  recommendation,
  shortlist,
}: {
  readonly recommendation: ResearchResult["recommendation"];
  readonly shortlist: ResearchResult["shortlist"];
}) {
  const [copied, setCopied] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const ranked = shortlist.find((p) => p.product.id === recommendation.productId);
  const product = ranked?.product;
  const imageUrl = product?.thumbnail ?? product?.imageUrl;

  const amazonUrl =
    product?.amazonUrl ??
    `https://www.amazon.in/s?k=${encodeURIComponent(product?.name ?? "vegetable chopper")}`;

  function handleShare() {
    const text = `ShortList pick: ${product?.name ?? "Top pick"}\n${recommendation.headline}\n\n${amazonUrl}`;
    if (navigator.share) {
      navigator.share({ title: "My ShortList pick", text, url: amazonUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <div className="rounded-xl border-2 border-[#E85D2A] bg-[#FFF0EB]/30 overflow-hidden">
      {/* Verdict label */}
      <div className="px-5 pt-4 pb-0 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
        <span className="text-sm font-mono tracking-[0.1em] uppercase text-[#E85D2A] font-semibold">
          Top Pick
        </span>
      </div>

      {/* Product identity row */}
      <div className="px-5 pt-3 pb-4 flex gap-4">
        {/* Product image */}
        <div className="shrink-0">
          {imageUrl && !imgFailed ? (
            <img
              src={imageUrl}
              alt={product?.name ?? ""}
              onError={() => setImgFailed(true)}
              className="w-24 h-24 object-contain rounded-xl bg-white border border-[#E85D2A]/20"
            />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-[#FFF0EB] border border-[#E85D2A]/20 flex items-center justify-center">
              <span className="text-3xl font-bold text-[#E85D2A]">
                {product?.name?.charAt(0).toUpperCase() ?? "?"}
              </span>
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <h2 className="text-2xl font-semibold text-foreground leading-snug">
            {product?.name ?? "—"}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            {product?.priceText && (
              <span className="text-lg font-mono font-semibold text-foreground">{product.priceText}</span>
            )}
            {product?.rating != null && (
              <span className="flex items-center gap-1 text-base text-muted-foreground">
                <Star className="w-4 h-4 fill-[#E85D2A] text-[#E85D2A]" />
                <span className="font-mono">{product.rating.toFixed(1)}</span>
                {product.reviewCount != null && (
                  <span className="font-mono text-muted-foreground/60">
                    ({product.reviewCount.toLocaleString()} reviews)
                  </span>
                )}
              </span>
            )}
          </div>
          <ConfidenceBar value={recommendation.confidence} />
        </div>
      </div>

      {/* Headline — the one-sentence verdict */}
      <div className="px-5 pb-3">
        <p className="text-lg font-medium text-foreground leading-snug">{recommendation.headline}</p>
      </div>

      {/* Why — always expanded, never hidden behind a toggle */}
      <div className="mx-5 mb-4 rounded-lg bg-background/70 border border-border/60 p-4 space-y-3">
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-[0.08em]">Why this pick</p>
        <p className="text-base text-muted-foreground leading-relaxed">{recommendation.why}</p>

        {recommendation.watchOuts.length > 0 && (
          <div className="pt-2 border-t border-border/50 space-y-2">
            <p className="text-sm font-mono text-[#E85D2A] uppercase tracking-[0.08em]">Watch-outs</p>
            {recommendation.watchOuts.map((w) => (
              <div key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="w-4 h-4 text-[#E85D2A] shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Constraints satisfied — visual trust signal */}
      {ranked && ranked.constraintScores.some((cs) => cs.score >= 7) && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {ranked.constraintScores
            .filter((cs) => cs.score >= 7)
            .slice(0, 5)
            .map((cs) => (
              <span
                key={cs.criterionId}
                className="inline-flex items-center gap-1.5 text-sm bg-[#F0FDF4] text-[#22C55E] border border-[#22C55E]/30 px-2.5 py-1 rounded-full"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {cs.criterionId.replaceAll("-", " ")}
              </span>
            ))}
        </div>
      )}

      {/* CTAs */}
      <div className="px-5 pb-5 flex gap-2">
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[#E85D2A] hover:bg-[#d14e1f] text-white text-base font-medium px-4 py-3 rounded-lg transition-all duration-150 active:scale-[0.97]"
        >
          <ExternalLink className="w-4 h-4" />
          Buy on {product?.marketplace ?? "Amazon India"}
        </a>
        <button
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-1.5 border border-border bg-background hover:bg-secondary text-base px-4 py-3 rounded-lg transition-all duration-150 active:scale-[0.97]"
        >
          {copied ? <Check className="w-4 h-4 text-[#22C55E]" /> : <Share2 className="w-4 h-4" />}
          {copied ? "Copied" : "Share"}
        </button>
      </div>
    </div>
  );
}
