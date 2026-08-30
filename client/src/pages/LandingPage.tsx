import React, { useState } from "react";
import { Link } from "wouter";
import { SummaLogo } from "@/components/SummaLogo";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  GraduationCap,
  Layers,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-600/15 blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <SummaLogo />

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-8 backdrop-blur-md">
          <Sparkles className="size-4" />
          <span>Summa AI 2.0 for University Students</span>
          <ChevronRight className="size-3.5" />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-bold text-white tracking-tight leading-[1.1] mb-8">
          Master any course without <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            fragmented study notes.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Summa AI brings your lectures, syllabus, active recall quizzes, and tutor support into one intelligent, chat-first learning workspace.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Started Free</span>
            <ArrowRight className="size-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-bold text-slate-300 flex items-center justify-center gap-2 transition-all"
          >
            <span>See How it Works</span>
          </a>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="relative rounded-3xl border border-slate-800/80 bg-slate-900/60 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl max-w-4xl mx-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/60 mb-4">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-rose-500/80" />
              <div className="size-3 rounded-full bg-amber-500/80" />
              <div className="size-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[11px] font-mono text-slate-500">app.summa-ai.com/workspace</span>
            <div className="w-12" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-3 text-purple-400 font-bold text-xs">
                <Brain className="size-4" />
                <span>Memory Recall</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                "Runtime polymorphism identified as key focus area for CSC 201."
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-3 text-indigo-400 font-bold text-xs">
                <Layers className="size-4" />
                <span>Active Sources</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                3 approved course materials connected in scope.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-xs">
                <Zap className="size-4" />
                <span>Mastery Estimate</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Target proficiency: 84% (+23% this week)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-24 px-6 border-t border-slate-900 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono mb-3 block">
            SUPERCHARGE YOUR STUDY WORKFLOW
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4 tracking-tight">
            Designed for deep comprehension, not superficial summaries.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Summa AI acts as a continuous study partner that adapts to your learning pace and remembers what you've mastered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 transition-all group">
            <div className="size-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageSquare className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Contextual AI Chat</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Ask questions grounded directly in your syllabus and course readings with zero hallucinated fluff.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/40 transition-all group">
            <div className="size-12 rounded-2xl bg-purple-600/10 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Active Recall Quizzes</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Automatically generates diagnostic prediction questions to lock in long-term memory.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="size-12 rounded-2xl bg-emerald-600/10 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpen className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Integrated Library</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Organize course materials into course folders with instant AI search and citation support.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 border-t border-slate-900 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase font-mono mb-3 block">
            SIMPLE, TRANSPARENT PRICING
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white mb-4 tracking-tight">
            Invest in your academic success.
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mb-8">
            Choose the plan that fits your semester goals. Cancel anytime.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === "monthly" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === "yearly" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Yearly <span className="text-[10px] text-emerald-400 font-mono ml-1">SAVE 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Free Starter */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Student Starter</h3>
              <p className="text-xs text-slate-400 mb-6">Essential AI study tools for getting started.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white font-mono">$0</span>
                <span className="text-xs text-slate-500"> / forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 flex-shrink-0" />
                  <span>50 AI tutor messages / day</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 flex-shrink-0" />
                  <span>3 active course source files</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 flex-shrink-0" />
                  <span>Basic study recall cards</span>
                </li>
              </ul>
            </div>
            <Link
              href="/sign-up"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white text-center transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Pro Scholar (Featured) */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/40 to-slate-900 border-2 border-indigo-500 flex flex-col justify-between relative shadow-2xl">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-indigo-600 text-[10px] font-bold uppercase tracking-widest text-white shadow-md">
              MOST POPULAR
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Pro Scholar</h3>
              <p className="text-xs text-slate-300 mb-6">For students aiming for top grades every semester.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white font-mono">
                  {billingCycle === "monthly" ? "$12" : "$9.60"}
                </span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-200 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-indigo-400 flex-shrink-0" />
                  <span>Unlimited AI tutor messages</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-indigo-400 flex-shrink-0" />
                  <span>Unlimited course source files</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-indigo-400 flex-shrink-0" />
                  <span>Advanced Active Recall & Memory</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-indigo-400 flex-shrink-0" />
                  <span>Mastery progress tracking</span>
                </li>
              </ul>
            </div>
            <Link
              href="/sign-up"
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white text-center shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Campus Team */}
          <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Study Group</h3>
              <p className="text-xs text-slate-400 mb-6">Shared study workspace for project teams.</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-white font-mono">
                  {billingCycle === "monthly" ? "$29" : "$23.20"}
                </span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 flex-shrink-0" />
                  <span>Everything in Pro for 5 members</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 flex-shrink-0" />
                  <span>Shared course repositories</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="size-4 text-emerald-400 flex-shrink-0" />
                  <span>Collaborative study notes</span>
                </li>
              </ul>
            </div>
            <Link
              href="/sign-up"
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white text-center transition-colors"
            >
              Create Study Group
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 px-6 border-t border-slate-900 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-6">
          Ready to transform how you study?
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto mb-8">
          Join thousands of university students learning faster and recalling more with Summa AI.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
        >
          <span>Create Free Account</span>
          <ArrowRight className="size-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-900/80 text-center text-xs text-slate-500 font-medium">
        © 2026 Summa AI · Intelligent Student Learning Platform
      </footer>
    </div>
  );
}
