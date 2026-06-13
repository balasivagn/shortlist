"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";
import { MemoryCard } from "@/components/dossier/MemoryCard";
import { CriteriaCard } from "@/components/dossier/CriteriaCard";
import { ProgressCard } from "@/components/dossier/ProgressCard";
import { ProductCard } from "@/components/dossier/ProductCard";
import { RecommendationCard } from "@/components/dossier/RecommendationCard";
import type { ResearchResult } from "@/lib/contracts";
import Link from "next/link";
import Image from "next/image";

type Message = { role: "user" | "assistant"; content: string };
type CompletedStep = { label: string; detail?: string };

const LOCATION_OPTIONS = [
  { label: "🇺🇸 United States", value: "US" },
  { label: "🇬🇧 United Kingdom", value: "UK" },
  { label: "🇮🇳 India", value: "India" },
  { label: "🇨🇦 Canada", value: "Canada" },
  { label: "🇦🇺 Australia", value: "Australia" },
  { label: "🇩🇪 Germany", value: "Germany" },
  { label: "🇸🇬 Singapore", value: "Singapore" },
  { label: "🇦🇪 UAE", value: "UAE" },
];

function parseSseChunk(part: string): { event: string; payload: unknown } | null {
  const eventMatch = /^event: (\w+)/.exec(part);
  const dataMatch = /^data: (.+)$/m.exec(part);
  if (!eventMatch || !dataMatch) return null;
  return { event: eventMatch[1], payload: JSON.parse(dataMatch[1]) };
}

const DEMO_QUERY = "Find a vegetable chopper for my elderly parents in India.";

function HowWeDecided({ result }: { readonly result: ResearchResult }) {
  const [open, setOpen] = useState(false);
  // Build completed steps from researchProgress for the final dossier view
  const completedSteps: CompletedStep[] = result.researchProgress.map((s) => ({ label: s }));

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
          <ProgressCard
            plan={completedSteps.map((s) => s.label)}
            completedSteps={completedSteps}
            activeStep={null}
            loading={false}
          />
        </div>
      )}
    </div>
  );
}

