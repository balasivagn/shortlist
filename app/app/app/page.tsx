"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { MemoryCard } from "@/components/dossier/MemoryCard";
import { CriteriaCard } from "@/components/dossier/CriteriaCard";
import { ProgressCard } from "@/components/dossier/ProgressCard";
import { ProductCard } from "@/components/dossier/ProductCard";
import { RecommendationCard } from "@/components/dossier/RecommendationCard";
import { MemorySaveCard } from "@/components/dossier/MemorySaveCard";
import type { ResearchResult } from "@/lib/contracts";
import Link from "next/link";
import Image from "next/image";

type Message = { role: "user" | "assistant"; content: string };

const DEMO_QUERY = "Find a vegetable chopper for my elderly parents in India.";

const LOADING_STEPS = [
  "Loading remembered preferences…",
  "Discovering product candidates…",
  "Collecting reviews and evidence…",
  "Identifying red flags…",
  "Scoring against your criteria…",
  "Generating recommendation…",
];

export default function AppPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendQuery(query: string) {
    if (!query.trim() || loading) return;
    setInput("");
    setError(null);
    setResult(null);
    setProgressSteps([]);
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx < LOADING_STEPS.length) {
        setProgressSteps((prev) => [...prev, LOADING_STEPS[stepIdx]]);
        stepIdx++;
      }
    }, 1800);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          query,
          location: "India",
          productCategory: "vegetable chopper",
          explicitConstraints: [
            "elderly friendly",
            "dishwasher safe",
            "easy cleaning",
            "avoid food-contact plastic if possible",
          ],
        }),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Research failed");
      }

      const data: ResearchResult = await res.json();
      setProgressSteps(data.researchProgress);
      setResult(data);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've researched ${data.shortlist.length} vegetable choppers for you. The top pick is **${data.shortlist[0]?.product.name}** with a score of ${data.shortlist[0]?.totalScore}/100. ${data.recommendation.why}`,
        },
      ]);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I hit an error: ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-auto" />
            <span className="font-serif text-xl text-foreground">ShortList</span>
          </Link>
          <span className="text-border select-none">·</span>
          <p className="text-xs text-muted-foreground">From endless options to confident decisions.</p>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div className="w-[420px] shrink-0 flex flex-col border-r border-border bg-card">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#E85D2A]" />
              </div>
              <div>
                <h2 className="font-serif text-2xl text-foreground mb-2">
                  Amazon gives options.<br />ShortList gives confidence.
                </h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  On Wednesday, I was asked to find a vegetable chopper for elderly parents in
                  India. I spent hours scrolling, comparing, and still hadn&apos;t ordered. That&apos;s
                  the problem ShortList solves.
                </p>
              </div>
              <button
                onClick={() => sendQuery(DEMO_QUERY)}
                className="inline-flex items-center gap-2 text-sm bg-[#E85D2A] hover:bg-[#d14e1f] text-white px-5 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.97]"
              >
                Try the demo query
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      m.role === "user"
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.content.split("**").map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j}>{part}</strong>
                      ) : (
                        <span key={j}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl px-3.5 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-[#E85D2A] border-t-transparent rounded-full animate-spin" />
                    Researching…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="shrink-0 border-t border-border px-4 py-3">
            <div className="flex gap-2 items-end">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ShortList to find a product…"
                disabled={loading}
                className="flex-1 resize-none rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E85D2A]/30 disabled:opacity-50"
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={() => sendQuery(input)}
                disabled={loading || !input.trim()}
                className="inline-flex items-center justify-center bg-[#E85D2A] hover:bg-[#d14e1f] disabled:opacity-40 text-white h-9 w-9 rounded-xl transition-all duration-150 active:scale-[0.97]"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Research Dossier */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {!result && !loading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground font-mono">Your research dossier will appear here.</p>
            </div>
          )}

          {(loading || result) && (
            <ProgressCard steps={progressSteps} loading={loading} />
          )}

          {result && (
            <>
              <MemoryCard memories={result.rememberedPreferences} />
              <CriteriaCard criteria={result.criteria} />
              <RecommendationCard
                recommendation={result.recommendation}
                shortlist={result.shortlist}
              />
              <div className="space-y-3">
                <h3 className="text-xs font-mono tracking-[0.1em] uppercase text-muted-foreground">Shortlist</h3>
                {result.shortlist.map((p, i) => (
                  <ProductCard key={p.product.id} product={p} rank={i} />
                ))}
              </div>
              <MemorySaveCard suggestions={result.memorySuggestions} userId="demo-user" />
            </>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
