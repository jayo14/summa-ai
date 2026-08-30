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
        inverse ? "text-[#FBFAF6]" : "text-[#003F3F]"
      }`}
      aria-label="Summa AI"
    >
      {/* Editorial Deep Emerald & Accent Lime Icon Mark */}
      <div className="relative flex items-center justify-center size-8 rounded-xl bg-[#003F3F] text-[#B8FF4D] shadow-sm border border-[#005A57]">
        <Sparkles className="size-4 text-[#B8FF4D]" />
        <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-[#B8FF4D]" />
      </div>

      {!compact && (
        <span className="font-serif font-normal text-xl tracking-tight text-current flex items-baseline">
          summa
          <span className="font-sans font-extrabold text-[11px] tracking-wider uppercase text-[#005A57] bg-[#B8FF4D] px-1.5 py-0.5 rounded-md ml-1.5">
            AI
          </span>
        </span>
      )}
    </div>
  );
}
