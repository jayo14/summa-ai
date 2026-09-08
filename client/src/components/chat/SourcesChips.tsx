import { useState } from "react";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

interface Source {
  id: string;
  title: string;
  snippet: string;
  score: number;
}

export default function SourcesChips({ sources }: { sources: Source[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-2 rounded-[14px] border border-[#DDE8DF] dark:border-[#2A3838] bg-[#F8FAF8]/60 dark:bg-[#1A2424]/60 overflow-hidden">
      {/* Header / toggle */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#DDE8DF]/30 dark:hover:bg-[#2A3838]/30 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <FileText size={13} className="text-[#005A57] dark:text-[#B8FF4D]" />
          <span className="text-[11px] font-semibold text-[#005A57] dark:text-[#B8FF4D]">
            {sources.length} source{sources.length > 1 ? "s" : ""} used
          </span>
        </div>
        {expanded ? (
          <ChevronUp size={13} className="text-[#6D7E78] dark:text-[#8FA29B]" />
        ) : (
          <ChevronDown size={13} className="text-[#6D7E78] dark:text-[#8FA29B]" />
        )}
      </button>

      {/* Expanded source list */}
      {expanded && (
        <div className="px-3 pb-2.5 space-y-1.5">
          {sources.map((src, i) => (
            <div
              key={src.id || i}
              className="rounded-[10px] border border-[#DDE8DF]/60 dark:border-[#2A3838]/60 bg-white/50 dark:bg-[#1C2323]/50 p-2.5"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-[#102B2B] dark:text-[#F5F3EC]">
                  {src.title}
                </span>
                <span className="text-[10px] font-mono text-[#005A57]/70 dark:text-[#B8FF4D]/70">
                  {Math.round(src.score * 100)}%
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#6D7E78] dark:text-[#8FA29B] line-clamp-3">
                {src.snippet}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
