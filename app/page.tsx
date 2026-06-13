import { Search, Shield, Sparkles, CheckCircle, ArrowRight, MessageSquare, Filter, Award, AlertTriangle, Brain, RotateCcw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663040712705/RTVDCW5ubXM8xavmHS2suj/shortlist-hero-2LkdRvFbjWVACsyP5qSxhE.webp";
const PROBLEM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663040712705/RTVDCW5ubXM8xavmHS2suj/shortlist-problem-H9W64yxgxHEXFEAxQAtJza.webp";
const SOLUTION_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663040712705/RTVDCW5ubXM8xavmHS2suj/shortlist-solution-XLSGT5wMSa5A7N6MbKSyJx.webp";
const DEMO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663040712705/RTVDCW5ubXM8xavmHS2suj/shortlist-demo-3rEcGK34g6ZPe6Wc3tMYnC.webp";

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="w-2 h-2 rounded-full bg-[#E85D2A]" />
      <span className="font-mono text-xs tracking-[0.1em] uppercase text-muted-foreground">
        {children}
      </span>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={36} height={36} className="h-9 w-auto" />
            <span className="font-serif text-2xl text-foreground">ShortList</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Problem</a>
            <a href="#solution" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solution</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#why" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why ShortList</a>
          </div>
          <Link
            href="/app"
            className="inline-flex items-center bg-[#E85D2A] hover:bg-[#d14e1f] text-white text-sm px-5 py-2 rounded-lg transition-all duration-150 active:scale-[0.97]"
          >
            Try ShortList
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <SectionLabel>AI Buying Advisor</SectionLabel>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground mb-6">
                From endless options to confident decisions.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                ShortList researches product options against your actual constraints, finds red flags, and gives you a clear recommendation you can trust.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center bg-[#1A1A1A] hover:bg-[#333] text-white text-base px-7 py-3 rounded-lg transition-all duration-150 active:scale-[0.97] gap-2"
                >
                  Try ShortList
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center text-base px-7 py-3 rounded-lg border border-border hover:bg-secondary transition-all duration-150 active:scale-[0.97]"
                >
                  See How It Works
                </a>
              </div>
            </div>
            <div className="relative">
              <img
                src={HERO_IMG}
                alt="From many options to one confident choice"
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Popular Queries */}
          <div className="mt-20">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#E85D2A]" />
              <span className="font-mono text-xs tracking-[0.1em] uppercase text-muted-foreground">
                Popular Queries
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { query: "Best vegetable chopper for elderly parents", stat: "Researched in 30s" },
                { query: "Noise-cancelling headphones under $200", stat: "5 red flags found" },
                { query: "Ergonomic office chair for back pain", stat: "3 options ranked" },
                { query: "Safe non-stick cookware without PFAS", stat: "Evidence-backed pick" },
              ].map((item) => (
                <Link
                  key={item.query}
                  href={`/app?q=${encodeURIComponent(item.query)}`}
                  className="group border border-border rounded-xl p-5 hover:shadow-lg hover:shadow-black/[0.04] hover:border-[#E85D2A]/40 transition-all duration-200"
                >
                  <p className="text-sm font-medium text-foreground mb-3 leading-snug">{item.query}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                    <span className="font-mono text-xs text-muted-foreground">{item.stat}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="py-20 md:py-32 bg-secondary/50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <SectionLabel>The Problem</SectionLabel>
              <h2 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight text-foreground mb-6">
                Search solved discovery. It didn&apos;t solve decisions.
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>My mother called from India and asked me to help find a vegetable chopper. It sounded like a five-minute task.</p>
                <p>I opened Amazon. Hundreds of options. I watched YouTube videos. Checked ratings. Compared materials. Looked for dishwasher safety. Thought about whether it would be easy for my parents to use and clean.</p>
                <p className="text-foreground font-medium">Two days later, I still hadn&apos;t placed the order. Not because I couldn&apos;t find products. Because I couldn&apos;t decide.</p>
              </div>
              <div className="mt-8 p-5 bg-background rounded-xl border border-border">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-[#E85D2A] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">The real gap</p>
                    <p className="text-sm text-muted-foreground mt-1">Amazon gives options. YouTube gives opinions. Reviews give noise. Sponsored rankings and influencer content make trust harder.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl shadow-black/5">
              <img src={PROBLEM_IMG} alt="Overwhelmed by too many options" className="w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="solution" className="py-20 md:py-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
              <img src={SOLUTION_IMG} alt="ShortList AI presenting a clear recommendation" className="w-full h-auto" />
            </div>
            <div className="order-1 lg:order-2">
              <SectionLabel>The Solution</SectionLabel>
              <h2 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight text-foreground mb-6">
                A shortlist you can trust.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                ShortList is an AI buying advisor that researches product options against your actual constraints, finds red flags, and gives a clear recommendation.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: Search, title: "Research", desc: "Scans options across sources" },
                  { icon: Filter, title: "Evaluate", desc: "Checks against your constraints" },
                  { icon: Award, title: "Recommend", desc: "Ranked shortlist with reasoning" },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-secondary/70 rounded-xl">
                    <item.icon className="w-5 h-5 text-[#E85D2A] mb-3" />
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 bg-secondary/50">
        <div className="container">
          <SectionLabel>How It Works</SectionLabel>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight text-foreground mb-4 max-w-2xl">
            As simple as telling a friend what you need.
          </h2>
          <p className="text-lg text-muted-foreground mb-16 max-w-xl">
            Describe what you&apos;re looking for in plain language. ShortList handles the research, evaluation, and ranking.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: MessageSquare,
                title: "Describe your need",
                desc: "Tell ShortList what you're looking for and who it's for. Include any constraints that matter to you.",
                example: '"Find a vegetable chopper for my elderly parents in India"',
              },
              {
                step: "02",
                icon: Brain,
                title: "AI researches & evaluates",
                desc: "ShortList searches across sources, checks evidence, identifies red flags, and evaluates against your constraints.",
                example: "Easy cleaning, dishwasher safe, elderly-friendly, low plastic, durable",
              },
              {
                step: "03",
                icon: CheckCircle,
                title: "Get your shortlist",
                desc: "Receive a ranked recommendation with clear reasoning for each choice. Save preferences for next time.",
                example: "Top pick with confidence score and evidence trail",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-background border border-border rounded-2xl p-8 h-full hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs text-muted-foreground">{item.step}</span>
                  <item.icon className="w-5 h-5 text-[#E85D2A]" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-3">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.desc}</p>
                <div className="p-3 bg-secondary/70 rounded-lg">
                  <p className="text-xs font-mono text-muted-foreground italic">{item.example}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl overflow-hidden shadow-xl shadow-black/5">
            <img src={DEMO_IMG} alt="ShortList demo flow — from search to recommendation" className="w-full h-auto" />
          </div>
        </div>
      </section>

      {/* Why ShortList */}
      <section id="why" className="py-20 md:py-32">
        <div className="container">
          <SectionLabel>Why ShortList</SectionLabel>
          <h2 className="font-serif text-4xl md:text-5xl leading-[1.1] tracking-tight text-foreground mb-4 max-w-3xl">
            Most shopping tools optimize for products. ShortList optimizes for confidence.
          </h2>
          <p className="text-lg text-muted-foreground mb-16 max-w-xl">
            It doesn&apos;t just ask &ldquo;what is popular?&rdquo; — it asks the questions that actually matter.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: "Personal constraints", desc: "What matters to this specific buyer? Not generic best-sellers." },
              { icon: AlertTriangle, title: "Red flag detection", desc: "What could go wrong? Finds issues others miss." },
              { icon: Shield, title: "Evidence-backed", desc: "What evidence supports this choice? No guessing." },
              { icon: RotateCcw, title: "Learns over time", desc: "Remembers your preferences for smarter future recommendations." },
            ].map((item, i) => (
              <div key={i} className="p-6 border border-border rounded-2xl hover:shadow-lg hover:shadow-black/[0.04] transition-all duration-200 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-[#E85D2A]" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-40">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl md:text-6xl leading-[1.1] tracking-tight text-foreground mb-6">
              Amazon gives options.<br />
              <span className="text-[#E85D2A]">ShortList gives confidence.</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto">
              Stop drowning in reviews and comparisons. Get a recommendation you can trust in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/app"
                className="inline-flex items-center justify-center bg-[#E85D2A] hover:bg-[#d14e1f] text-white text-base px-8 py-3.5 rounded-lg transition-all duration-150 active:scale-[0.97] gap-2"
              >
                Try ShortList Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center text-base px-8 py-3.5 rounded-lg border border-border hover:bg-secondary transition-all duration-150 active:scale-[0.97]"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="" width={28} height={28} className="h-7 w-auto" />
                <span className="font-serif text-xl text-foreground">ShortList</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">From endless options to confident decisions.</p>
            </div>
            <div className="flex items-center gap-6">
              <a href="#problem" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Problem</a>
              <a href="#solution" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Solution</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#why" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why ShortList</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">&copy; 2026 ShortList. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
