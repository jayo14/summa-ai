import React from "react";
import { Sparkles } from "lucide-react";

type SummaLogoProps = {
  compact?: boolean;
  inverse?: boolean;
};

export function SummaLogo({ compact = false, inverse = false }: SummaLogoProps) {
  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none font-sans ${
        inverse ? "text-[#FBFAF6]" : "text-[#FBFAF6]"
      }`}
      aria-label="Summa AI"
    >
      {/* High-Contrast Soft Cream & Accent Lime Icon Mark */}
      <div className="relative flex items-center justify-center size-8.5 rounded-xl bg-[#005A57] text-[#B8FF4D] shadow-md border border-[#B8FF4D]/40">
        <Sparkles className="size-4.5 text-[#B8FF4D]" />
        <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#B8FF4D] ring-2 ring-[#003F3F]" />
      </div>

      {!compact && (
        <span className="font-serif font-normal text-2xl tracking-tight text-[#FBFAF6] flex items-baseline drop-shadow-xs">
          summa
          <span className="font-sans font-extrabold text-[11px] tracking-wider uppercase text-[#003F3F] bg-[#B8FF4D] px-1.5 py-0.5 rounded-md ml-1.5 shadow-sm">
            AI
          </span>
        </span>
      )}
    </div>
  );
}
