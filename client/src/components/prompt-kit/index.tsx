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
    <div className="relative w-full rounded-2xl border border-[#DDE8DF] dark:border-[#2A3838] bg-[#FBFAF6] dark:bg-[#1C2323] p-3 shadow-lg backdrop-blur-xl transition-all focus-within:border-[#005A57] dark:focus-within:border-[#B8FF4D]">
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-[#005A57]/10 dark:bg-[#232D2D] border border-[#005A57]/20 dark:border-[#2A3838] px-3 py-1.5 text-xs text-[#003F3F] dark:text-[#B8FF4D] w-fit">
          <Paperclip className="h-3.5 w-3.5" />
          <span className="font-medium truncate max-w-[200px]">{attachedFile.name}</span>
          <button
            type="button"
            onClick={onRemoveAttach}
            className="ml-1 text-[#6D7E78] hover:text-[#102B2B] dark:hover:text-[#FBFAF6]"
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
        style={{ outline: "none" }}
        className="w-full resize-none bg-transparent px-1 text-sm text-[#102B2B] dark:text-[#FBFAF6] placeholder:text-[#6D7E78] dark:placeholder:text-[#8FA29B] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 outline-none border-none min-h-[38px] max-h-[180px]"
      />

      <div className="mt-2 flex items-center justify-between pt-1 border-t border-[#DDE8DF] dark:border-[#2A3838]">
        <div className="flex items-center gap-1">
          {onAttach && (
            <button
              type="button"
              onClick={onAttach}
              className="rounded-lg p-2 text-[#6D7E78] dark:text-[#8FA29B] hover:bg-[#F5F3EC] dark:hover:bg-[#232D2D] hover:text-[#003F3F] dark:hover:text-[#B8FF4D] transition-colors"
              title="Attach academic resource or document"
            >
              <Paperclip className="h-4 w-4" />
            </button>
          )}
          {onVoice && (
            <button
              type="button"
              onClick={onVoice}
              className="rounded-lg p-2 text-[#6D7E78] dark:text-[#8FA29B] hover:bg-[#F5F3EC] dark:hover:bg-[#232D2D] hover:text-[#003F3F] dark:hover:text-[#B8FF4D] transition-colors"
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
              ? "bg-[#005A57] dark:bg-[#B8FF4D] text-[#B8FF4D] dark:text-[#003F3F] hover:bg-[#003F3F] dark:hover:bg-[#c7ff62] shadow-sm cursor-pointer"
              : "bg-[#DDE8DF] dark:bg-[#232D2D] text-[#6D7E78] dark:text-[#8FA29B] cursor-not-allowed"
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
    <div className="flex items-center gap-2.5 rounded-xl border border-[#005A57]/20 dark:border-[#2A3838] bg-[#E7EFE7] dark:bg-[#1C2323] px-3.5 py-2 text-xs text-[#005A57] dark:text-[#B8FF4D]">
      <div className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B8FF4D] opacity-75"></span>
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
    <div className="my-2 rounded-xl border border-[#DDE8DF] dark:border-[#2A3838] bg-[#FBFAF6] dark:bg-[#1C2323] overflow-hidden text-xs">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-[#6D7E78] dark:text-[#8FA29B] hover:bg-[#F5F3EC] dark:hover:bg-[#232D2D] transition-colors"
      >
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-[#005A57] dark:text-[#B8FF4D]" />
          <span>Thought process ({steps.length || 1} steps)</span>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {expanded && (
        <div className="p-3 pt-1 border-t border-[#DDE8DF] dark:border-[#2A3838] font-mono text-[11.5px] leading-relaxed text-[#102B2B] dark:text-[#DDE8DF] space-y-2">
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
    <div className="my-3 rounded-xl border border-[#005A57] dark:border-[#2A3838] bg-[#003F3F] dark:bg-[#181E1E] overflow-hidden text-[#FBFAF6] font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#002B2B] dark:bg-[#1C2323] border-b border-[#005A57]/40 dark:border-[#2A3838] text-[11px] text-[#DDE8DF]">
        <span className="uppercase font-semibold tracking-wider text-[#B8FF4D]">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-[#B8FF4D] transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#B8FF4D]" />
              <span className="text-[#B8FF4D]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed text-[#FBFAF6] dark:text-[#DDE8DF] font-mono">
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
    <div className="my-1.5 inline-flex items-center gap-2 rounded-lg border border-[#DDE8DF] dark:border-[#2A3838] bg-[#FBFAF6] dark:bg-[#1C2323] px-3 py-1.5 text-xs text-[#102B2B] dark:text-[#FBFAF6]">
      <Terminal className="h-3.5 w-3.5 text-[#005A57] dark:text-[#B8FF4D]" />
      <span className="font-mono text-[11px] font-semibold">{name}</span>
      {status === "running" && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
      {status === "completed" && <span className="h-2 w-2 rounded-full bg-[#B8FF4D]" />}
      {status === "failed" && <span className="h-2 w-2 rounded-full bg-rose-500" />}
      {details && <span className="text-[10px] text-[#6D7E78] dark:text-[#8FA29B] truncate max-w-[150px]">({details})</span>}
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
    <div className="my-2 flex items-center justify-between rounded-xl border border-[#005A57]/20 dark:border-[#2A3838] bg-[#E7EFE7] dark:bg-[#1C2323] p-2.5 text-xs">
      <div className="min-w-0 pr-2">
        <div className="flex items-center gap-1.5 font-medium text-[#102B2B] dark:text-[#FBFAF6]">
          <span className="rounded bg-[#005A57] text-[#B8FF4D] text-[9px] font-mono px-1.5 py-0.5 uppercase font-bold">
            {type}
          </span>
          <span className="truncate">{title}</span>
        </div>
        {detail && <p className="text-[11px] text-[#6D7E78] dark:text-[#8FA29B] truncate mt-0.5">{detail}</p>}
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
