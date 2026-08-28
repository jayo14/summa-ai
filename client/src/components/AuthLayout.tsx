import React, { ReactNode } from "react";
import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";
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
  heroHeadline = "Teaching, learning, and family updates in one rhythm.",
  heroDescription = "Summa AI brings the essential learning day into a shared, focused place—without relying on fragmented conversations.",
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#eef0f3] dark:bg-[#0b0f19] flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      <div className="w-full max-w-[1160px] bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/70 dark:border-slate-800 min-h-[690px]">
        {/* Left Panel - Dark Hero */}
        <div className="lg:col-span-5 bg-[#121929] text-white p-8 lg:p-11 flex flex-col justify-between relative overflow-hidden">
          {/* Top Background Geometric Accent */}
          <div className="absolute -top-16 -right-16 size-72 rounded-full border-[36px] border-blue-600/15 pointer-events-none" />
          <div className="absolute top-8 right-8 size-48 rounded-full border-[24px] border-blue-500/10 pointer-events-none" />

          {/* Branding Top */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 font-extrabold text-lg tracking-tighter">
              S
            </div>
            <div>
              <span className="block text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                SUMMA AI
              </span>
              <strong className="block text-sm font-bold text-white leading-tight">
                Learning hub
              </strong>
            </div>
          </div>

          {/* Hero Main Copy */}
          <div className="relative z-10 my-10 max-w-sm">
            <span className="inline-block text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-3">
              A CLEARER LEARNING DAY
            </span>
            <h2 className="text-3xl lg:text-[34px] font-serif font-bold text-white tracking-tight leading-[1.2] mb-4">
              {heroHeadline}
            </h2>
            <p className="text-xs lg:text-sm text-slate-300/90 leading-relaxed font-normal">
              {heroDescription}
            </p>
          </div>

          {/* Bottom Security Card */}
          <div className="relative z-10 bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-4 flex gap-3.5 items-start">
            <div className="size-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase mb-0.5">
                SECURE ACCESS
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use a unique password. Your account role determines the classes, records, and controls you can access.
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 lg:p-12 flex flex-col justify-between">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                S
              </div>
              <div>
                <span className="block text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                  SUMMA AI
                </span>
                <strong className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                  Learning hub
                </strong>
              </div>
            </div>

            <Link
              href={topRightLink.href}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              {topRightLink.label}
            </Link>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-[420px] mx-auto my-auto py-6">
            {children}
          </div>

          {/* Footer */}
          <div className="text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            © 2026 Summa AI · Secure learning access
          </div>
        </div>
      </div>
    </div>
  );
}
