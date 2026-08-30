import React from "react";
import { SummaLogo } from "@/components/SummaLogo";
import { Sparkles } from "lucide-react";

export function SummaPreloader() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-[#003F3F] text-[#FBFAF6] bg-grain-dark relative overflow-hidden transition-colors duration-300"
      role="status"
      aria-label="Loading Summa AI"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-[#B8FF4D]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 size-64 rounded-full bg-[#005A57]/40 blur-3xl pointer-events-none" />

      {/* Main Preloader Glass Box */}
      <div className="relative z-10 flex flex-col items-center p-8 sm:p-10 rounded-3xl bg-[#005A57]/30 border border-[#6D7E78]/30 shadow-2xl backdrop-blur-xl max-w-sm w-11/12 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="mb-6">
          <SummaLogo inverse />
        </div>

        {/* Pulsing Orb & Spinner */}
        <div className="relative flex items-center justify-center my-4">
          <div className="size-12 rounded-full border-2 border-[#005A57] border-t-[#B8FF4D] animate-spin" />
          <div className="absolute size-6 rounded-full bg-[#B8FF4D]/20 animate-ping" />
          <Sparkles className="absolute size-4 text-[#B8FF4D]" />
        </div>

        {/* Brand Status Copy */}
        <p className="mt-4 text-xs font-mono text-[#DDE8DF] tracking-wider uppercase flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#B8FF4D] animate-pulse" />
          Preparing learning workspace...
        </p>

        <span className="mt-2 text-[11px] text-[#6D7E78] font-sans">
          Grounded in your course materials
        </span>
      </div>
    </div>
  );
}

export default SummaPreloader;
