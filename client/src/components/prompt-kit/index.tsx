import React, { useState, useRef, useEffect } from "react";
import { ArrowUp, Sparkles, ChevronDown, ChevronUp, Copy, Check, Terminal, ExternalLink, Paperclip, Mic, ImagePlus } from "lucide-react";

/**
 * 1. PromptInput: Flexible, expandable input composer styled with Summa AI's glassmorphism aesthetic.
 */
export interface PromptInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isResponding?: boolean;
  placeholder?: string;
  onAttach?: () => void;
  onVoice?: () => void;
  attachedFile?: { name: string; url: string } | null;
  onRemoveAttach?: () => void;
}

export function PromptInput({
  value,
  onChange,
  onSubmit,
  isResponding = false,
  placeholder = "Ask Summa to explain, test, or map a concept...",
  onAttach,
  onVoice,
  attachedFile,
  onRemoveAttach,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isResponding) {
        onSubmit();
      }
    }
  };

  return (
    <div className="relative w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-3 shadow-lg backdrop-blur-xl transition-all focus-within:border-[#005A57] dark:focus-within:border-[#B8FF4D]">
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 w-fit">
          <Paperclip className="h-3.5 w-3.5" />
          <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
          <button
            type="button"
            onClick={onRemoveAttach}
            className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ×
          </button>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="w-full resize-none bg-transparent px-1 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none min-h-[38px] max-h-[180px]"
      />

      <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1">
          {onAttach && (
            <button
              type="button"
              onClick={onAttach}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Attach academic resource or document"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          )}
          {onVoice && (
            <button
              type="button"
              onClick={onVoice}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              title="Voice input"
            >
              <Mic className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isResponding}
          className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
            value.trim() && !isResponding
              ? "bg-[#005A57] text-[#B8FF4D] hover:bg-[#003F3F] shadow-sm cursor-pointer"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
          }`}
        >
          <ArrowUp className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

/**
 * 2. ThinkingBar: Active live shimmer indicator when model is generating or reasoning.
 */
export function ThinkingBar({ label = "Summa is reasoning over academic sources..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-teal-500/20 bg-[#005A57]/5 dark:bg-[#005A57]/20 px-3.5 py-2 text-xs text-[#005A57] dark:text-[#B8FF4D]">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#005A57] dark:bg-[#B8FF4D]"></span>
      </div>
      <span className="font-mono text-[11px] font-medium tracking-wide uppercase">{label}</span>
    </div>
  );
}

/**
 * 3. ChainOfThought: Collapsible step-by-step reasoning panel with Summa AI styling.
 */
export interface ChainOfThoughtProps {
  steps?: string[];
  reasoningText?: string;
  defaultExpanded?: boolean;
}

export function ChainOfThought({ steps = [], reasoningText, defaultExpanded = false }: ChainOfThoughtProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!steps.length && !reasoningText) return null;

  return (
    <div className="my-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-[#005A57] dark:text-[#B8FF4D]" />
          <span>Thought process ({steps.length || 1} steps)</span>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="p-3 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 font-mono text-[11.5px] leading-relaxed text-slate-700 dark:text-slate-300 space-y-2">
          {reasoningText && <p className="whitespace-pre-wrap opacity-90">{reasoningText}</p>}
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[#005A57] dark:text-[#B8FF4D] font-bold">{idx + 1}.</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * 4. CodeBlock: Formatted code display with copy-to-clipboard functionality.
 */
export interface CodeBlockProps {
  language?: string;
  code: string;
}

export function CodeBlock({ language = "text", code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl border border-slate-800 bg-[#0A1818] overflow-hidden text-slate-100 font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#102B2B] border-b border-slate-800 text-[11px] text-slate-400">
        <span className="uppercase font-semibold tracking-wider text-[#B8FF4D]">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed text-slate-200 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * 5. ToolCall: Indicator badge for tool executions (e.g. database query, graph generation).
 */
export interface ToolCallProps {
  name: string;
  status?: "running" | "completed" | "failed";
  details?: string;
}

export function ToolCall({ name, status = "completed", details }: ToolCallProps) {
  return (
    <div className="my-1.5 inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
      <Terminal className="h-3.5 w-3.5 text-[#005A57] dark:text-[#B8FF4D]" />
      <span className="font-mono text-[11px] font-semibold">{name}</span>
      {status === "running" && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
      {status === "completed" && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
      {status === "failed" && <span className="h-2 w-2 rounded-full bg-rose-500" />}
      {details && <span className="text-[10px] text-slate-400 truncate max-w-[150px]">({details})</span>}
    </div>
  );
}

/**
 * 6. ScrollButton: Floating button to scroll back to the latest message.
 */
export function ScrollButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-24 right-8 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-[#005A57] text-[#B8FF4D] shadow-lg border border-[#B8FF4D]/30 hover:scale-105 transition-all"
      aria-label="Scroll to bottom"
    >
      <ChevronDown className="h-5 w-5" />
    </button>
  );
}

/**
 * 7. SourceCard: Academic source citation card component.
 */
export interface SourceCardProps {
  title: string;
  type?: string;
  detail?: string;
  onOpen?: () => void;
}

export function SourceCard({ title, type = "Reference", detail, onOpen }: SourceCardProps) {
  return (
    <div className="my-2 flex items-center justify-between rounded-xl border border-teal-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 p-2.5 text-xs">
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-100">
          <span className="rounded bg-[#005A57] text-[#B8FF4D] text-[9px] font-mono px-1.5 py-0.5 uppercase font-bold">
            {type}
          </span>
          <span className="truncate">{title}</span>
        </div>
        {detail && <p className="text-[11px] text-slate-500 truncate mt-0.5">{detail}</p>}
      </div>
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="text-[#005A57] dark:text-[#B8FF4D] hover:underline flex items-center gap-1 text-[11px] font-medium flex-shrink-0"
        >
          <span>View</span>
          <ExternalLink className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
