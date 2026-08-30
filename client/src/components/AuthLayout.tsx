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
    <div className="min-h-screen w-full bg-[#003F3F] text-[#F5F3EC] flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans relative overflow-hidden bg-grain-dark">
      {/* Background Radial Glow */}
      <div className="absolute top-[-100px] left-[-80px] w-96 h-96 rounded-full bg-[#005A57]/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-120px] right-[-100px] w-[30rem] h-[30rem] rounded-full bg-[#005A57]/30 blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex items-center justify-between py-2 px-1">
        <SummaLogo />

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-xs text-[#DDE8DF] font-medium">
            {topRightLink.label === "Create account" ? "Need an account?" : "Already have an account?"}
          </span>
          <Link
            href={topRightLink.href}
            className="px-4 py-2 rounded-full bg-[#005A57] border border-[#6D7E78]/40 hover:bg-[#003F3F] text-xs font-bold text-[#F5F3EC] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {topRightLink.label}
          </Link>
        </div>
      </header>

      {/* Main Grid Shell */}
      <main className="relative z-10 w-full max-w-6xl mx-auto my-auto py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side Hero Panel */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#005A57]/60 border border-[#6D7E78]/30 text-[#B8FF4D] text-xs font-semibold w-fit backdrop-blur-sm">
            <Sparkles className="size-3.5 text-[#B8FF4D]" />
            <span className="tracking-wide uppercase text-[10px] font-mono">Summa AI Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal text-[#FBFAF6] tracking-tight leading-[1.15]">
            {heroHeadline}
          </h1>

          <p className="text-sm sm:text-base text-[#DDE8DF] max-w-lg leading-relaxed font-normal">
            {heroDescription}
          </p>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
            <div className="p-3.5 rounded-2xl bg-[#005A57]/40 border border-[#6D7E78]/30 backdrop-blur-md shadow-xs flex items-start gap-3">
              <div className="size-8 rounded-xl bg-[#005A57] text-[#B8FF4D] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs font-mono">
                AI
              </div>
              <div>
                <strong className="block text-xs font-semibold text-[#FBFAF6]">Smart Recall</strong>
                <span className="text-[11px] text-[#DDE8DF]">Contextual study cards</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#005A57]/40 border border-[#6D7E78]/30 backdrop-blur-md shadow-xs flex items-start gap-3">
              <div className="size-8 rounded-xl bg-[#005A57] text-[#B8FF4D] flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="size-4" />
              </div>
              <div>
                <strong className="block text-xs font-semibold text-[#FBFAF6]">Protected Hub</strong>
                <span className="text-[11px] text-[#DDE8DF]">Encrypted security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Soft Cream Card Form Shell */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="p-6 sm:p-8 md:p-9 rounded-3xl bg-[#F5F3EC] text-[#102B2B] border border-[#DDE8DF] shadow-2xl transition-all">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto py-3 text-center text-xs text-[#6D7E78] font-mono">
        © 2026 Summa AI · Intelligent Learning &amp; Study Workspace
      </footer>
    </div>
  );
}

