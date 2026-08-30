import React, { ReactNode } from "react";
import { Link } from "wouter";
import { ShieldCheck, Sparkles } from "lucide-react";
import { SummaLogo } from "@/components/SummaLogo";

interface AuthLayoutProps {
  children: ReactNode;
  topRightLink: {
    href: string;
    label: string;
  };
  heroHeadline?: string;
  heroDescription?: string;
}

export function AuthLayout({
  children,
  topRightLink,
  heroHeadline = "Teaching, learning, and study recall in one rhythm.",
  heroDescription = "Summa AI brings the essential learning day into a shared, focused place—without relying on fragmented conversations.",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] dark:from-[#090d16] dark:via-[#0f172a] dark:to-[#1e293b] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden">
      {/* Background Decorative Aether Orbs */}
      <div className="absolute top-[-100px] left-[-80px] w-96 h-96 rounded-full bg-gradient-to-br from-purple-500/20 via-blue-500/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-100px] w-[30rem] h-[30rem] rounded-full bg-gradient-to-tl from-indigo-500/20 via-pink-500/15 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header - Matches Dashboard Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between py-2 px-1">
        <SummaLogo />

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400 font-medium">
            {topRightLink.label === "Create account" ? "Need an account?" : "Already have an account?"}
          </span>
          <Link
            href={topRightLink.href}
            className="px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white shadow-xs backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {topRightLink.label}
          </Link>
        </div>
      </header>

      {/* Main Grid Shell (No outer box container wrapper) */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side Hero Panel - Dashboard Glass Aesthetic */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold w-fit backdrop-blur-sm">
            <Sparkles className="size-3.5" />
            <span className="tracking-wide uppercase text-[10px]">Summa AI Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            {heroHeadline}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed font-normal">
            {heroDescription}
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md shadow-xs flex items-start gap-3">
              <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs">
                AI
              </div>
              <div>
                <strong className="block text-xs font-semibold text-slate-900 dark:text-white">Smart Recall</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Contextual study cards</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 backdrop-blur-md shadow-xs flex items-start gap-3">
              <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <strong className="block text-xs font-semibold text-slate-900 dark:text-white">Protected Hub</strong>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Encrypted security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Interactive Glass Card Form Shell */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="p-6 sm:p-8 md:p-9 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-white/90 dark:border-slate-800/90 shadow-2xl backdrop-blur-xl transition-all">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto py-3 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
        © 2026 Summa AI · Intelligent Learning & Study Workspace
      </footer>
    </div>
  );
}

