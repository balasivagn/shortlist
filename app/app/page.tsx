"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Zap, ChevronDown, ChevronUp } from "lucide-react";
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

function parseSseChunk(part: string): { event: string; payload: unknown } | null {
  const eventMatch = /^event: (\w+)/.exec(part);
  const dataMatch = /^data: (.+)$/m.exec(part);
  if (!eventMatch || !dataMatch) return null;
  return { event: eventMatch[1], payload: JSON.parse(dataMatch[1]) };
}

const DEMO_QUERY = "Find a vegetable chopper for my elderly parents in India.";

const USED_KEY = "shortlist_used";

function HowWeDecided({ result }: { readonly result: ResearchResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary/40 hover:bg-secondary/70 transition-colors text-sm font-medium text-foreground"
      >
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2A]" />
          <span>How we decided</span>
        </span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="p-4 space-y-4 border-t border-border">
          <MemoryCard memories={result.rememberedPreferences} />
          <CriteriaCard criteria={result.criteria} />
          <ProgressCard steps={result.researchProgress} loading={false} />
          <MemorySaveCard suggestions={result.memorySuggestions} userId="demo-user" />
        </div>
      )}
    </div>
  );
}

export default function AppPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [progressSteps, setProgressSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isLocalhost =
    globalThis.window !== undefined &&
    (location.hostname === "localhost" || location.hostname === "127.0.0.1");
  const [used, setUsed] = useState(() =>
    !isLocalhost &&
    globalThis.window !== undefined &&
    localStorage.getItem(USED_KEY) === "1"
  );
  const [showToast, setShowToast] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const dossierRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Scroll dossier to top when results arrive
  useEffect(() => {
    if (result) {
      dossierRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [result]);

  // Pre-fill input from ?q= query param (landing page popular queries)
  useEffect(() => {
    const q = new URLSearchParams(globalThis.location?.search).get("q");
    if (q) setInput(q);
  }, []);

  function showDemoLimitToast() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  async function handleStreamResult(data: ResearchResult) {
    localStorage.setItem(USED_KEY, "1");
    setUsed(true);
    setResult(data);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Done. Top pick: **${data.shortlist[0]?.product.name}** (${data.shortlist[0]?.totalScore}/100). ${data.recommendation.headline}`,
      },
    ]);
  }

  async function sendQuery(query: string) {
    if (!query.trim() || loading) return;
    if (used) { showDemoLimitToast(); return; }
    setInput("");
    setError(null);
    setResult(null);
    setProgressSteps([]);
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setLoading(true);

    try {
      const res = await fetch("/api/research-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user",
          query,
        }),
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Research failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const chunk = parseSseChunk(part);
          if (!chunk) continue;
          if (chunk.event === "progress") {
            setProgressSteps((prev) => [...prev, (chunk.payload as { step: string }).step]);
          } else if (chunk.event === "result") {
            await handleStreamResult(chunk.payload as ResearchResult);
          } else if (chunk.event === "error") {
            throw new Error((chunk.payload as { message: string }).message);
          }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, something went wrong: ${msg}` },
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

  const criteriaLabels = result
    ? Object.fromEntries(result.criteria.map((c) => [c.id, c.label]))
    : {};

  const [mobileDossierOpen, setMobileDossierOpen] = useState(false);

  // Auto-open dossier on mobile when results arrive
  useEffect(() => {
    if (result) setMobileDossierOpen(true);
  }, [result]);

  const EXAMPLE_QUERIES = [
    "Best air purifier for a dusty apartment",
    "Noise-cancelling headphones under ₹10,000",
    "Safe non-stick cookware without PFAS",
  ];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="shrink-0 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-auto" />
            <span className="font-serif text-xl text-foreground">ShortList</span>
          </Link>
          <span className="text-border select-none hidden sm:inline">·</span>
          <p className="text-xs text-muted-foreground hidden sm:block">From endless options to confident decisions.</p>
        </div>
      </header>

      {/* Mobile: stacked layout. Desktop: side-by-side. */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left: Chat — full width on mobile, fixed width on desktop */}
        <div className={`flex flex-col border-b md:border-b-0 md:border-r border-border bg-card md:w-[420px] md:shrink-0 ${mobileDossierOpen ? "hidden md:flex" : "flex"} flex-1 md:flex-none`}>
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
                disabled={used}
                className="inline-flex items-center gap-2 text-sm bg-[#E85D2A] hover:bg-[#d14e1f] disabled:opacity-40 text-white px-5 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.97]"
              >
                Try the demo query
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {!used && (
                <div className="w-full max-w-xs space-y-1.5">
                  <p className="text-xs text-muted-foreground text-center font-mono">or try your own</p>
                  {EXAMPLE_QUERIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="w-full text-left text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-secondary/60 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.length > 0 && (
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m) => (
                <div
                  key={`${m.role}-${m.content.slice(0, 40)}`}
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
                        <strong key={part}>{part}</strong>
                      ) : (
                        <span key={part}>{part}</span>
                      )
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <>
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl px-3.5 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border-2 border-[#E85D2A] border-t-transparent rounded-full animate-spin" />
                      Researching…
                    </div>
                  </div>
                  {/* Show progress inline on mobile since the right pane is hidden */}
                  <div className="md:hidden">
                    <ProgressCard steps={progressSteps} loading={loading} />
                  </div>
                </>
              )}
              {result && (
                <button
                  onClick={() => setMobileDossierOpen(true)}
                  className="md:hidden w-full text-sm bg-[#E85D2A] hover:bg-[#d14e1f] text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2"
                >
                  View full dossier
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="shrink-0 border-t border-border px-4 py-3 space-y-2">
            {showToast && (
              <div className="rounded-lg bg-[#1A1A1A] text-white text-xs px-3 py-2 flex items-center gap-2">
                <span className="text-[#E85D2A]">●</span>
                <span>
                  This is a demo — each browser gets one free query.{" "}
                  <span className="underline cursor-pointer">Join the waitlist.</span>
                </span>
              </div>
            )}
            {used && !showToast && (
              <p className="text-xs text-muted-foreground text-center">
                Demo limit reached — one query per browser.
              </p>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={used ? "Demo limit reached." : "Ask ShortList to find a product…"}
                disabled={loading || used}
                aria-label="Search query"
                className="flex-1 resize-none rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E85D2A]/30 disabled:opacity-50"
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={() => sendQuery(input)}
                disabled={loading || !input.trim() || used}
                aria-label="Submit query"
                className="inline-flex items-center justify-center bg-[#E85D2A] hover:bg-[#d14e1f] disabled:opacity-40 text-white h-9 w-9 rounded-xl transition-all duration-150 active:scale-[0.97]"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Research Dossier — full screen on mobile when open, always visible on desktop */}
        <div
          ref={dossierRef}
          className={`flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4 ${mobileDossierOpen ? "block" : "hidden md:block"}`}
        >
          {/* Mobile back button */}
          {mobileDossierOpen && (
            <button
              onClick={() => setMobileDossierOpen(false)}
              className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              ← Back to chat
            </button>
          )}

          {/* Empty state */}
          {!result && !loading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground font-mono">Your research dossier will appear here.</p>
            </div>
          )}

          {/* Loading — show live progress */}
          {loading && (
            <ProgressCard steps={progressSteps} loading={loading} />
          )}

          {/* Results */}
          {result && (
            <>
              <RecommendationCard
                recommendation={result.recommendation}
                shortlist={result.shortlist}
                criteriaLabels={criteriaLabels}
              />

              <div className="space-y-3">
                <p className="text-xs font-mono tracking-[0.1em] uppercase text-muted-foreground">
                  Shortlist
                </p>
                {result.shortlist.map((p, i) => (
                  <ProductCard
                    key={p.product.id}
                    product={p}
                    rank={i}
                    criteriaLabels={criteriaLabels}
                  />
                ))}
              </div>

              <HowWeDecided result={result} />
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
