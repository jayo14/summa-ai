import React, { useState } from "react";
import { Link } from "wouter";
import { SummaLogo } from "@/components/SummaLogo";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  BookOpen,
  MessageSquare,
  Shield,
  Layers,
  Star,
  Users,
  CheckCircle2,
  HelpCircle,
  Play,
  Search,
  Lock,
  RotateCcw,
  Infinity,
  GraduationCap,
  FileText,
  Clock,
  Database,
  Menu,
  X
} from "lucide-react";

import { SEO, WebSiteJsonLd, OrganizationJsonLd, SoftwareApplicationJsonLd, FAQJsonLd } from "@/components/seo";
import { PAGES } from "@/data/seo/site";

export default function LandingPage() {
  const { user, isAuthenticated } = useAuth();
  const isLoggedIn = Boolean(user || isAuthenticated);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const faqs = [
    {
      question: "How is Summa AI different from ChatGPT?",
      answer: "Unlike ChatGPT which forgets context across separate chats, Summa AI maintains a persistent knowledge graph across all your study sessions, tracks concept mastery, and creates custom flashcards, quizzes, and study plans grounded directly in your uploaded materials."
    },
    {
      question: "Do I need to install anything?",
      answer: "No! Summa AI runs entirely in your browser on desktop, tablet, and mobile. Just sign up and start learning in under 2 minutes with zero setup or configuration required."
    },
    {
      question: "Is my data private?",
      answer: "Yes. Your course materials, notes, and study sessions are strictly private to your account. We use enterprise-grade encryption and never sell or train public AI models on your personal data."
    },
    {
      question: "Can I use Summa AI for multiple subjects?",
      answer: "Absolutely! You can manage Calculus, Machine Learning, Organic Chemistry, or any subject simultaneously in one unified persistent workspace."
    },
    {
      question: "What if I already have a SummaStudy account?",
      answer: "You can sign in directly with your existing Summa account credentials. All your saved notes, subjects, and study progress will automatically sync seamlessly."
    }
  ];

  return (
    <div className="min-h-screen w-full bg-[#FBFAF6] text-[#102B2B] font-sans selection:bg-[#B8FF4D] selection:text-[#003F3F] relative antialiased overflow-x-clip">
      <SEO
        title={PAGES.home.title}
        description={PAGES.home.description}
        canonical={PAGES.home.path}
        keywords={[
          "AI study assistant",
          "AI tutor",
          "personalized learning AI",
          "AI study tool",
          "AI flashcards",
          "AI quiz generator",
          "knowledge gap analysis",
          "spaced repetition AI",
          "exam prep AI",
        ]}
      />
      <WebSiteJsonLd />
      <OrganizationJsonLd />
      <SoftwareApplicationJsonLd />
      <FAQJsonLd items={faqs} />
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-[#B8FF4D] focus:text-[#003F3F] focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8FF4D]"
      >
        Skip to main content
      </a>

      {/* 1. PERSISTENT SCROLL-REACTIVE NAVIGATION HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none flex justify-center px-4 md:px-0">
        <header
          className={`pointer-events-auto bg-[#003F3F] text-[#F5F3EC] bg-grain-dark transition-all duration-300 ease-in-out ${
            isScrolled
              ? mobileMenuOpen
                ? "mt-4 w-[92%] md:w-[70%] rounded-2xl md:rounded-full border border-[#005A57] shadow-xl overflow-hidden"
                : "mt-4 w-[85%] md:w-[70%] rounded-full border border-[#005A57] shadow-xl"
              : "mt-0 w-full rounded-none border-b border-[#005A57]/60 shadow-none"
          }`}
        >
          <div className="mx-auto flex h-16 items-center justify-between px-6 max-w-7xl">
            <div className="flex items-center gap-3">
              <SummaLogo inverse />
            </div>

            <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide text-[#DDE8DF]" aria-label="Main navigation">
              <a href="#features" className="hover:text-[#B8FF4D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] rounded px-1">Features</a>
              <a href="#how-it-works" className="hover:text-[#B8FF4D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] rounded px-1">How it works</a>
              <a href="#pricing" className="hover:text-[#B8FF4D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] rounded px-1">Pricing</a>
              <a href="#faq" className="hover:text-[#B8FF4D] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] rounded px-1">FAQ</a>
            </nav>

            <div className="hidden sm:flex items-center gap-4">
              {!isLoggedIn && (
                <Link
                  href="/sign-in"
                  className="text-xs font-semibold text-[#DDE8DF] hover:text-white px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
              )}
              <Link
                href={isLoggedIn ? "/app" : "/sign-up"}
                className="px-5 py-2.5 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoggedIn ? "Dashboard" : "Get started free"}
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              {!isLoggedIn && (
                <Link
                  href="/sign-in"
                  className="text-xs font-semibold text-[#DDE8DF] hover:text-white px-2 py-1"
                >
                  Sign In
                </Link>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-[#005A57]/60 text-[#FBFAF6] hover:bg-[#005A57] transition-colors border border-[#6D7E78]/30"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer */}
          {mobileMenuOpen && (
            <div className={`md:hidden border-t border-[#005A57] p-5 space-y-4 bg-[#003F3F] ${isScrolled ? 'rounded-b-3xl' : 'rounded-b-none'} animate-in slide-in-from-top-2 duration-200`}>
              <nav className="flex flex-col space-y-3 text-sm font-medium text-[#DDE8DF]">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#B8FF4D] py-1 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#B8FF4D] py-1 transition-colors"
                >
                  How it works
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#B8FF4D] py-1 transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#B8FF4D] py-1 transition-colors"
                >
                  FAQ
                </a>
              </nav>
              <div className="pt-3 border-t border-[#005A57] flex flex-col gap-2.5">
                <Link
                  href={isLoggedIn ? "/app" : "/sign-up"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold text-center shadow-md transition-all"
                >
                  {isLoggedIn ? "Dashboard" : "Get started free"}
                </Link>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* MAIN CONTENT AREA */}
      <main id="main-content" tabIndex={-1}>

        {/* 2. HERO SECTION */}
        <section id="hero" className="relative bg-[#003F3F] text-[#F5F3EC] pt-24 pb-24 md:pt-36 md:pb-32 px-6 text-center bg-grain-dark border-b border-[#005A57]">
          <div className="max-w-5xl mx-auto">
            
            {/* Beta Signal Tagline Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#005A57]/60 border border-[#6D7E78]/30 text-[#DDE8DF] text-xs font-medium mt-4 mb-8 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#B8FF4D] animate-pulse" aria-hidden="true" />
              <span className="text-white font-semibold">Now in public beta</span>
              <ArrowRight className="size-3 text-[#B8FF4D]" aria-hidden="true" />
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal text-[#FBFAF6] tracking-tight leading-[1.08] mb-8">
              The learning companion <br />
              that <em className="italic font-serif font-normal text-[#B8FF4D]">never forgets.</em>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#DDE8DF]/90 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              Summa AI remembers your knowledge, tracks gaps across sessions, and generates quizzes, flashcards, and study plans — all in one persistent workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-4">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] focus:ring-offset-2"
              >
                <span>Start learning free</span>
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#005A57]/60 hover:bg-[#005A57] border border-[#6D7E78]/40 text-sm font-medium text-[#F5F3EC] transition-all flex items-center justify-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] focus:ring-offset-2"
              >
                <Play className="size-4 text-[#B8FF4D] fill-[#B8FF4D] group-hover:scale-110 transition-transform" aria-hidden="true" />
                <span>Watch demo</span>
              </a>
            </div>

            <p className="text-xs text-[#6D7E78] font-mono mb-16">
              No credit card. Start learning in under 2 minutes.
            </p>

            {/* Hero Interactive Demo / Product Showcase Panel */}
            <div id="demo" className="relative rounded-3xl bg-[#005A57]/30 border border-[#6D7E78]/30 p-4 sm:p-7 shadow-2xl backdrop-blur-xl max-w-4xl mx-auto text-left group transition-all hover:border-[#6D7E78]/50" aria-label="Interactive product demo">
              
              {/* Decorative Glass Glows */}
              <div className="absolute -top-20 -right-20 size-64 rounded-full bg-[#B8FF4D]/10 blur-3xl pointer-events-none" aria-hidden="true" />
              <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-[#005A57]/30 blur-3xl pointer-events-none" aria-hidden="true" />

              {/* Product Chrome Top Bar */}
              <div className="relative z-10 flex items-center justify-between px-5 py-3 border border-[#005A57] mb-6 bg-[#003F3F]/90 rounded-2xl shadow-inner backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-[#E9B8A7]/70" />
                  <div className="size-3 rounded-full bg-[#B8FF4D]/70" />
                  <div className="size-3 rounded-full bg-[#6D7E78]/50" />
                </div>
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[#005A57]/60 border border-[#6D7E78]/40 text-[11px] font-mono text-[#DDE8DF]">
                  <Sparkles className="size-3.5 text-[#B8FF4D] animate-pulse" />
                  <span className="tracking-tight text-white font-medium">summa-ai.app/workspace</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#DDE8DF] font-mono bg-[#005A57]/40 px-3 py-1 rounded-full border border-[#005A57]">
                  <span className="inline-block size-2 rounded-full bg-[#B8FF4D] animate-ping" />
                  <span className="font-semibold text-white">Live Workspace</span>
                </div>
              </div>

              {/* Grid Content */}
              <div className="relative z-10 space-y-4">
                
                {/* User Prompt */}
                <div className="flex justify-end">
                  <div className="bg-[#005A57] border border-[#6D7E78]/40 text-white rounded-2xl rounded-tr-xs px-5 py-3 text-xs sm:text-sm max-w-[85%] shadow-md">
                    <span className="font-medium">Quiz me on Transformers</span>
                  </div>
                </div>

                {/* AI Output Card */}
                <div className="bg-[#FBFAF6] text-[#102B2B] rounded-2xl p-5 text-xs sm:text-sm space-y-3.5 shadow-2xl border border-[#DDE8DF] relative overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#005A57]" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#003F3F]">
                      <Sparkles className="size-4 text-[#005A57]" />
                      <span className="text-xs uppercase tracking-wide font-mono">Summa AI Companion</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#005A57] bg-[#E7EFE7] px-2.5 py-0.5 rounded-full font-bold">Retrieved from memory</span>
                  </div>

                  <p className="leading-relaxed text-[#102B2B] text-xs sm:text-sm">
                    The attention mechanism computes a weighted sum of values, where weights are determined by the query's similarity to each key.
                  </p>

                  <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#DDE8DF] text-[11px] font-mono text-[#6D7E78]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-[#E7EFE7] text-[#003F3F] font-semibold border border-[#DDE8DF]">
                        Knowledge Graph · Transformers
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-[#E7EFE7] text-[#003F3F] font-semibold border border-[#DDE8DF]">
                        Artifact · Flashcard Set
                      </span>
                    </div>
                    <span className="text-[#005A57] font-semibold">
                      Answered in 1.2s
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* 3. TRUSTED BY LEARNERS STRIP */}
        <section className="py-10 bg-[#F5F3EC] border-b border-[#E7EFE7]" aria-label="Trusted by learners">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6D7E78] mb-6 font-mono">
              TRUSTED BY LEARNERS WHO DEMAND MORE
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs font-mono font-bold text-[#003F3F]">
              <span className="px-4 py-2 rounded-full bg-[#FBFAF6] border border-[#DDE8DF] shadow-xs">Adaptive</span>
              <span className="text-[#6D7E78] hidden sm:inline">•</span>
              <span className="px-4 py-2 rounded-full bg-[#FBFAF6] border border-[#DDE8DF] shadow-xs flex items-center gap-1.5">
                <span className="text-base leading-none">∞</span> Persistent
              </span>
              <span className="text-[#6D7E78] hidden sm:inline">•</span>
              <span className="px-4 py-2 rounded-full bg-[#FBFAF6] border border-[#DDE8DF] shadow-xs">Smart</span>
              <span className="text-[#6D7E78] hidden sm:inline">•</span>
              <span className="px-4 py-2 rounded-full bg-[#FBFAF6] border border-[#DDE8DF] shadow-xs">Secure</span>
              <span className="text-[#6D7E78] hidden sm:inline">•</span>
              <span className="px-4 py-2 rounded-full bg-[#FBFAF6] border border-[#DDE8DF] shadow-xs">Personalized</span>
            </div>
          </div>
        </section>

        {/* 4. STATS SECTION */}
        <section className="py-20 px-6 bg-[#FBFAF6] border-b border-[#E7EFE7]">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-normal text-[#102B2B] tracking-tight mb-16">
              Smart learners stop losing progress to <span className="italic text-[#005A57]">scattered notes.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] text-center shadow-sm">
                <div className="text-5xl sm:text-6xl font-serif font-normal text-[#003F3F] mb-2">7+</div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D7E78]">Artifact types</div>
              </div>

              <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] text-center shadow-sm">
                <div className="text-5xl sm:text-6xl font-serif font-normal text-[#003F3F] mb-2">6</div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D7E78]">Proficiency dimensions</div>
              </div>

              <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] text-center shadow-sm">
                <div className="text-5xl sm:text-6xl font-serif font-normal text-[#003F3F] mb-2">100%</div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#6D7E78]">Persistent memory</div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FEATURES SECTION */}
        <section id="features" className="py-28 px-6 bg-[#FBFAF6] text-[#102B2B]" aria-labelledby="features-heading">
          <div className="max-w-7xl mx-auto">
            
            <div className="max-w-3xl mb-16 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8DF] text-[#003F3F] text-[11px] font-mono font-semibold mb-4">
                FEATURES
              </div>
              <h2 id="features-heading" className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#102B2B] tracking-tight leading-[1.12]">
                Everything scattered. <br />
                <span className="italic text-[#005A57]">One place to learn.</span>
              </h2>
              <p className="text-[#6D7E78] text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
                Summa AI remembers what you know, adapts to your level, and generates study materials — no re-tagging, no new habits, no forgotten sessions.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Feature 1: Learn in plain English */}
              <div className="md:col-span-7 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden">
                <div>
                  <div className="size-12 rounded-2xl bg-[#003F3F] text-[#B8FF4D] flex items-center justify-center mb-6">
                    <MessageSquare className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Learn in plain English</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed max-w-md mb-6">
                    Type a real question the way you'd ask a tutor — no keywords, no filters, no guessing what to study next.
                  </p>

                  <div className="p-5 rounded-2xl bg-[#FBFAF6] border border-[#DDE8DF] space-y-3 font-sans">
                    <div className="text-xs text-[#6D7E78] font-mono">You asked</div>
                    <div className="text-sm font-semibold text-[#102B2B]">“Explain backpropagation simply”</div>
                    <div className="pt-2 border-t border-[#DDE8DF] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#005A57]">Summa AI adapted to</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#003F3F] text-[#B8FF4D] font-bold">Undergraduate level</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 2: Every session, remembered */}
              <div className="md:col-span-5 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden">
                <div>
                  <div className="size-12 rounded-2xl bg-[#005A57] text-[#F5F3EC] flex items-center justify-center mb-6">
                    <Database className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Every session, remembered</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed mb-6">
                    Your knowledge graph persists across sessions — Summa AI knows what you've mastered and what needs review.
                  </p>

                  <div className="space-y-2.5 font-mono text-xs">
                    <div className="p-3 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] flex items-center justify-between text-[#003F3F] font-semibold">
                      <span>Knowledge Graph · Calculus</span>
                      <CheckCircle2 className="size-4 text-[#005A57]" />
                    </div>
                    <div className="p-3 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] flex items-center justify-between text-[#003F3F] font-semibold">
                      <span>Quiz · Linear Algebra</span>
                      <CheckCircle2 className="size-4 text-[#005A57]" />
                    </div>
                    <div className="p-3 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] flex items-center justify-between text-[#003F3F] font-semibold">
                      <span>Flashcards · ML Basics</span>
                      <CheckCircle2 className="size-4 text-[#005A57]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3: Adapts to your learning style */}
              <div className="md:col-span-5 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden">
                <div>
                  <div className="size-12 rounded-2xl bg-[#003F3F] text-[#B8FF4D] flex items-center justify-center mb-6">
                    <Brain className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Adapts to your learning style</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed mb-6">
                    No template. Summa AI calibrates to your degree, field, and goals — then teaches the way you learn best.
                  </p>

                  <div className="flex flex-wrap gap-2 font-mono text-xs">
                    <span className="px-3.5 py-2 rounded-xl bg-[#003F3F] text-[#B8FF4D] font-bold">Quiz</span>
                    <span className="px-3.5 py-2 rounded-xl bg-[#005A57] text-white font-bold">Flashcard</span>
                    <span className="px-3.5 py-2 rounded-xl bg-[#E7EFE7] text-[#003F3F] font-bold">Plan</span>
                    <span className="px-3.5 py-2 rounded-xl bg-[#E7EFE7] text-[#003F3F] font-bold">Explain</span>
                    <span className="px-3.5 py-2 rounded-xl bg-[#E7EFE7] text-[#003F3F] font-bold">Graph</span>
                    <span className="px-3.5 py-2 rounded-xl bg-[#E7EFE7] text-[#003F3F] font-bold">Review</span>
                  </div>
                </div>
              </div>

              {/* Feature 4: Made for how you actually learn */}
              <div className="md:col-span-7 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-xl transition-all group overflow-hidden">
                <div>
                  <div className="size-12 rounded-2xl bg-[#005A57] text-[#F5F3EC] flex items-center justify-center mb-6">
                    <GraduationCap className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Made for how you actually learn</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed max-w-lg mb-6">
                    Made for students who need depth — undergrad to Master's level, with proactive follow-ups and gap analysis.
                  </p>
                  
                  <div className="p-5 rounded-2xl bg-[#003F3F] text-[#F5F3EC] border border-[#005A57]">
                    <div className="flex items-center gap-2 text-xs font-mono text-[#B8FF4D] mb-2 font-bold">
                      <Sparkles className="size-3.5" />
                      <span>Proactive Gap Analysis</span>
                    </div>
                    <p className="text-xs text-[#DDE8DF] leading-relaxed">
                      "We noticed you mastered Loss Functions, but had trouble with Chain Rule. Let's do a 3-minute review."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-28 px-6 bg-[#DDE8DF]/40 border-y border-[#DDE8DF]" aria-labelledby="how-heading">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003F3F] text-[#B8FF4D] text-[11px] font-mono font-semibold mb-4">
              HOW IT WORKS
            </div>
            <h2 id="how-heading" className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#102B2B] tracking-tight leading-[1.1]">
              Learn once. <span className="italic text-[#005A57]">Remember forever.</span>
            </h2>
            <p className="text-[#6D7E78] text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              A single workspace sits on top of every concept you study — and every session builds on the last.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* One workspace for every subject */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 sm:p-10 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF]">
              <div className="md:col-span-6 space-y-4 text-left">
                <span className="text-xs font-mono font-semibold text-[#005A57] uppercase tracking-wider">01 / UNIFIED WORKSPACE</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B]">One workspace for every subject</h3>
                <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed">
                  Stop tab-switching between notes, PDFs, and flashcards. Ask Summa AI once — it checks your entire knowledge graph at the same time.
                </p>
                <div className="pt-2">
                  <Link href="/sign-up" className="inline-flex items-center gap-2 text-xs font-bold text-[#003F3F] hover:text-[#005A57] transition-colors">
                    <span>Start learning now</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>

              <div className="md:col-span-6 bg-[#FBFAF6] rounded-2xl border border-[#DDE8DF] p-5 shadow-sm space-y-3 font-mono">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#F5F3EC] border border-[#DDE8DF] text-xs text-[#6D7E78]">
                  <Search className="size-4 text-[#005A57]" />
                  <span>Search across all subjects…</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-bold pt-2">
                  <span className="px-3 py-1.5 rounded-lg bg-[#003F3F] text-[#B8FF4D]">Calculus</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#005A57] text-white">ML</span>
                  <span className="px-3 py-1.5 rounded-lg bg-[#E7EFE7] text-[#003F3F]">Linear Algebra</span>
                </div>
              </div>
            </div>

            {/* Knowledge you can trust */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 sm:p-10 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF]">
              <div className="md:col-span-6 bg-[#FBFAF6] rounded-2xl border border-[#DDE8DF] p-5 shadow-sm space-y-3 text-left">
                <div className="text-xs font-mono font-bold text-[#005A57] flex items-center gap-1.5">
                  <Search className="size-3.5" />
                  <span>Explore your knowledge</span>
                </div>
                <blockquote className="text-xs sm:text-sm text-[#102B2B] italic font-serif">
                  “Backpropagation uses the chain rule to compute gradients layer by layer.”
                </blockquote>
                <div className="pt-2 text-[11px] font-mono text-[#005A57] bg-[#E7EFE7] px-3 py-1 rounded-md inline-block font-semibold">
                  Artifact · Flashcard Set · ML Basics
                </div>
              </div>

              <div className="md:col-span-6 space-y-4 text-left">
                <span className="text-xs font-mono font-semibold text-[#005A57] uppercase tracking-wider">02 / GROUNDED CITATIONS</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B]">Knowledge you can trust</h3>
                <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed">
                  Every answer is grounded in your knowledge graph, with source artifacts you can review — so you never have to take the AI's word for it.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* 7. TESTIMONIALS SECTION */}
        <section id="testimonial" className="py-28 px-6 bg-[#F5F3EC] border-t border-[#DDE8DF]" aria-labelledby="testimonial-heading">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003F3F] text-[#B8FF4D] text-[11px] font-mono font-semibold mb-4">
              TESTIMONIALS
            </div>
            <h2 id="testimonial-heading" className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] tracking-tight">
              Students who stopped searching and <span className="italic text-[#005A57]">started learning</span>
            </h2>
            <p className="text-[#6D7E78] text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              See how Summa AI changed the way students study, review, and master new subjects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Alex Chen */}
            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left shadow-xs">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  “Summa AI remembers everything I study and shows me what to review. Like a tutor that never sleeps.”
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#003F3F] text-[#B8FF4D] font-mono font-bold flex items-center justify-center text-xs">
                  AC
                </div>
                <div>
                  <strong className="block text-xs text-[#102B2B]">Alex Chen</strong>
                  <span className="text-[11px] text-[#6D7E78]">CS Master's Student</span>
                </div>
              </div>
            </div>

            {/* Sarah Kim */}
            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left shadow-xs">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  “The gap analysis alone saved me from failing my NLP final. It found prerequisites I didn't know I was missing.”
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#005A57] text-[#F5F3EC] font-mono font-bold flex items-center justify-center text-xs">
                  SK
                </div>
                <div>
                  <strong className="block text-xs text-[#102B2B]">Sarah Kim</strong>
                  <span className="text-[11px] text-[#6D7E78]">Undergrad, AI Major</span>
                </div>
              </div>
            </div>

            {/* Marcus Johnson */}
            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left shadow-xs">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  “This is the first study app that actually adapts to how I learn instead of forcing me into their template.”
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#E7EFE7] text-[#003F3F] border border-[#005A57]/30 font-mono font-bold flex items-center justify-center text-xs">
                  MJ
                </div>
                <div>
                  <strong className="block text-xs text-[#102B2B]">Marcus Johnson</strong>
                  <span className="text-[11px] text-[#6D7E78]">Lifelong Learner</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 8. PRICING SECTION */}
        <section id="pricing" className="py-28 px-6 max-w-7xl mx-auto text-[#102B2B]" aria-labelledby="pricing-heading">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8DF] text-[#003F3F] text-[11px] font-mono font-semibold mb-4">
              PRICING
            </div>
            <h2 id="pricing-heading" className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] tracking-tight mb-4">
              Pricing that scales <span className="italic text-[#005A57]">with your learning</span>
            </h2>
            <p className="text-[#6D7E78] text-sm sm:text-base mb-8">
              Start free. Upgrade when you outgrow us.
            </p>

            <div className="inline-flex items-center p-1 rounded-full bg-[#E7EFE7]">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly" ? "bg-[#003F3F] text-[#F5F3EC] shadow-sm" : "text-[#6D7E78] hover:text-[#102B2B]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "yearly" ? "bg-[#003F3F] text-[#F5F3EC] shadow-sm" : "text-[#6D7E78] hover:text-[#102B2B]"
                }`}
              >
                Annually <span className="text-[10px] text-[#B8FF4D] font-mono ml-1 font-extrabold">-20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-normal text-[#102B2B] mb-1">Free</h3>
                <p className="text-xs text-[#6D7E78] mb-6">Try Summa AI on one subject.</p>
                <div className="mb-6">
                  <span className="text-5xl font-serif font-normal text-[#102B2B]">$0</span>
                  <span className="text-xs text-[#6D7E78] font-mono">/month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#6D7E78] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>7 artifact types</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>10 conversations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Basic gap analysis</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Community support</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>WhatsApp export search</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Admin controls</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-[#005A57] hover:bg-[#003F3F] text-xs font-bold text-[#F5F3EC] text-center transition-colors"
              >
                Get started
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-3xl bg-[#003F3F] text-[#F5F3EC] border-2 border-[#005A57] flex flex-col justify-between relative shadow-xl bg-grain-dark">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#B8FF4D] text-[10px] font-mono font-bold uppercase tracking-widest text-[#003F3F]">
                Most popular
              </div>
              <div>
                <h3 className="text-xl font-serif font-normal text-[#FBFAF6] mb-1">Pro</h3>
                <p className="text-xs text-[#DDE8DF] mb-6">For serious learners.</p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-5xl font-serif font-normal text-white">
                    {billingCycle === "monthly" ? "$12" : "$9.60"}
                  </span>
                  <span className="text-xs text-[#DDE8DF] font-mono">/month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#DDE8DF] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span className="font-semibold text-white">Everything in Free</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Unlimited conversations</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Advanced gap analysis</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Exam prep engine</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Version history</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-xs font-bold text-[#003F3F] text-center shadow-md transition-all hover:scale-[1.02]"
              >
                Start free trial
              </Link>
            </div>

            {/* Team Plan */}
            <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-normal text-[#102B2B] mb-1">Team</h3>
                <p className="text-xs text-[#6D7E78] mb-6">For study groups & classrooms.</p>
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-5xl font-serif font-normal text-[#102B2B]">
                    {billingCycle === "monthly" ? "$29" : "$23.20"}
                  </span>
                  <span className="text-xs text-[#6D7E78] font-mono">/month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#6D7E78] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span className="font-semibold text-[#102B2B]">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Up to 10 members</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Shared knowledge graph</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Progress dashboard</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>API access</span>
                  </li>
                </ul>
              </div>
              <a
                href="mailto:sales@summastudy.com.ng"
                className="w-full py-3.5 px-4 rounded-full bg-[#005A57] hover:bg-[#003F3F] text-xs font-bold text-[#F5F3EC] text-center transition-colors"
              >
                Contact sales
              </a>
            </div>

          </div>
        </section>

        {/* 9. FAQ SECTION */}
        <section id="faq" className="py-28 px-6 bg-[#F5F3EC] border-t border-[#DDE8DF]" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003F3F] text-[#B8FF4D] text-[11px] font-mono font-semibold mb-4">
              FAQ
            </div>
            <h2 id="faq-heading" className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-[#6D7E78] text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
              Everything learners ask before getting started.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              const answerId = `faq-answer-${idx}`;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#FBFAF6] border border-[#DDE8DF] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#102B2B] hover:text-[#005A57] transition-colors focus:outline-none focus:ring-2 focus:ring-[#005A57] focus:ring-inset rounded"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`size-5 text-[#005A57] flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen && (
                    <div id={answerId} className="px-6 pb-6 pt-0 text-xs sm:text-sm text-[#6D7E78] leading-relaxed border-t border-[#DDE8DF]/50">
                      <p className="mt-4">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 10. PRE-FOOTER CTA BANNER */}
        <section className="py-24 px-6 bg-[#003F3F] text-[#F5F3EC] bg-grain-dark text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <h2 className="text-4xl sm:text-6xl font-serif font-normal text-[#FBFAF6] tracking-tight">
              Stop forgetting. <span className="italic text-[#B8FF4D]">Start learning.</span>
            </h2>
            <p className="text-sm sm:text-base text-[#DDE8DF] max-w-xl mx-auto leading-relaxed">
              Pick a subject and start learning in under 2 minutes. No setup, no config.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold shadow-xl transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] focus:ring-offset-2"
              >
                Try Summa AI free
              </Link>
              <a
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#005A57]/60 hover:bg-[#005A57] border border-[#6D7E78]/40 text-xs font-bold text-[#F5F3EC] transition-all focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] focus:ring-offset-2"
              >
                Book a demo
              </a>
            </div>
          </div>
        </section>

        {/* 11. FOOTER */}
        <footer className="pt-20 pb-12 px-6 bg-[#003F3F] text-[#F5F3EC] border-t border-[#005A57] bg-grain-dark relative overflow-hidden" role="contentinfo">
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-left mb-16">
              
              {/* Brand Column */}
              <div className="md:col-span-4 space-y-4">
                <SummaLogo inverse />
                <p className="text-xs text-[#DDE8DF] leading-relaxed max-w-sm">
                  The learning companion that never forgets.
                </p>
              </div>

              {/* Links Columns */}
              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
                <div>
                  <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] text-[#B8FF4D]">
                    Product
                  </h5>
                  <ul className="space-y-3 text-[#DDE8DF]">
                    <li><a href="#features" className="hover:text-[#B8FF4D] transition-colors">Features</a></li>
                    <li><a href="#how-it-works" className="hover:text-[#B8FF4D] transition-colors">How it works</a></li>
                    <li><a href="#pricing" className="hover:text-[#B8FF4D] transition-colors">Pricing</a></li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] text-[#B8FF4D]">
                    Company
                  </h5>
                  <ul className="space-y-3 text-[#DDE8DF]">
                    <li><a href="#" className="hover:text-[#B8FF4D] transition-colors">About</a></li>
                    <li><a href="#" className="hover:text-[#B8FF4D] transition-colors">Blog</a></li>
                    <li><a href="#faq" className="hover:text-[#B8FF4D] transition-colors">FAQs</a></li>
                    <li><a href="mailto:hello@summastudy.com.ng" className="hover:text-[#B8FF4D] transition-colors">Contact</a></li>
                  </ul>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] text-[#B8FF4D]">
                    Start your learning journey
                  </h5>
                  <p className="text-xs text-[#DDE8DF] mb-4 leading-relaxed">
                    Pick a subject, any subject — and see what persistent learning feels like.
                  </p>
                  <Link
                    href="/sign-up"
                    className="inline-block px-5 py-2 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold shadow-sm transition-all"
                  >
                    Try Summa AI free
                  </Link>
                </div>
              </div>

            </div>

            {/* Bottom Copyright Bar */}
            <div className="pt-8 border-t border-[#005A57] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6D7E78] font-mono">
              <div>© 2026 Summa AI. All rights reserved.</div>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-[#DDE8DF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] rounded px-1">Terms</a>
                <span aria-hidden="true">·</span>
                <a href="#" className="hover:text-[#DDE8DF] transition-colors focus:outline-none focus:ring-2 focus:ring-[#B8FF4D] rounded px-1">Privacy</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
