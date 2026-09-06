/**
 * MarkdownRenderer — renders AI responses with full support for:
 *   - CommonMark + GitHub Flavored Markdown (tables, task lists, strikethrough)
 *   - LaTeX math — inline $...$ and block $$...$$
 *   - Syntax-highlighted code blocks
 *   - Streaming-safe: re-renders incrementally as content grows
 */
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

// KaTeX CSS — loaded once
import "katex/dist/katex.min.css";
// Highlight.js theme — matches the dark/light glass UI
import "highlight.js/styles/github.css";

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

const components: Components = {
  // ── Code ──────────────────────────────────────────────────────────
  code({ node, className, children, ...props }: any) {
    const inline = !className;
    const code = String(children).replace(/\n$/, "");
    if (inline) {
      return (
        <code
          className="px-1.5 py-0.5 bg-[#DDE8DF]/60 dark:bg-[#232D2D] text-[#005A57] dark:text-[#B8FF4D] font-mono text-[11px] rounded-md"
          {...props}
        >
          {children}
        </code>
      );
    }
    const lang = (className || "").replace("language-", "") || "code";
    return (
      <div className="relative group my-3 rounded-xl overflow-hidden border border-[#DDE8DF] dark:border-[#2A3838] shadow-sm">
        <div className="flex items-center justify-between px-4 py-1.5 bg-[#1C2323] text-[11px] font-mono text-[#8FA29B]">
          <span>{lang}</span>
        </div>
        <CopyButton code={code} />
        <pre className="overflow-x-auto p-4 bg-[#1C1C1C] text-sm leading-relaxed m-0">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  },

  // ── Headings ──────────────────────────────────────────────────────
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-[#102B2B] dark:text-[#FBFAF6] mt-5 mb-2 leading-snug">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-[#102B2B] dark:text-[#FBFAF6] mt-4 mb-2 leading-snug">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold text-[#102B2B] dark:text-[#FBFAF6] mt-3 mb-1.5">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-sm font-bold text-[#102B2B] dark:text-[#FBFAF6] mt-2 mb-1">
      {children}
    </h4>
  ),

  // ── Paragraph ─────────────────────────────────────────────────────
  p: ({ children }) => (
    <p className="text-sm leading-relaxed text-[#102B2B] dark:text-[#DDE8DF] mb-2 last:mb-0">
      {children}
    </p>
  ),

  // ── Lists ─────────────────────────────────────────────────────────
  ul: ({ children }) => (
    <ul className="my-2 space-y-1 pl-5 list-none">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 space-y-1 pl-5 list-decimal marker:text-[#005A57] dark:marker:text-[#B8FF4D]">
      {children}
    </ol>
  ),
  li: ({ children, ...props }: any) => (
    <li className="text-sm text-[#102B2B] dark:text-[#DDE8DF] leading-relaxed flex gap-2 items-start">
      <span className="mt-1.5 size-1.5 rounded-full bg-[#005A57] dark:bg-[#B8FF4D] shrink-0" />
      <span>{children}</span>
    </li>
  ),

  // ── Blockquote ────────────────────────────────────────────────────
  blockquote: ({ children }) => (
    <blockquote className="my-3 pl-4 border-l-4 border-[#005A57] dark:border-[#B8FF4D] bg-[#E7EFE7]/50 dark:bg-[#1C2323] rounded-r-xl py-2 pr-3 text-sm text-[#6D7E78] dark:text-[#DDE8DF] italic">
      {children}
    </blockquote>
  ),

  // ── Table ─────────────────────────────────────────────────────────
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-[#DDE8DF] dark:border-[#2A3838]">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#DDE8DF]/60 dark:bg-[#232D2D]">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2.5 text-left text-xs font-bold text-[#102B2B] dark:text-[#FBFAF6] uppercase tracking-wide border-b border-[#DDE8DF] dark:border-[#2A3838]">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2.5 text-sm text-[#102B2B] dark:text-[#DDE8DF] border-b border-[#DDE8DF]/50 dark:border-[#2A3838]/50 last:border-0">
      {children}
    </td>
  ),

  // ── Inline ────────────────────────────────────────────────────────
  strong: ({ children }) => (
    <strong className="font-bold text-[#102B2B] dark:text-[#FBFAF6]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="line-through text-[#6D7E78] dark:text-[#8FA29B]">{children}</del>
  ),
  hr: () => <hr className="my-4 border-[#DDE8DF] dark:border-[#2A3838]" />,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#005A57] dark:text-[#B8FF4D] underline underline-offset-2 hover:opacity-75 transition-opacity"
    >
      {children}
    </a>
  ),
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className || ""}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
