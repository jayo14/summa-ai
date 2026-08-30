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
  PhoneCall,
  Mail,
  Send,
  Sliders,
  Cpu
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen w-full bg-[#05070c] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden antialiased">
      {/* Dynamic Background Radial Blur Orbs - Tellaia Ambient Aesthetic */}
      <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[400px] left-[-200px] w-[600px] h-[600px] bg-purple-600/15 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute top-[1200px] right-[-150px] w-[700px] h-[700px] bg-indigo-500/15 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[200px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[160px] rounded-full pointer-events-none" />

      {/* Floating Floating Header / Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#05070c]/80 border-b border-slate-800/60 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <SummaLogo />

          <nav className="hidden md:flex items-center gap-9 text-xs font-semibold text-slate-300 tracking-wide">
            <a href="#product" className="hover:text-white transition-colors">Product</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#benefit" className="hover:text-white transition-colors">Benefits</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonial" className="hover:text-white transition-colors">Testimonial</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-200 text-xs font-bold shadow-lg shadow-white/10 transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              Try Free Now
            </Link>
          </div>
        </div>
      </header>

      {/* Main Section Content Wrapper */}
      <main className="relative z-10">

        {/* 1. HERO SECTION */}
        <section id="hero" className="relative pt-20 pb-20 md:pt-28 md:pb-32 px-6 text-center max-w-6xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 text-xs font-medium mb-8 shadow-xl backdrop-blur-md">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
              <img className="inline-block h-5 w-5 rounded-full ring-2 ring-slate-900" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
            </div>
            <span className="text-slate-200 font-medium">7,000+ university students empowered</span>
            <ArrowRight className="size-3.5 text-slate-400" />
          </div>

          {/* Main Headline with Tellaia Instrument Typography */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal text-white tracking-tight leading-[1.08] mb-8">
            Elevate <em className="italic font-serif font-normal text-indigo-300">Learning Experiences</em> <br className="hidden sm:inline" />
            with Timeless Precision
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
            Create refined, active-recall study workspaces effortlessly. Summa AI blends timeless design with intelligent memory retrieval for a new era of student performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
            <Link
              href="/sign-up"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-200 text-slate-950 text-sm font-bold shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              Build Your Study Workspace
            </Link>
            <a
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-sm font-semibold text-slate-300 transition-all"
            >
              Book a Demo
            </a>
          </div>

          {/* Hero Main Mockup Frame - Webflow Tellaia Glass Frame */}
          <div id="product" className="relative rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4 sm:p-6 shadow-2xl backdrop-blur-2xl max-w-5xl mx-auto overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
            
            {/* Mockup Header Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60 mb-6 bg-slate-900/40 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-slate-700" />
                <div className="size-3 rounded-full bg-slate-700" />
                <div className="size-3 rounded-full bg-slate-700" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                <Sparkles className="size-3 text-indigo-400" />
                <span>summa-ai.app/csc-201/active-recall</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span className="inline-block size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Workspace</span>
              </div>
            </div>

            {/* Interactive Inner Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
              {/* Left Chat Flow Simulator */}
              <div className="md:col-span-7 bg-slate-900/50 border border-slate-800/60 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span className="font-semibold text-slate-200">CSC 201 — Data Structures</span>
                    <span className="font-mono text-indigo-400">Context: 4 Lectures Loaded</span>
                  </div>

                  {/* Student Question */}
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 text-xs text-slate-200 max-w-[85%] self-end ml-auto">
                    Can you explain how AVL tree self-balancing works before tomorrow's midterm quiz?
                  </div>

                  {/* AI Response Card */}
                  <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-2xl p-4 text-xs text-indigo-100 space-y-2 max-w-[90%]">
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <Sparkles className="size-3.5" />
                      <span>Summa Intelligent Recall</span>
                    </div>
                    <p className="leading-relaxed">
                      AVL trees maintain height balance by checking the balance factor: <code className="font-mono bg-indigo-900/60 px-1 py-0.5 rounded">BF = height(Left) - height(Right)</code>. If |BF| &gt; 1, it executes a single or double rotation.
                    </p>
                    <div className="pt-2 flex items-center gap-2 text-[10px] text-indigo-400 border-t border-indigo-900/40">
                      <CheckCircle2 className="size-3 text-emerald-400" />
                      <span>Grounded in Lecture 7: Tree Rotations (Slide 14)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono">
                  <Sliders className="size-3.5 text-slate-500" />
                  <span>Reasoning Mode Active • Ask follow-up question...</span>
                </div>
              </div>

              {/* Right Side Adaptive Analytics Cards */}
              <div className="md:col-span-5 flex flex-col gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-300">Course Mastery Score</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">+14% this week</span>
                  </div>
                  <div className="text-3xl font-serif font-bold text-white mb-2">88%</div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[88%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                      <Brain className="size-5" />
                    </div>
                    <div>
                      <strong className="block text-xs text-white">Active Recall Cards</strong>
                      <span className="text-[11px] text-slate-400">14 new cards generated today</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono">Ready</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                      <BookOpen className="size-5" />
                    </div>
                    <div>
                      <strong className="block text-xs text-white">Connected Sources</strong>
                      <span className="text-[11px] text-slate-400">Syllabus + 12 PDFs synced</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">Synced</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. TRUSTED BY LOGO CAROUSEL SECTION */}
        <section id="brand" className="py-14 border-y border-slate-900/80 bg-slate-950/40">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8 font-mono">
              TRUSTED BY STUDENTS AT TOP UNIVERSITIES
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="text-sm font-serif font-bold text-slate-300">STANFORD UNIV</div>
              <div className="text-sm font-serif font-bold text-slate-300">MIT CAMPUS</div>
              <div className="text-sm font-serif font-bold text-slate-300">HARVARD SCHOLARS</div>
              <div className="text-sm font-serif font-bold text-slate-300">OXFORD ACADEMY</div>
              <div className="text-sm font-serif font-bold text-slate-300">CAMBRIDGE LABS</div>
              <div className="text-sm font-serif font-bold text-slate-300">UC BERKELEY</div>
            </div>
          </div>
        </section>

        {/* 3. FEATURED HIGHLIGHTS (EVERYTHING YOU NEED) */}
        <section id="features" className="py-28 px-6 max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-mono font-semibold mb-4">
              FEATURES
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-[1.12]">
              Everything You Need to Build <br />
              <span className="italic text-indigo-300">Intelligent Study Workspaces</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
              Every element is crafted to make AI-driven study experiences feel effortless. From modular active-recall chat layouts to adaptive knowledge metrics.
            </p>
          </div>

          {/* Tellaia 3-Card Asymmetric Bento Feature Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Card 1: Adaptive Conversations (Featured Large) */}
            <div className="md:col-span-7 rounded-3xl bg-slate-900/40 border border-slate-800 p-8 flex flex-col justify-between hover:border-indigo-500/40 transition-all relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-64 bg-indigo-600/10 blur-3xl pointer-events-none" />
              <div>
                <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-6">
                  <MessageSquare className="size-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-3">Adaptive Conversations</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                  Adjusting responses in real-time to match your current course depth. Feels natural, precise, and completely aligned with your exam topics.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-mono">
                <span>Real-time Context Matching</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Multi-Channel Integration */}
            <div className="md:col-span-5 rounded-3xl bg-slate-900/40 border border-slate-800 p-8 flex flex-col justify-between hover:border-purple-500/40 transition-all relative overflow-hidden group">
              <div>
                <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
                  <Layers className="size-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-3">Multi-Source Sync</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Connect Summa AI effortlessly across PDFs, lecture slides, and notes. Keep your study context consistent everywhere.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-mono">
                <span>PDFs • Slides • Syllabi</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: Emotional & Exam Awareness */}
            <div className="md:col-span-5 rounded-3xl bg-slate-900/40 border border-slate-800 p-8 flex flex-col justify-between hover:border-emerald-500/40 transition-all relative overflow-hidden group">
              <div>
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                  <Heart className="size-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-3">Empathetic Tutoring</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Goes beyond rigid Q&amp;A. Formats responses with encouraging feedback and tailored pace adjustments when exam stress builds up.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-mono">
                <span>Personalized Guidance</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Knowledge-Driven Intelligence */}
            <div className="md:col-span-7 rounded-3xl bg-slate-900/40 border border-slate-800 p-8 flex flex-col justify-between hover:border-amber-500/40 transition-all relative overflow-hidden group">
              <div>
                <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
                  <Cpu className="size-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-3">Knowledge-Driven Intelligence</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                  Powered by your exact course material and active memory indexing. Answers evolve continuously as your course catalog grows.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-mono">
                <span>Zero Hallucination Guardrails</span>
                <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* 4. BENEFIT SECTION (THE HUMAN TOUCH ENHANCED) */}
        <section id="benefit" className="py-28 px-6 bg-slate-950/60 border-t border-slate-900">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-mono font-semibold mb-4">
              BENEFITS
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-white tracking-tight leading-[1.1]">
              The Human Touch, Enhanced by <span className="italic text-emerald-300">Intelligence</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Experience an AI study companion that understands your academic goals, adapts to your schedule, and grows smarter with every flashcard exchange.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Benefit Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-slate-900/30 border border-slate-800">
              <div className="md:col-span-6 space-y-4 text-left">
                <span className="text-xs font-mono font-semibold text-indigo-400 uppercase tracking-wider">01 / CONNECTION</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">Build Meaningful Study Habits</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Summa AI turns overwhelming course syllabi into interactive daily recall sessions—turning dry reading into experiences that feel personal and motivating.
                </p>
                <Link href="/sign-up" className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-indigo-400 transition-colors pt-2">
                  <span>Start Building Habits</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="md:col-span-6 bg-slate-950 rounded-2xl border border-slate-800/80 p-6">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 text-xs text-slate-400 font-mono">
                  <span>Habit Consistency Tracker</span>
                  <span className="text-emerald-400">12 Day Streak 🔥</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono text-slate-400">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">MON</div>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">TUE</div>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">WED</div>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">THU</div>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">FRI</div>
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">SAT</div>
                  <div className="p-2 rounded-lg bg-indigo-600 text-white font-bold">SUN</div>
                </div>
              </div>
            </div>

            {/* Benefit Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-slate-900/30 border border-slate-800">
              <div className="md:col-span-6 order-2 md:order-1 bg-slate-950 rounded-2xl border border-slate-800/80 p-6">
                <div className="text-xs font-mono text-slate-400 mb-2">Midterm Target Mastery</div>
                <div className="text-3xl font-serif font-bold text-white mb-2">$94% Target Achieved</div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-4">
                  <div className="bg-indigo-500 h-full w-[94%]" />
                </div>
                <div className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  Automated recall eliminated 4 hours of redundant manual note summarizing.
                </div>
              </div>
              <div className="md:col-span-6 order-1 md:order-2 space-y-4 text-left">
                <span className="text-xs font-mono font-semibold text-purple-400 uppercase tracking-wider">02 / EFFICIENCY</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white">Boost Study Efficiency Effortlessly</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  Automate repetitive flashcard generation while maintaining exact academic rigor. Summa AI ensures every review question is instant and aligned with course targets.
                </p>
                <Link href="/sign-up" className="inline-flex items-center gap-2 text-xs font-bold text-white hover:text-purple-400 transition-colors pt-2">
                  <span>Explore Efficiency Tools</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PRICING SECTION (MONTHLY / YEARLY TABBED) */}
        <section id="pricing" className="py-28 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[11px] font-mono font-semibold mb-4">
              PRICING
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-white tracking-tight mb-4">
              Choose the Plan That <span className="italic text-purple-300">Grows With You</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mb-8">
              Scale your academic performance with flexible options designed for students and study groups.
            </p>

            {/* Tellaia Style Tab Switcher */}
            <div className="inline-flex items-center p-1.5 rounded-full bg-slate-900 border border-slate-800">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly" ? "bg-white text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "yearly" ? "bg-white text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                Yearly <span className="text-[10px] text-emerald-400 font-mono ml-1 font-extrabold">SAVE 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-white mb-1">Starter</h3>
                <p className="text-xs text-slate-400 mb-6">Essential AI study tools to get started.</p>
                <div className="mb-6">
                  <span className="text-5xl font-serif font-bold text-white">Free</span>
                  <span className="text-xs text-slate-500 font-mono"> / forever</span>
                </div>
                <div className="py-3 border-y border-slate-800 mb-6 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-400" />
                  <span>Get your free 7-day trial today!</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 flex-shrink-0" />
                    <span>1,000+ AI tutor queries / month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 flex-shrink-0" />
                    <span>Basic active recall cards</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 flex-shrink-0" />
                    <span>Core analytics dashboard</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white text-center transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Professional Plan (Most Popular Featured) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950/50 to-slate-900/80 border-2 border-indigo-500 flex flex-col justify-between relative shadow-2xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-[10px] font-mono font-bold uppercase tracking-widest text-white shadow-lg">
                MOST POPULAR
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-white mb-1">Professional Plan</h3>
                <p className="text-xs text-slate-300 mb-6">For scholars aiming for top GPA scores.</p>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-xl text-slate-500 line-through font-mono">$59</span>
                  <span className="text-5xl font-serif font-bold text-white">
                    {billingCycle === "monthly" ? "$49" : "$39"}
                  </span>
                  <span className="text-xs text-slate-400 font-mono"> / month</span>
                </div>
                <div className="py-3 border-y border-indigo-900/60 mb-6 text-[11px] text-indigo-300 font-mono flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-400" />
                  <span>Unlimited Course Document Sync</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-indigo-400 flex-shrink-0" />
                    <span>Unlimited AI tutor queries</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-indigo-400 flex-shrink-0" />
                    <span>Full syllabus & PDF knowledge graph</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-indigo-400 flex-shrink-0" />
                    <span>Predictive exam question generator</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-indigo-400 flex-shrink-0" />
                    <span>Priority AI response speed</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-slate-200 text-xs font-bold text-slate-950 text-center shadow-lg transition-all hover:scale-[1.02]"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise / Study Group */}
            <div className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-bold text-white mb-1">Campus Group</h3>
                <p className="text-xs text-slate-400 mb-6">Shared study workspace for project teams.</p>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-xl text-slate-500 line-through font-mono">$109</span>
                  <span className="text-5xl font-serif font-bold text-white">
                    {billingCycle === "monthly" ? "$89" : "$69"}
                  </span>
                  <span className="text-xs text-slate-500 font-mono"> / month</span>
                </div>
                <div className="py-3 border-y border-slate-800 mb-6 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                  <Users className="size-3.5 text-emerald-400" />
                  <span>Up to 10 Student Seats</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 flex-shrink-0" />
                    <span>Everything in Pro for 10 members</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 flex-shrink-0" />
                    <span>Shared team course repositories</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-400 flex-shrink-0" />
                    <span>Collaborative active recall quizzes</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white text-center transition-colors"
              >
                Create Study Group
              </Link>
            </div>
          </div>
        </section>

        {/* 6. TESTIMONIAL CAROUSEL SECTION */}
        <section id="testimonial" className="py-28 px-6 bg-slate-950/80 border-t border-slate-900">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[11px] font-mono font-semibold mb-4">
              TESTIMONIALS
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-white tracking-tight">
              Loved by Students &amp; <span className="italic text-amber-300">Scholars</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial Card 1 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  "Summa AI feels less like a software tool and more like an empathetic study partner. My midterm scores jumped from B- to A in two weeks."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Sarah L." />
                <div>
                  <strong className="block text-xs text-white">Sarah L.</strong>
                  <span className="text-[11px] text-slate-500">Computer Science Major • Stanford</span>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  "We replaced 3 different note apps with Summa. It not only saved hours of prep time but also made studying for finals feel effortless."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Daniel K." />
                <div>
                  <strong className="block text-xs text-white">Daniel K.</strong>
                  <span className="text-[11px] text-slate-500">Pre-Med Scholar • Harvard</span>
                </div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  "Summa understands lecture context better than any platform I've used. It's the first AI tutor that actually feels intelligent."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-800 flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Maya P." />
                <div>
                  <strong className="block text-xs text-white">Maya P.</strong>
                  <span className="text-[11px] text-slate-500">Biochemistry Senior • UC Berkeley</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. CONTACT US SECTION (TELLAIA FORM CLONE) */}
        <section id="contact" className="py-28 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono font-semibold mb-4">
            CONTACT US
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-white mb-4">
            Get in touch, let us know how we can help
          </h2>
          <p className="text-slate-400 text-sm mb-12">
            Our dedicated student support team is just a message away.
          </p>

          {/* Contact Form Block */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/50 border border-slate-800/90 text-left shadow-2xl backdrop-blur-xl">
            {contactSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center font-medium text-sm">
                Thank you! Your message has been received. Our team will get back to you shortly.
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="e.g. johndoe@gmail.com"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Type your message..."
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-full bg-white hover:bg-slate-200 text-slate-950 text-xs font-bold shadow-lg transition-all hover:scale-[1.01]"
                >
                  Submit Message
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 8. TELLAIA FOOTER */}
        <footer className="py-16 px-6 border-t border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 text-left mb-16">
            <div className="md:col-span-5 space-y-4">
              <SummaLogo />
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                Elevate Learning Experiences with Timeless Elegance. Summa AI brings active recall, course grounding, and intelligent tutoring into one rhythm.
              </p>
              <div className="space-y-1 text-xs font-mono text-slate-300">
                <div>hello@summa-ai.com</div>
                <div>+1 (509) 121-2909</div>
              </div>
            </div>

            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider">Quick Links</h5>
                <ul className="space-y-2.5 text-slate-400">
                  <li><a href="#hero" className="hover:text-white transition-colors">Home</a></li>
                  <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider">Company</h5>
                <ul className="space-y-2.5 text-slate-400">
                  <li><a href="#testimonial" className="hover:text-white transition-colors">Testimonials</a></li>
                  <li><a href="#benefit" className="hover:text-white transition-colors">Benefits</a></li>
                  <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider">Social Media</h5>
                <ul className="space-y-2.5 text-slate-400">
                  <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Twitter / X</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>© 2026 Summa AI · All rights reserved.</span>
            <div className="text-5xl font-serif font-bold text-slate-900/40 select-none hidden sm:block tracking-widest">
              SUMMA AI
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