export default function AppPage() {
  const { userId } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingLocation, setCheckingLocation] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [progressPlan, setProgressPlan] = useState<string[]>([]);
  const [completedSteps, setCompletedSteps] = useState<CompletedStep[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const dossierRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, checkingLocation]);

  useEffect(() => {
    if (result) dossierRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [result]);

  useEffect(() => {
    const q = new URLSearchParams(globalThis.location?.search).get("q");
    if (q) setInput(q);
  }, []);

  async function handleStreamResult(data: ResearchResult) {
    setResult(data);
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Done. Top pick: **${data.shortlist[0]?.product.name}** (${data.shortlist[0]?.totalScore}/100). ${data.recommendation.headline}`,
      },
    ]);
  }

  async function runResearch(query: string) {
    setError(null);
    setResult(null);
    setProgressPlan([]);
    setCompletedSteps([]);
    setActiveStep(null);
    setLoading(true);

    try {
      const res = await fetch("/api/research-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, query }),
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

          if (chunk.event === "plan") {
            setProgressPlan((chunk.payload as { steps: string[] }).steps);
          } else if (chunk.event === "progress") {
            const { step, done: isDone } = chunk.payload as { step: string; done: boolean };
            if (isDone) {
              setCompletedSteps((prev) => [...prev, { label: step }]);
              setActiveStep(null);
            } else {
              setActiveStep(step);
            }
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

  async function sendQuery(query: string) {
    if (!query.trim() || loading || checkingLocation) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);

    setCheckingLocation(true);
    try {
      const check = await fetch("/api/check-location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const { needsLocation } = await check.json();

      if (needsLocation) {
        setPendingQuery(query);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Where are you shopping for this?" },
        ]);
        return;
      }
    } catch {
      // proceed without location if check fails
    } finally {
      setCheckingLocation(false);
    }

    await runResearch(query);
  }

  async function handleLocationPick(location: string) {
    if (!pendingQuery) return;
    const queryWithLocation = pendingQuery + " (shopping in " + location + ")";
    setPendingQuery(null);
    setMessages((prev) => [...prev, { role: "user", content: location }]);
    await runResearch(queryWithLocation);
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
  useEffect(() => {
    if (result) setMobileDossierOpen(true);
  }, [result]);

  const EXAMPLE_QUERIES = [
    "Best air purifier for a dusty apartment",
    "Noise-cancelling headphones under $100",
    "Safe non-stick cookware without PFAS",
  ];

  const isWaiting = loading || checkingLocation;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="shrink-0 bg-card border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="" width={32} height={32} className="h-8 w-auto" />
            <span className="font-serif text-xl text-foreground">ShortList</span>
          </Link>
          <span className="text-border select-none hidden sm:inline">·</span>
          <p className="text-xs text-muted-foreground hidden sm:block">From endless options to confident decisions.</p>
        </div>
        <UserButton />
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
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
                disabled={isWaiting}
                className="inline-flex items-center gap-2 text-sm bg-[#E85D2A] hover:bg-[#d14e1f] disabled:opacity-40 text-white px-5 py-2.5 rounded-lg transition-all duration-150 active:scale-[0.97]"
              >
                Try the demo query
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
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
                      m.role === "user" ? "bg-[#1A1A1A] text-white" : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.content.split("**").map((part, j) =>
                      j % 2 === 1 ? <strong key={part}>{part}</strong> : <span key={part}>{part}</span>
                    )}
                  </div>
                </div>
              ))}

              {pendingQuery && !loading && (
                <div className="flex justify-start">
                  <div className="flex flex-wrap gap-1.5 max-w-[85%]">
                    {LOCATION_OPTIONS.map((loc) => (
                      <button
                        key={loc.value}
                        onClick={() => handleLocationPick(loc.value)}
                        className="text-xs border border-border rounded-full px-3 py-1.5 hover:border-[#E85D2A]/60 hover:bg-[#FFF0EB]/60 transition-all text-foreground"
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isWaiting && (
                <>
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl px-3.5 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
                      <span className="inline-block w-3 h-3 border-2 border-[#E85D2A] border-t-transparent rounded-full animate-spin" />
                      {checkingLocation ? "Checking…" : "Researching…"}
                    </div>
                  </div>
                  <div className="md:hidden">
                    <ProgressCard plan={progressPlan} completedSteps={completedSteps} activeStep={activeStep} loading={loading} />
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

          <div className="shrink-0 border-t border-border px-4 py-3">
            <div className="flex gap-2 items-end">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask ShortList to find a product…"
                disabled={isWaiting}
                aria-label="Search query"
                className="flex-1 resize-none rounded-xl border border-border bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#E85D2A]/30 disabled:opacity-50"
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={() => sendQuery(input)}
                disabled={isWaiting || !input.trim()}
                aria-label="Submit query"
                className="inline-flex items-center justify-center bg-[#E85D2A] hover:bg-[#d14e1f] disabled:opacity-40 text-white h-9 w-9 rounded-xl transition-all duration-150 active:scale-[0.97]"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div
          ref={dossierRef}
          className={`flex-1 overflow-y-auto px-4 md:px-6 py-5 space-y-4 ${mobileDossierOpen ? "block" : "hidden md:block"}`}
        >
          {mobileDossierOpen && (
            <button
              onClick={() => setMobileDossierOpen(false)}
              className="md:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2"
            >
              ← Back to chat
            </button>
          )}

          {!result && !loading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground font-mono">Your research dossier will appear here.</p>
            </div>
          )}

          {loading && (
            <ProgressCard
              plan={progressPlan}
              completedSteps={completedSteps}
              activeStep={activeStep}
              loading={loading}
            />
          )}

          {result && (
            <>
              <RecommendationCard
                recommendation={result.recommendation}
                shortlist={result.shortlist}
                criteriaLabels={criteriaLabels}
              />
              <div className="space-y-3">
                <p className="text-xs font-mono tracking-[0.1em] uppercase text-muted-foreground">Shortlist</p>
                {result.shortlist.map((p, i) => (
                  <ProductCard key={p.product.id} product={p} rank={i} criteriaLabels={criteriaLabels} />
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
