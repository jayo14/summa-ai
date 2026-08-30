import React, { useState } from "react";
import { Link } from "wouter";
import { SummaLogo } from "@/components/SummaLogo";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  Heart,
  BookOpen,
  MessageSquare,
  Shield,
  Layers,
  Star,
  Users,
  CheckCircle2,
  HelpCircle,
  Sliders,
  Cpu,
  Bookmark
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [isWaitlistLoading, setIsWaitlistLoading] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      // Smoothly interpolate scroll progress from 0 (at top) to 1 (scrolled 60px)
      const currentScroll = window.scrollY;
      const progress = Math.min(Math.max(currentScroll / 60, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    setIsWaitlistLoading(true);
    // Simulate waitlist API registration delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsWaitlistLoading(false);
    setWaitlistSubmitted(true);
  };

  // Interpolate dynamic styles based on continuous scroll progress
  const headerWidth = 100 - scrollProgress * 25; // 100% -> 75%
  const headerMarginTop = scrollProgress * 16; // 0px -> 16px
  const headerBorderRadius = scrollProgress * 9999; // 0px -> 9999px
  const headerHeight = 80 - scrollProgress * 16; // 80px -> 64px
  const headerPx = 32 - scrollProgress * 8; // 32px -> 24px

  return (
    <div className="min-h-screen w-full bg-[#FBFAF6] text-[#102B2B] font-sans selection:bg-[#B8FF4D] selection:text-[#003F3F] relative antialiased">
      
      {/* 1. FLOATING STICKY NAVIGATION HEADER WITH CONTINUOUS FLUID INTERPOLATION */}
      <div className="sticky top-0 z-50 w-full pointer-events-none flex justify-center">
        <header
          style={{
            width: `${headerWidth}%`,
            marginTop: `${headerMarginTop}px`,
            borderRadius: `${headerBorderRadius}px`,
          }}
          className={`pointer-events-auto bg-[#003F3F] text-[#F5F3EC] bg-grain-dark transition-shadow duration-300 ease-out ${
            scrollProgress > 0.1
              ? "border border-[#005A57] shadow-2xl backdrop-blur-xl bg-opacity-95"
              : "border-b border-[#005A57]/60 shadow-md"
          }`}
        >
          <div
            style={{
              height: `${headerHeight}px`,
              paddingLeft: `${headerPx}px`,
              paddingRight: `${headerPx}px`,
            }}
            className="mx-auto flex items-center justify-between max-w-7xl"
          >
          <div className="flex items-center gap-3">
            <SummaLogo />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide text-[#DDE8DF]">
            <a href="#product" className="hover:text-[#B8FF4D] transition-colors">Product</a>
            <a href="#features" className="hover:text-[#B8FF4D] transition-colors">Features</a>
            <a href="#benefit" className="hover:text-[#B8FF4D] transition-colors">Benefits</a>
            <a href="#pricing" className="hover:text-[#B8FF4D] transition-colors">Pricing</a>
            <a href="#testimonial" className="hover:text-[#B8FF4D] transition-colors">Testimonials</a>
            <a href="#waitlist" className="hover:text-[#B8FF4D] transition-colors">Waitlist</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-xs font-semibold text-[#DDE8DF] hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>
    </div>

      {/* MAIN CONTENT AREA */}
      <main>

        {/* 2. HERO SECTION - DEEP EMERALD SHELL WITH GRAIN */}
        <section id="hero" className="relative bg-[#003F3F] text-[#F5F3EC] pt-20 pb-24 md:pt-28 md:pb-36 px-6 text-center bg-grain-dark border-b border-[#005A57]">
          <div className="max-w-5xl mx-auto">
            {/* Branded Signal Tagline Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#005A57]/60 border border-[#6D7E78]/30 text-[#DDE8DF] text-xs font-medium mb-8 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#B8FF4D] animate-pulse" />
              <span>Summa AI 2.0 • Intelligent Recall Workspace</span>
              <ArrowRight className="size-3 text-[#B8FF4D]" />
            </div>

            {/* Instrument Serif Hero Display Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal text-[#FBFAF6] tracking-tight leading-[1.08] mb-8">
              Elevate <em className="italic font-serif font-normal text-[#B8FF4D]">Learning &amp; Study Recall</em> <br className="hidden sm:inline" />
              with Calm Precision
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#DDE8DF]/90 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              Summa AI brings your lectures, syllabus, active recall quizzes, and tutor support into one quiet, high-signal workspace.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-16">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group"
              >
                <span>Start Studying Free — No Card Needed</span>
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#product"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#005A57]/60 hover:bg-[#005A57] border border-[#6D7E78]/40 text-sm font-medium text-[#F5F3EC] transition-all flex items-center justify-center gap-2"
              >
                <span>Watch 2-Min Demo</span>
              </a>
            </div>

            {/* Hero Product Showcase Panel */}
            <div id="product" className="relative rounded-3xl bg-[#005A57]/40 border border-[#6D7E78]/40 p-4 sm:p-6 shadow-2xl backdrop-blur-md max-w-5xl mx-auto text-left">
              {/* Product Chrome Top Bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#005A57] mb-6 bg-[#003F3F]/80 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-[#6D7E78]/40" />
                  <div className="size-3 rounded-full bg-[#6D7E78]/40" />
                  <div className="size-3 rounded-full bg-[#6D7E78]/40" />
                </div>
                <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[#003F3F] border border-[#005A57] text-[11px] font-mono text-[#DDE8DF]">
                  <Sparkles className="size-3 text-[#B8FF4D]" />
                  <span>summa-ai.app/csc-201/active-recall</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#DDE8DF] font-mono">
                  <span className="inline-block size-2 rounded-full bg-[#B8FF4D]" />
                  <span>Active Session</span>
                </div>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Active Conversation */}
                <div className="md:col-span-7 bg-[#003F3F] border border-[#005A57] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#6D7E78] border-b border-[#005A57] pb-2 font-mono">
                    <span className="text-[#DDE8DF] font-sans font-semibold">CSC 201 — Data Structures</span>
                    <span>Context: 4 Lectures Loaded</span>
                  </div>

                  <div className="bg-[#005A57]/40 border border-[#005A57] rounded-2xl p-3.5 text-xs text-[#F5F3EC] max-w-[85%] ml-auto">
                    Can you explain how AVL tree self-balancing works before tomorrow's midterm?
                  </div>

                  <div className="bg-[#F5F3EC] text-[#102B2B] rounded-2xl p-4 text-xs space-y-2 max-w-[90%] shadow-lg">
                    <div className="flex items-center gap-2 font-bold text-[#003F3F]">
                      <Sparkles className="size-3.5 text-[#005A57]" />
                      <span>Summa Intelligent Recall</span>
                    </div>
                    <p className="leading-relaxed">
                      AVL trees maintain height balance by checking the balance factor: <code className="font-mono bg-[#DDE8DF] px-1 py-0.5 rounded text-[#003F3F]">BF = height(Left) - height(Right)</code>. If |BF| &gt; 1, it executes a single or double rotation.
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-[10px] text-[#6D7E78] border-t border-[#DDE8DF]">
                      <CheckCircle2 className="size-3 text-[#005A57]" />
                      <span>Grounded in Lecture 7: Tree Rotations (Slide 14)</span>
                    </div>
                  </div>
                </div>

                {/* Right Context Cards */}
                <div className="md:col-span-5 space-y-4">
                  <div className="p-5 rounded-2xl bg-[#005A57]/60 border border-[#6D7E78]/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#DDE8DF]">Course Mastery Score</span>
                      <span className="text-xs font-mono font-bold text-[#B8FF4D]">+14% this week</span>
                    </div>
                    <div className="text-3xl font-serif font-normal text-white mb-2">88%</div>
                    <div className="w-full bg-[#003F3F] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#B8FF4D] h-full w-[88%]" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#003F3F] border border-[#005A57] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-[#005A57] text-[#B8FF4D] flex items-center justify-center font-bold">
                        <Brain className="size-4" />
                      </div>
                      <div>
                        <strong className="block text-xs text-[#F5F3EC]">Active Recall Cards</strong>
                        <span className="text-[11px] text-[#6D7E78]">14 new cards generated</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#B8FF4D]/20 text-[#B8FF4D] text-[10px] font-mono">Ready</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#003F3F] border border-[#005A57] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-[#005A57] text-[#DDE8DF] flex items-center justify-center font-bold">
                        <BookOpen className="size-4" />
                      </div>
                      <div>
                        <strong className="block text-xs text-[#F5F3EC]">Connected Sources</strong>
                        <span className="text-[11px] text-[#6D7E78]">Syllabus + 12 PDFs</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[#DDE8DF]/20 text-[#DDE8DF] text-[10px] font-mono">Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TRUSTED SCHOLARS BAR */}
        <section id="brand" className="py-12 bg-[#F5F3EC] border-b border-[#E7EFE7]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6D7E78] mb-6 font-mono">
              TRUSTED BY STUDENTS AT TOP UNIVERSITIES
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center text-[#003F3F]">
              <div className="text-sm font-serif font-normal">STANFORD UNIV</div>
              <div className="text-sm font-serif font-normal">MIT CAMPUS</div>
              <div className="text-sm font-serif font-normal">HARVARD SCHOLARS</div>
              <div className="text-sm font-serif font-normal">OXFORD ACADEMY</div>
              <div className="text-sm font-serif font-normal">CAMBRIDGE LABS</div>
              <div className="text-sm font-serif font-normal">UC BERKELEY</div>
            </div>
          </div>
        </section>

        {/* 4. FEATURES SECTION - SOFT CREAM BACKGROUND */}
        <section id="features" className="py-28 px-6 bg-[#FBFAF6] text-[#102B2B]">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mb-16 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8DF] text-[#003F3F] text-[11px] font-mono font-semibold mb-4">
                FEATURES
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#102B2B] tracking-tight leading-[1.12]">
                Everything You Need to Build <br />
                <span className="italic text-[#005A57]">Intelligent Study Workspaces</span>
              </h2>
              <p className="text-[#6D7E78] text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
                Every element is crafted to make AI-driven study experiences feel calm, warm, and highly effective.
              </p>
            </div>

            {/* Asymmetric Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card 1 */}
              <div className="md:col-span-7 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="size-12 rounded-2xl bg-[#003F3F] text-[#B8FF4D] flex items-center justify-center mb-6">
                    <MessageSquare className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Adaptive Conversations</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed max-w-md">
                    Adjusts responses in real-time to match your course depth. Feels natural, precise, and completely aligned with your exam topics.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#003F3F] font-mono">
                  <span>Real-time Context Matching</span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="md:col-span-5 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="size-12 rounded-2xl bg-[#005A57] text-[#F5F3EC] flex items-center justify-center mb-6">
                    <Layers className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Multi-Source Sync</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed">
                    Connect Summa AI effortlessly across PDFs, slides, and notes. Keep your study context consistent everywhere.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#005A57] font-mono">
                  <span>PDFs • Slides • Syllabi</span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="md:col-span-5 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="size-12 rounded-2xl bg-[#E9DED0] text-[#003F3F] flex items-center justify-center mb-6">
                    <Heart className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Empathetic Tutoring</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed">
                    Goes beyond rigid Q&amp;A. Formats responses with encouraging feedback and tailored pace adjustments when exam stress builds up.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#003F3F] font-mono">
                  <span>Personalized Guidance</span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 4 */}
              <div className="md:col-span-7 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="size-12 rounded-2xl bg-[#003F3F] text-[#B8FF4D] flex items-center justify-center mb-6">
                    <Cpu className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Knowledge-Driven Intelligence</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed max-w-md">
                    Powered by your exact course material and active memory indexing. Answers evolve continuously as your course catalog grows.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#003F3F] font-mono">
                  <span>Zero Hallucination Guardrails</span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BENEFIT SECTION - MIST GREEN CONTAINER */}
        <section id="benefit" className="py-28 px-6 bg-[#DDE8DF]/40 border-y border-[#DDE8DF]">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003F3F] text-[#B8FF4D] text-[11px] font-mono font-semibold mb-4">
              BENEFITS
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#102B2B] tracking-tight leading-[1.1]">
              The Human Touch, Enhanced by <span className="italic text-[#005A57]">Intelligence</span>
            </h2>
            <p className="text-[#6D7E78] text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Experience an AI study companion that understands your academic goals, adapts to your schedule, and grows smarter with every exchange.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF]">
              <div className="md:col-span-6 space-y-4 text-left">
                <span className="text-xs font-mono font-semibold text-[#005A57] uppercase tracking-wider">01 / HABITS</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B]">Build Meaningful Study Habits</h3>
                <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed">
                  Summa AI turns overwhelming course syllabi into interactive daily recall sessions—turning dry reading into experiences that feel personal and motivating.
                </p>
                <Link href="/sign-up" className="inline-flex items-center gap-2 text-xs font-bold text-[#003F3F] hover:text-[#005A57] transition-colors pt-2">
                  <span>Start Building Habits</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="md:col-span-6 bg-[#FBFAF6] rounded-2xl border border-[#DDE8DF] p-6">
                <div className="flex items-center justify-between mb-4 border-b border-[#DDE8DF] pb-3 text-xs text-[#6D7E78] font-mono">
                  <span>Habit Consistency Tracker</span>
                  <span className="text-[#005A57] font-bold">12 Day Streak 🔥</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono text-[#6D7E78]">
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">MON</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">TUE</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">WED</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">THU</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">FRI</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">SAT</div>
                  <div className="p-2 rounded-lg bg-[#003F3F] text-[#B8FF4D] font-bold">SUN</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PRICING SECTION - DISCIPLINED CARDS */}
        <section id="pricing" className="py-28 px-6 max-w-7xl mx-auto text-[#102B2B]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8DF] text-[#003F3F] text-[11px] font-mono font-semibold mb-4">
              PRICING
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] tracking-tight mb-4">
              Choose the Plan That <span className="italic text-[#005A57]">Grows With You</span>
            </h2>
            <p className="text-[#6D7E78] text-sm sm:text-base mb-8">
              Scale your academic performance with flexible options designed for students and study groups.
            </p>

            <div className="inline-flex items-center p-1 rounded-full bg-[#E7EFE7]">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly" ? "bg-[#003F3F] text-[#F5F3EC] shadow-sm" : "text-[#6D7E78] hover:text-[#102B2B]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "yearly" ? "bg-[#003F3F] text-[#F5F3EC] shadow-sm" : "text-[#6D7E78] hover:text-[#102B2B]"
                }`}
              >
                Yearly <span className="text-[10px] text-[#B8FF4D] font-mono ml-1 font-extrabold">SAVE 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-normal text-[#102B2B] mb-1">Starter</h3>
                <p className="text-xs text-[#6D7E78] mb-6">Essential AI study tools to get started.</p>
                <div className="mb-6">
                  <span className="text-5xl font-serif font-normal text-[#102B2B]">Free</span>
                  <span className="text-xs text-[#6D7E78] font-mono"> / forever</span>
                </div>
                <ul className="space-y-3 text-xs text-[#6D7E78] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>1,000+ AI tutor queries / month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Basic active recall cards</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Core analytics dashboard</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-[#005A57] hover:bg-[#003F3F] text-xs font-bold text-[#F5F3EC] text-center transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Professional Plan (Deep Emerald Recommended Card) */}
            <div className="p-8 rounded-3xl bg-[#003F3F] text-[#F5F3EC] border-2 border-[#005A57] flex flex-col justify-between relative shadow-xl bg-grain-dark">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#B8FF4D] text-[10px] font-mono font-bold uppercase tracking-widest text-[#003F3F]">
                MOST POPULAR
              </div>
              <div>
                <h3 className="text-xl font-serif font-normal text-[#FBFAF6] mb-1">Professional Plan</h3>
                <p className="text-xs text-[#DDE8DF] mb-6">For scholars aiming for top GPA scores.</p>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-xl text-[#6D7E78] line-through font-mono">$59</span>
                  <span className="text-5xl font-serif font-normal text-white">
                    {billingCycle === "monthly" ? "$49" : "$39"}
                  </span>
                  <span className="text-xs text-[#DDE8DF] font-mono"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#DDE8DF] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Unlimited AI tutor queries</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Full syllabus &amp; PDF knowledge graph</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Predictive exam question generator</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-xs font-bold text-[#003F3F] text-center shadow-md transition-all hover:scale-[1.02]"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Campus Group */}
            <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-normal text-[#102B2B] mb-1">Campus Group</h3>
                <p className="text-xs text-[#6D7E78] mb-6">Shared study workspace for project teams.</p>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-xl text-[#6D7E78] line-through font-mono">$109</span>
                  <span className="text-5xl font-serif font-normal text-[#102B2B]">
                    {billingCycle === "monthly" ? "$89" : "$69"}
                  </span>
                  <span className="text-xs text-[#6D7E78] font-mono"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#6D7E78] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Everything in Pro for 10 members</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Shared team course repositories</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-[#005A57] hover:bg-[#003F3F] text-xs font-bold text-[#F5F3EC] text-center transition-colors"
              >
                Create Study Group
              </Link>
            </div>
          </div>
        </section>

        {/* 7. TESTIMONIALS SECTION */}
        <section id="testimonial" className="py-28 px-6 bg-[#F5F3EC] border-t border-[#DDE8DF]">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003F3F] text-[#B8FF4D] text-[11px] font-mono font-semibold mb-4">
              TESTIMONIALS
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] tracking-tight">
              Loved by Students &amp; <span className="italic text-[#005A57]">Scholars</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  "Summa AI feels less like a software tool and more like a calm study partner. My midterm scores jumped from B- to A in two weeks."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Sarah L." />
                <div>
                  <strong className="block text-xs text-[#102B2B]">Sarah L.</strong>
                  <span className="text-[11px] text-[#6D7E78]">Computer Science • Stanford</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  "We replaced 3 different note apps with Summa. It not only saved hours of prep time but also made studying for finals feel effortless."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Daniel K." />
                <div>
                  <strong className="block text-xs text-[#102B2B]">Daniel K.</strong>
                  <span className="text-[11px] text-[#6D7E78]">Pre-Med Scholar • Harvard</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  "Summa understands lecture context better than any platform I've used. It's the first AI tutor that actually feels intelligent."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Maya P." />
                <div>
                  <strong className="block text-xs text-[#102B2B]">Maya P.</strong>
                  <span className="text-[11px] text-[#6D7E78]">Biochemistry Senior • UC Berkeley</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. WAITLIST EARLY ACCESS SECTION */}
        <section id="waitlist" className="py-28 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8DF] text-[#003F3F] text-[11px] font-mono font-semibold mb-4">
            EARLY ACCESS
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] mb-4">
            Join the Summa AI Early Access Waitlist
          </h2>
          <p className="text-[#6D7E78] text-sm max-w-xl mx-auto mb-12 leading-relaxed">
            Reserve your spot for priority access to AI course memory indexing, active recall decks, and personalized semester study tools.
          </p>

          <div className="p-8 sm:p-10 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] text-left shadow-md">
            {waitlistSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#DDE8DF] border border-[#005A57]/20 text-[#003F3F] text-center space-y-3">
                <div className="inline-flex items-center justify-center size-12 rounded-full bg-[#003F3F] text-[#B8FF4D] mx-auto">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-xl font-serif font-normal text-[#003F3F]">You're on the waitlist!</h3>
                <p className="text-xs text-[#6D7E78] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{waitlistName || "Scholar"}</strong>! We've reserved your priority access spot. We'll send invite code details to <strong>{waitlistEmail}</strong> soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#102B2B] mb-2">Full Name</label>
                    <input
                      type="text"
                      value={waitlistName}
                      onChange={(e) => setWaitlistName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] text-xs text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102B2B] mb-2">Student / Academic Email</label>
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="alex@university.edu"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] text-xs text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#102B2B] mb-2">University / Institution</label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] text-xs text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102B2B] mb-2">Primary Major / Major Field</label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g. Computer Science / Pre-Med"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] text-xs text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isWaitlistLoading}
                  className="w-full py-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isWaitlistLoading ? (
                    <span>Processing Reservation...</span>
                  ) : (
                    <>
                      <span>Join Early Access Waitlist</span>
                      <ArrowRight className="size-4 text-[#003F3F]" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 9. DEEP EMERALD GRAINY FOOTER */}
        <footer className="py-16 px-6 bg-[#003F3F] text-[#F5F3EC] border-t border-[#005A57] bg-grain-dark">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 text-left mb-16">
            <div className="md:col-span-5 space-y-4">
              <SummaLogo />
              <p className="text-xs text-[#DDE8DF] leading-relaxed max-w-sm">
                Elevate Learning Experiences with Timeless Precision. Summa AI brings active recall, course grounding, and intelligent tutoring into one calm rhythm.
              </p>
              <div className="space-y-1 text-xs font-mono text-[#DDE8DF]">
                <div>hello@summastudy.com.ng</div>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider">Quick Links</h5>
                <ul className="space-y-2.5 text-[#DDE8DF]">
                  <li><a href="#hero" className="hover:text-[#B8FF4D] transition-colors">Home</a></li>
                  <li><a href="#features" className="hover:text-[#B8FF4D] transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-[#B8FF4D] transition-colors">Pricing</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider">Company</h5>
                <ul className="space-y-2.5 text-[#DDE8DF]">
                  <li><a href="#testimonial" className="hover:text-[#B8FF4D] transition-colors">Testimonials</a></li>
                  <li><a href="#benefit" className="hover:text-[#B8FF4D] transition-colors">Benefits</a></li>
                  <li><a href="#waitlist" className="hover:text-[#B8FF4D] transition-colors">Waitlist</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider">Social Media</h5>
                <ul className="space-y-2.5 text-[#DDE8DF]">
                  <li><a href="#" className="hover:text-[#B8FF4D] transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-[#B8FF4D] transition-colors">Twitter / X</a></li>
                  <li><a href="#" className="hover:text-[#B8FF4D] transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-8 border-t border-[#005A57] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6D7E78] font-mono">
            <span>© 2026 Summa AI · All rights reserved.</span>
            <div className="text-5xl font-serif font-normal text-[#005A57]/60 select-none hidden sm:block tracking-widest">
              SUMMA AI
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
