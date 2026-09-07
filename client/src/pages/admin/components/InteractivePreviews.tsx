import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Eye, EyeOff, RotateCcw, ChevronDown, ChevronRight, ChevronUp,
  Check, X, ArrowRight, ArrowLeft, Lightbulb, Lock, Unlock,
  Zap, Target, BookOpen, FileText, Clock, Star, AlertTriangle,
  Info, Sparkles, Play, Pause, SkipForward, Flag, Search,
  BarChart3, TrendingUp, Award, Timer, Brain, MessageSquare,
  CheckCircle2, Circle, Hash, Bookmark, ExternalLink, GraduationCap,
  Shield, Layers, Database, Cpu, GitBranch, Terminal, Server,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   SHARED HELPERS
   ═══════════════════════════════════════════════════════════ */

const fadeUp = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };
const fadeIn = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

function Badge({ children, color = "teal" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    teal: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    green: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>{children}</span>;
}

function ScoreBar({ value, max = 100, color = "teal" }: { value: number; max?: number; color?: string }) {
  const [animated, setAnimated] = useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80);
    return () => clearTimeout(t);
  }, [value]);
  const pct = (animated / max) * 100;
  const barColor = color === "teal" ? "bg-teal-dark dark:bg-accent-lime" : color === "amber" ? "bg-amber-500" : color === "red" ? "bg-red-500" : "bg-emerald-500";
  return (
    <div className="w-full h-2 bg-mist-green/50 dark:bg-[#2A3838] rounded-full overflow-hidden">
      <motion.div className={`h-full ${barColor} rounded-full`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   1. MULTIPLE CHOICE
   ═══════════════════════════════════════════════════════════ */
export function MultipleChoicePreview() {
  const [sel, setSel] = useState<number | null>(null);
  const options = ["Protein synthesis", "Energy production (ATP)", "Cellular division", "DNA replication"];
  const correct = 1;
  const done = sel !== null;
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">What is the main function of mitochondria?</p>
      <div className="space-y-2" role="radiogroup" aria-label="Answer options">
        {options.map((o, i) => {
          const isC = i === correct, isS = sel === i;
          return (
            <motion.button key={i} onClick={() => !done && setSel(i)} disabled={done}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm border-2 transition-all ${
                done && isS && isC ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" :
                done && isS && !isC ? "border-red-400 bg-red-50 dark:bg-red-900/20" :
                done && isC ? "border-emerald-500/40 bg-emerald-50/30" :
                "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] hover:border-teal-dark/40 cursor-pointer"
              }`}
              whileTap={!done ? { scale: 0.98 } : {}}>
              <div className={`size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                done && isC ? "border-emerald-500 bg-emerald-500" : done && isS ? "border-red-400 bg-red-400" :
                isS ? "border-teal-dark dark:border-accent-lime bg-teal-dark dark:bg-accent-lime" : "border-slate-300 dark:border-[#4A5A5A]"
              }`}>{(done && isC) || (isS && !done) ? <Check size={10} className="text-white" /> : null}</div>
              <span className="text-ink dark:text-cream-soft">{o}</span>
              {done && isC && <Check size={14} className="ml-auto text-emerald-500" />}
              {done && isS && !isC && <X size={14} className="ml-auto text-red-500" />}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>{done && (
        <motion.div {...fadeUp} className={`p-3 rounded-xl text-xs ${sel === correct ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
          {sel === correct ? "Correct! Mitochondria produce ATP through cellular respiration." : "Not quite — mitochondria are the powerhouse of the cell, producing ATP energy."}
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   2. SHORT ANSWER
   ═══════════════════════════════════════════════════════════ */
export function ShortAnswerPreview() {
  const [val, setVal] = useState("");
  const [done, setDone] = useState(false);
  const answer = "stack is thread-local and faster, heap is shared and managed by GC";
  const match = val.trim().toLowerCase().length > 15;
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">Explain the difference between stack and heap memory.</p>
      <textarea value={val} onChange={e => { setVal(e.target.value); setDone(false); }} placeholder="Type your explanation..." rows={4}
        className="w-full px-4 py-3 rounded-xl border border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-sm text-ink dark:text-cream-soft placeholder:text-grey-green dark:placeholder:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime resize-none transition" />
      <div className="flex items-center gap-3">
        <motion.button onClick={() => setDone(true)} disabled={!val.trim()} whileTap={{ scale: 0.97 }}
          className="px-5 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-2">
          <Check size={14} /> Submit
        </motion.button>
        <span className="text-[11px] text-grey-green dark:text-[#8FA29B]">{val.length} characters</span>
      </div>
      <AnimatePresence>{done && (
        <motion.div {...fadeUp} className="space-y-3">
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-ink dark:text-cream-soft"><Brain size={14} className="text-teal-dark dark:text-accent-lime" /> Evaluation</div>
            <div className="flex items-center gap-3 text-[11px]"><span className="text-grey-green dark:text-[#8FA29B]">Understanding</span><ScoreBar value={match ? 78 : 35} /><span className="font-bold text-ink dark:text-cream-soft">{match ? "78%" : "35%"}</span></div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
            <div className="font-semibold">Strong points:</div>
            <div>✓ Core distinction identified</div>
          </div>
          {!match && <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
            <div className="font-semibold">Needs attention:</div>
            <div>→ Consider explaining scope and lifetime differences</div>
          </div>}
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   3. TRUE / FALSE
   ═══════════════════════════════════════════════════════════ */
export function TrueFalsePreview() {
  const [ans, setAns] = useState<"t" | "f" | null>(null);
  const isT = true;
  const done = ans !== null;
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <Badge color="teal">Rapid Check</Badge>
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">Java interfaces can contain private helper methods since Java 9.</p>
      <div className="grid grid-cols-2 gap-3">
        {(["t", "f"] as const).map(v => (
          <motion.button key={v} onClick={() => !done && setAns(v)} disabled={done}
            className={`py-3.5 rounded-xl text-sm font-bold border-2 transition-all ${
              done && ans === v && ((v === "t" && isT) || (v === "f" && !isT))
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                : done && ans === v ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600" :
                done ? "border-mist-green/40 dark:border-[#2A3838]/40 bg-cream-light/50 dark:bg-[#232D2D]/50 text-grey-green/60" :
                "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-ink dark:text-cream-soft hover:border-teal-dark/50 cursor-pointer"
            }`} whileTap={!done ? { scale: 0.96 } : {}}>
            {v === "t" ? "TRUE ✓" : "FALSE"}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>{done && (
        <motion.div {...fadeUp} className={`p-3 rounded-xl text-xs ${ans === "t" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"}`}>
          {ans === "t" ? "Correct! Private interface methods were added in Java 9 (JEP 213)." : "Incorrect — private methods in interfaces were introduced in Java 9."}
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   4. FILL IN THE BLANK
   ═══════════════════════════════════════════════════════════ */
export function FillBlankPreview() {
  const [val, setVal] = useState("");
  const [done, setDone] = useState(false);
  const answer = "polymorphism";
  const isC = val.trim().toLowerCase() === answer;
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <p className="text-sm text-ink dark:text-cream-soft leading-relaxed">
        In object-oriented programming, <strong className="text-teal-dark dark:text-accent-lime">polymorphism</strong> allows a single interface to represent different underlying forms — enabling dynamic method dispatch at runtime.
      </p>
      <div className="p-4 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838]">
        <p className="text-xs text-grey-green dark:text-[#8FA29B] mb-2">Complete the sentence:</p>
        <p className="text-sm text-ink dark:text-cream-soft">
          The principle that allows objects of different types to be treated through a single interface is called{" "}
          <input ref={inputRef} type="text" value={val} onChange={e => { setVal(e.target.value); setDone(false); }}
            onKeyDown={e => e.key === "Enter" && val.trim() && setDone(true)}
            placeholder="______" autoFocus
            className={`inline-block w-36 px-2 py-0.5 rounded-lg border-b-2 bg-transparent text-sm font-semibold text-ink dark:text-cream-soft placeholder:text-grey-green/40 focus:outline-none transition ${
              done ? (isC ? "border-emerald-500" : "border-red-400") : "border-teal-dark dark:border-accent-lime"
            }`} />.
        </p>
      </div>
      <div className="flex gap-2 items-center">
        <motion.button onClick={() => setDone(true)} disabled={!val.trim()} whileTap={{ scale: 0.97 }}
          className="px-4 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-1.5">
          <Check size={14} /> Check
        </motion.button>
        {done && (
          <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
            className={`text-xs font-semibold ${isC ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {isC ? "✓ Correct!" : `✗ Answer: ${answer}`}
          </motion.span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   5. MATCHING
   ═══════════════════════════════════════════════════════════ */
export function MatchingPreview() {
  const [selL, setSelL] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const left = ["Photosynthesis", "Mitochondria", "Ribosome", "Nucleus"];
  const right = ["Produces glucose from light", "Generates ATP energy", "Synthesizes proteins", "Stores DNA instructions"];
  const correct: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3 };
  const handleR = (ri: number) => { if (selL === null) return; setMatches(p => ({ ...p, [selL]: ri })); setSelL(null); };
  const matched = (li: number) => li in matches;
  const allDone = Object.keys(matches).length === left.length;
  return (
    <div className="w-full max-w-[520px] mx-auto space-y-4">
      <p className="text-xs font-semibold text-ink dark:text-cream-soft">Match each organelle with its function:</p>
      <div className="grid grid-cols-[1fr_1fr] gap-3">
        <div className="space-y-2">{left.map((l, li) => (
          <motion.button key={li} onClick={() => !matched(li) && setSelL(li)}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all text-left ${
              selL === li ? "border-teal-dark dark:border-accent-lime bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime" :
              matched(li) ? (matches[li] === correct[li] ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" : "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600") :
              "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-ink dark:text-cream-soft hover:border-teal-dark/40 cursor-pointer"
            }`} whileTap={!matched(li) ? { scale: 0.97 } : {}}>
            {l}
          </motion.button>
        ))}</div>
        <div className="space-y-2">{right.map((r, ri) => {
          const mb = Object.entries(matches).find(([, v]) => v === ri)?.[0];
          return (
            <motion.button key={ri} onClick={() => handleR(ri)}
              className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all text-left ${
                mb !== undefined ? (Number(mb) === correct[Number(mb)] ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" : "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600") :
                "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-grey-green dark:text-[#8FA29B] hover:border-teal-dark/40 cursor-pointer"
              }`} whileTap={{ scale: 0.97 }}>
              {r}
            </motion.button>
          );
        })}</div>
      </div>
      <AnimatePresence>{allDone && (
        <motion.div {...fadeUp} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} /> All matches correct!
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   6. ORDERING (drag & drop)
   ═══════════════════════════════════════════════════════════ */
export function OrderingPreview() {
  const [items, setItems] = useState(["Write source code (.java)", "Compile to bytecode (.class)", "Load via ClassLoader", "Verify bytecode integrity", "Execute on JVM"]);
  const [done, setDone] = useState(false);
  const correct = ["Write source code (.java)", "Compile to bytecode (.class)", "Verify bytecode integrity", "Load via ClassLoader", "Execute on JVM"];
  return (
    <div className="w-full max-w-[440px] mx-auto space-y-4">
      <p className="text-xs font-semibold text-ink dark:text-cream-soft">Drag to arrange the Java compilation pipeline in correct order:</p>
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-2">
        {items.map((item, i) => (
          <Reorder.Item key={item} value={item}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-xs font-medium cursor-grab active:cursor-grabbing transition-all ${
              done ? (item === correct[i] ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" : "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600") :
              "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-ink dark:text-cream-soft"
            }`}
            whileDrag={{ scale: 1.03, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 50 }}>
            <GripVertical size={14} className="text-grey-green dark:text-[#8FA29B] shrink-0" />
            <span className="size-6 rounded-full bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <span className="flex-1">{item}</span>
            {done && (item === correct[i] ? <Check size={14} className="text-emerald-500" /> : <X size={14} className="text-red-500" />)}
          </Reorder.Item>
        ))}
      </Reorder.Group>
      {!done && <motion.button onClick={() => setDone(true)} whileTap={{ scale: 0.98 }}
        className="w-full py-2.5 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold cursor-pointer flex items-center justify-center gap-2"><Check size={14} /> Check Order</motion.button>}
      <AnimatePresence>{done && (
        <motion.div {...fadeUp} className="flex gap-2">
          <motion.button onClick={() => { setDone(false); }} whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] text-xs font-semibold text-ink dark:text-cream-soft cursor-pointer flex items-center gap-1.5"><RotateCcw size={12} /> Try Again</motion.button>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            {items.filter((item, i) => item === correct[i]).length}/{correct.length} correct
          </span>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

function GripVertical({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="5" r="1" /><circle cx="15" cy="5" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="19" r="1" /><circle cx="15" cy="19" r="1" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════
   7. CATEGORIZATION
   ═══════════════════════════════════════════════════════════ */
export function CategorizationPreview() {
  const [placed, setPlaced] = useState<Record<string, string | null>>({});
  const items = ["Array", "Linked List", "Binary Tree", "Hash Map", "Stack", "Graph"];
  const buckets = ["Linear", "Non-Linear"];
  const map: Record<string, string> = { "Array": "Linear", "Linked List": "Linear", "Stack": "Linear", "Binary Tree": "Non-Linear", "Hash Map": "Non-Linear", "Graph": "Non-Linear" };
  const place = (item: string, bucket: string) => setPlaced(p => ({ ...p, [item]: bucket }));
  const allPlaced = items.every(i => placed[i]);
  return (
    <div className="w-full max-w-[520px] mx-auto space-y-4">
      <p className="text-xs font-semibold text-ink dark:text-cream-soft">Categorize each data structure:</p>
      <div className="flex flex-wrap gap-2">{items.map(item => (
        <motion.button key={item} onClick={() => !placed[item] && setPlaced(p => ({ ...p, [item]: null }))}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border-2 transition-all cursor-pointer ${
            placed[item] === map[item] ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" :
            placed[item] ? "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600" :
            placed[item] === null ? "border-teal-dark dark:border-accent-lime bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime" :
            "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-grey-green dark:text-[#8FA29B] hover:border-teal-dark/40"
          }`} whileTap={{ scale: 0.95 }}>
          {item}{placed[item] ? ` → ${placed[item]}` : ""}
        </motion.button>
      ))}</div>
      <div className="grid grid-cols-2 gap-3">{buckets.map(b => (
        <button key={b} onClick={() => { const unplaced = items.find(i => placed[i] === null); if (unplaced) place(unplaced, b); }}
          className="py-3 rounded-xl border-2 border-dashed border-mist-green dark:border-[#2A3838] text-xs font-semibold text-grey-green dark:text-[#8FA29B] hover:border-teal-dark/50 hover:text-teal-dark dark:hover:text-accent-lime transition-all cursor-pointer text-center">
          {b}
        </button>
      ))}</div>
      <AnimatePresence>{allPlaced && (
        <motion.div {...fadeUp} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <CheckCircle2 size={14} /> All items categorized!
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   8. TEACH BACK
   ═══════════════════════════════════════════════════════════ */
export function TeachBackPreview() {
  const [val, setVal] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <div className="flex items-center gap-2"><Badge color="purple">Feynman Method</Badge></div>
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">How would you explain recursion to a 10-year-old without technical jargon?</p>
      <textarea value={val} onChange={e => { setVal(e.target.value); setDone(false); }} placeholder="I think recursion is like..." rows={4}
        className="w-full px-4 py-3 rounded-xl border border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-sm text-ink dark:text-cream-soft placeholder:text-grey-green dark:placeholder:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime resize-none transition" />
      <div className="flex items-center gap-3">
        <motion.button onClick={() => setDone(true)} disabled={!val.trim()} whileTap={{ scale: 0.97 }}
          className="px-5 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-2"><MessageSquare size={14} /> Submit Teaching</motion.button>
        <span className="text-[11px] text-grey-green dark:text-[#8FA29B]">{val.length} characters</span>
      </div>
      <AnimatePresence>{done && (
        <motion.div {...fadeUp} className="p-4 rounded-xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink dark:text-cream-soft"><Brain size={14} className="text-teal-dark dark:text-accent-lime" /> Teaching Evaluation</div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[11px]"><span className="text-grey-green dark:text-[#8FA29B] w-24">Understanding</span><ScoreBar value={val.length > 50 ? 82 : 45} /><span className="font-bold text-ink dark:text-cream-soft">{val.length > 50 ? "82%" : "45%"}</span></div>
          </div>
          <div className="pt-2 border-t border-mist-green dark:border-[#2A3838] text-[11px] space-y-1">
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Core relationship identified</div>
            {val.length < 50 && <div className="text-amber-600 dark:text-amber-400">→ Consider adding a concrete analogy</div>}
          </div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   9. CONFIDENCE CHECK
   ═══════════════════════════════════════════════════════════ */
export function ConfidenceCheckPreview() {
  const [level, setLevel] = useState<number | null>(null);
  const levels = [
    { label: "Guessing", emoji: "😕", color: "bg-red-50 dark:bg-red-900/20 border-red-300 text-red-600" },
    { label: "Unsure", emoji: "😐", color: "bg-slate-50 dark:bg-slate-800 border-slate-300 text-slate-600" },
    { label: "Okay", emoji: "🙂", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-300 text-blue-600" },
    { label: "Confident", emoji: "😄", color: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 text-emerald-600" },
    { label: "Very Sure", emoji: "🤩", color: "bg-teal-dark/10 dark:bg-accent-lime/10 border-teal-dark/30 dark:border-accent-lime/30 text-teal-dark dark:text-accent-lime" },
  ];
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">How confident do you feel about Big-O complexity analysis?</p>
      <div className="grid grid-cols-5 gap-2">{levels.map((l, i) => (
        <motion.button key={i} onClick={() => setLevel(i)}
          className={`py-3 rounded-xl border-2 text-center transition-all cursor-pointer ${level === i ? l.color + " ring-2 ring-offset-1" : "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-grey-green dark:text-[#8FA29B]"}`}
          whileTap={{ scale: 0.95 }}>
          <div className="text-xl mb-0.5">{l.emoji}</div>
          <div className="text-[9px] font-semibold">{l.label}</div>
        </motion.button>
      ))}</div>
      <AnimatePresence>{level !== null && (
        <motion.div {...fadeUp} className="p-3 rounded-xl bg-teal-dark/5 dark:bg-accent-lime/5 border border-teal-dark/20 dark:border-accent-lime/20 text-xs text-ink dark:text-cream-soft">
          Your confidence: <strong className="text-teal-dark dark:text-accent-lime">{levels[level].label}</strong> — Summa will adjust your practice intensity accordingly.
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   10. SCENARIO
   ═══════════════════════════════════════════════════════════ */
export function ScenarioPreview() {
  const [choice, setChoice] = useState<number | null>(null);
  const options = [
    "Restart the server immediately",
    "Check server logs and metrics first",
    "Send an all-hands email",
    "Deploy a hotfix without testing",
  ];
  const correct = 1;
  return (
    <div className="w-full max-w-[520px] mx-auto space-y-4">
      <Badge color="amber">Case Study #7</Badge>
      <div className="p-4 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] space-y-2">
        <p className="text-xs font-semibold text-ink dark:text-cream-soft">Context:</p>
        <p className="text-sm text-ink dark:text-cream-soft leading-relaxed">Your production API returns HTTP 503 for 30% of users. Response times spiked from 200ms to 12s. The on-call rotation pinged you at 2 AM.</p>
      </div>
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">What do you do first?</p>
      <div className="space-y-2">{options.map((o, i) => (
        <motion.button key={i} onClick={() => choice === null && setChoice(i)} disabled={choice !== null}
          className={`w-full text-left px-4 py-3 rounded-xl text-xs font-medium border-2 transition-all ${
            choice !== null && i === correct ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" :
            choice === i && i !== correct ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600" :
            "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-ink dark:text-cream-soft hover:border-teal-dark/40 cursor-pointer"
          }`} whileTap={choice === null ? { scale: 0.98 } : {}}>
          {o}
        </motion.button>
      ))}</div>
      <AnimatePresence>{choice !== null && (
        <motion.div {...fadeUp} className={`p-3 rounded-xl text-xs ${choice === correct ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}>
          {choice === correct ? "Correct! Diagnose before acting — check logs, metrics, and recent deployments." : "Not the best first step — always diagnose before acting."}
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   11. EXPLANATION CARD
   ═══════════════════════════════════════════════════════════ */
export function ExplanationCardPreview() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <Badge color="teal">Core Concept</Badge>
      <h3 className="text-sm font-bold text-ink dark:text-cream-soft">Dynamic Method Dispatch in Java</h3>
      <p className="text-xs text-grey-green dark:text-[#8FA29B] leading-relaxed">When you call a method on an object, Java determines which implementation to execute based on the <strong>actual object type</strong>, not the reference type.</p>
      <motion.button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs font-semibold text-teal-dark dark:text-accent-lime cursor-pointer" whileTap={{ scale: 0.98 }}>
        <motion.div animate={{ rotate: expanded ? 90 : 0 }}><ChevronRight size={14} /></motion.div>
        {expanded ? "Hide" : "Show"} deep dive
      </motion.button>
      <AnimatePresence>{expanded && (
        <motion.div {...fadeUp} className="p-4 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] text-xs text-ink dark:text-cream-soft leading-relaxed space-y-2">
          <p>This is possible because Java objects carry runtime type information (RTTI). The JVM uses the actual class of the object — not the declared variable type — to resolve method calls.</p>
          <p className="text-grey-green dark:text-[#8FA29B]">This enables polymorphism: a <code className="px-1 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded text-teal-dark dark:text-accent-lime">List&lt;Animal&gt;</code> can hold <code className="px-1 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded text-teal-dark dark:text-accent-lime">Dog</code> and <code className="px-1 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded text-teal-dark dark:text-accent-lime">Cat</code> objects, and each responds to <code className="px-1 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded text-teal-dark dark:text-accent-lime">speak()</code> differently.</p>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   12. WORKED EXAMPLE
   ═══════════════════════════════════════════════════════════ */
export function WorkedExamplePreview() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Identify known values", content: "mass (m) = 5 kg, acceleration (a) = 3 m/s²" },
    { label: "Choose formula", content: "F = m × a" },
    { label: "Substitute values", content: "F = 5 × 3" },
    { label: "Calculate result", content: "F = 15 N" },
  ];
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <p className="text-xs font-semibold text-ink dark:text-cream-soft">Problem: Calculate the force needed to accelerate a 5 kg object at 3 m/s².</p>
      <div className="space-y-0">
        {steps.map((s, i) => (
          <motion.div key={i} className="flex items-start gap-3" initial={false}>
            <div className="flex flex-col items-center">
              <motion.div className={`size-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                i <= step ? "bg-teal-dark dark:bg-accent-lime text-white dark:text-ink border-teal-dark dark:border-accent-lime" : "bg-cream-light dark:bg-[#232D2D] text-grey-green border-mist-green dark:border-[#2A3838]"
              }`} animate={i === step ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 0.3 }}>
                {i < step ? <Check size={14} /> : i + 1}
              </motion.div>
              {i < steps.length - 1 && <div className={`w-0.5 h-8 transition-colors ${i < step ? "bg-teal-dark dark:bg-accent-lime" : "bg-mist-green dark:bg-[#2A3838]"}`} />}
            </div>
            <div className="pt-1 flex-1">
              <div className={`text-xs font-semibold ${i <= step ? "text-ink dark:text-cream-soft" : "text-grey-green dark:text-[#8FA29B]"}`}>{s.label}</div>
              <AnimatePresence>{i <= step && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }}
                  className="text-sm font-mono text-teal-dark dark:text-accent-lime mt-1 font-semibold">{s.content}</motion.div>
              )}</AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="flex gap-2">
        {step > 0 && <motion.button onClick={() => setStep(s => s - 1)} whileTap={{ scale: 0.97 }} className="px-4 py-2 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] text-xs font-semibold text-ink dark:text-cream-soft cursor-pointer flex items-center gap-1"><ArrowLeft size={12} /> Previous</motion.button>}
        {step < steps.length - 1 && <motion.button onClick={() => setStep(s => s + 1)} whileTap={{ scale: 0.97 }} className="px-4 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold cursor-pointer flex items-center gap-1">Next Step <ArrowRight size={12} /></motion.button>}
        {step === steps.length - 1 && <motion.div {...fadeUp} className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5"><CheckCircle2 size={14} /> Answer: 15 N</motion.div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   13. HINT LADDER
   ═══════════════════════════════════════════════════════════ */
export function HintLadderPreview() {
  const [revealed, setRevealed] = useState(0);
  const hints = [
    "What condition causes the recursion to stop?",
    "Think about the base case — when n reaches 0 or 1.",
    "The base case returns 1, and each recursive call multiplies n × (n-1)!",
  ];
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">Write a recursive function to calculate n! (factorial).</p>
      <div className="space-y-2">
        {hints.map((h, i) => (
          <div key={i}>
            {i < revealed ? (
              <motion.div {...fadeUp} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <Lightbulb size={14} className="shrink-0 mt-0.5" /> {h}
              </motion.div>
            ) : i === revealed ? (
              <motion.button onClick={() => setRevealed(r => r + 1)} whileTap={{ scale: 0.98 }}
                className="w-full p-3 rounded-xl border-2 border-dashed border-mist-green dark:border-[#2A3838] text-xs font-semibold text-grey-green dark:text-[#8FA29B] hover:border-amber-400 hover:text-amber-600 transition-all cursor-pointer flex items-center gap-2">
                <Lock size={12} /> Hint {i + 1} — tap to reveal
              </motion.button>
            ) : (
              <div className="p-3 rounded-xl border border-mist-green/40 dark:border-[#2A3838]/40 text-xs text-grey-green/40 flex items-center gap-2"><Lock size={12} /> Hint {i + 1}</div>
            )}
          </div>
        ))}
      </div>
      {revealed >= hints.length && (
        <motion.div {...fadeUp} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <Sparkles size={14} /> All hints revealed — try solving it now!
        </motion.div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   14. CONCEPT BREAKDOWN
   ═══════════════════════════════════════════════════════════ */
export function ConceptBreakdownPreview() {
  const [open, setOpen] = useState<number | null>(0);
  const concepts = [
    { title: "B-Trees", desc: "Self-balancing tree data structure that maintains sorted data. Used in databases for efficient disk reads.", icon: <Layers size={14} /> },
    { title: "Hash Tables", desc: "Key-value mapping using hash functions for O(1) average lookup. Handles collisions via chaining or open addressing.", icon: <Database size={14} /> },
    { title: "Scan Overhead", desc: "Full table scans occur when no index exists. Cost grows linearly with table size O(n).", icon: <Search size={14} /> },
    { title: "Write Cost", desc: "Indexes speed up reads but slow down writes because each insert must update the index structure.", icon: <TrendingUp size={14} /> },
  ];
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-3">
      <p className="text-xs font-semibold text-ink dark:text-cream-soft">Database Indexing — tap each concept to explore:</p>
      {concepts.map((c, i) => (
        <div key={i}>
          <motion.button onClick={() => setOpen(open === i ? null : i)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
              open === i ? "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime" : "bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft hover:bg-mist-green/30"
            }`}>
            <span className="shrink-0">{c.icon}</span>
            <span className="flex-1">{c.title}</span>
            <motion.div animate={{ rotate: open === i ? 180 : 0 }}><ChevronDown size={14} /></motion.div>
          </motion.button>
          <AnimatePresence>{open === i && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <p className="px-10 py-2 text-[11px] text-grey-green dark:text-[#8FA29B] leading-relaxed">{c.desc}</p>
            </motion.div>
          )}</AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   15. COMPARE & CONTRAST
   ═══════════════════════════════════════════════════════════ */
export function CompareContrastPreview() {
  return (
    <div className="w-full max-w-[520px] mx-auto space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-teal-dark/5 dark:bg-accent-lime/5 border border-teal-dark/20 dark:border-accent-lime/20 space-y-2">
          <h4 className="text-xs font-bold text-teal-dark dark:text-accent-lime">Process</h4>
          <ul className="space-y-1.5 text-[11px] text-ink dark:text-cream-soft">
            <li className="flex items-start gap-1.5"><Check size={10} className="text-emerald-500 mt-0.5 shrink-0" /> Own memory space</li>
            <li className="flex items-start gap-1.5"><Check size={10} className="text-emerald-500 mt-0.5 shrink-0" /> Heavyweight creation</li>
            <li className="flex items-start gap-1.5"><Check size={10} className="text-emerald-500 mt-0.5 shrink-0" /> Context switching cost</li>
            <li className="flex items-start gap-1.5"><Check size={10} className="text-emerald-500 mt-0.5 shrink-0" /> Crash isolation</li>
          </ul>
        </div>
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 space-y-2">
          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400">Thread</h4>
          <ul className="space-y-1.5 text-[11px] text-ink dark:text-cream-soft">
            <li className="flex items-start gap-1.5"><Check size={10} className="text-emerald-500 mt-0.5 shrink-0" /> Shared memory space</li>
            <li className="flex items-start gap-1.5"><Check size={10} className="text-emerald-500 mt-0.5 shrink-0" /> Lightweight creation</li>
            <li className="flex items-start gap-1.5"><Check size={10} className="text-emerald-500 mt-0.5 shrink-0" /> Low overhead switching</li>
            <li className="flex items-start gap-1.5"><X size={10} className="text-red-400 mt-0.5 shrink-0" /> Shared crash risk</li>
          </ul>
        </div>
      </div>
      <div className="p-3 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838]">
        <p className="text-[11px] text-ink dark:text-cream-soft"><strong className="text-teal-dark dark:text-accent-lime">Key insight:</strong> Use processes for isolation, threads for performance within a single application.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   16. ANALOGY CARD
   ═══════════════════════════════════════════════════════════ */
export function AnalogyCardPreview() {
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <Badge color="blue">Analogy</Badge>
      <div className="p-4 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] space-y-3">
        <p className="text-[10px] font-bold text-grey-green dark:text-[#8FA29B] uppercase tracking-wider">Abstract Concept</p>
        <p className="text-sm font-semibold text-ink dark:text-cream-soft">RAM vs Hard Drive</p>
        <div className="flex items-center gap-2 text-grey-green dark:text-[#8FA29B]"><div className="flex-1 h-px bg-mist-green dark:bg-[#2A3838]" /><span className="text-[10px]">Think of it like...</span><div className="flex-1 h-px bg-mist-green dark:bg-[#2A3838]" /></div>
        <div className="p-3 rounded-xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] space-y-1">
          <p className="text-sm text-ink dark:text-cream-soft">🖥️ Your <strong>desk</strong> is RAM — fast to reach, limited space.</p>
          <p className="text-sm text-ink dark:text-cream-soft">🗄️ The <strong>filing cabinet</strong> is storage — slow but massive.</p>
        </div>
        <p className="text-[11px] text-grey-green dark:text-[#8FA29B] leading-relaxed">When your desk is full, you move files to the cabinet. When you need them, you walk over and retrieve them. The walk takes time — that's disk I/O latency.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   17. COMMON MISTAKE
   ═══════════════════════════════════════════════════════════ */
export function CommonMistakePreview() {
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-3">
      <Badge color="amber">Common Mistake</Badge>
      <div className="p-4 rounded-xl border-2 border-red-200 dark:border-red-800/30 bg-red-50 dark:bg-red-900/10 space-y-2">
        <div className="flex items-center gap-2"><X size={16} className="text-red-500" /><span className="text-xs font-bold text-red-600 dark:text-red-400">Misconception</span></div>
        <p className="text-sm text-red-700 dark:text-red-300 line-through">"Method overloading happens at runtime through dynamic dispatch."</p>
      </div>
      <div className="p-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/10 space-y-2">
        <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /><span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Correct Understanding</span></div>
        <p className="text-sm text-emerald-700 dark:text-emerald-300">Method overloading is resolved at <strong>compile-time</strong> based on method signature. It's method overriding that happens at runtime.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   18. WHY IT WORKS
   ═══════════════════════════════════════════════════════════ */
export function WhyItWorksPreview() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <Badge color="teal">First Principles</Badge>
      <h3 className="text-sm font-bold text-ink dark:text-cream-soft">Why is Binary Search O(log n)?</h3>
      <div className="p-4 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] space-y-2">
        <p className="text-xs text-ink dark:text-cream-soft leading-relaxed">Each comparison <strong>cuts the remaining search space in half</strong>. Starting with n elements:</p>
        <div className="font-mono text-xs text-teal-dark dark:text-accent-lime bg-white dark:bg-[#1C2323] px-3 py-2 rounded-lg">
          n → n/2 → n/4 → n/8 → ... → 1
        </div>
        <p className="text-xs text-grey-green dark:text-[#8FA29B]">The number of halvings needed is log₂(n).</p>
      </div>
      <motion.button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1.5 text-xs font-semibold text-teal-dark dark:text-accent-lime cursor-pointer">
        <motion.div animate={{ rotate: expanded ? 90 : 0 }}><ChevronRight size={14} /></motion.div>
        {expanded ? "Hide" : "Show"} why this matters
      </motion.button>
      <AnimatePresence>{expanded && (
        <motion.div {...fadeUp} className="p-3 rounded-xl bg-teal-dark/5 dark:bg-accent-lime/5 text-xs text-ink dark:text-cream-soft leading-relaxed">
          <p>For n = 1,000,000: linear search needs up to 1,000,000 comparisons. Binary search needs at most <strong>20</strong>. That's the power of logarithmic growth.</p>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   19. RECALL PROMPT
   ═══════════════════════════════════════════════════════════ */
export function RecallPromptPreview() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <Badge color="purple">Closed-Book Recall</Badge>
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">Without looking at your notes, state the 3 ACID properties in database transactions.</p>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.button key="reveal" onClick={() => setRevealed(true)} whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] text-xs font-semibold text-ink dark:text-cream-soft hover:bg-mist-green/30 transition cursor-pointer flex items-center justify-center gap-2">
            <Eye size={14} /> Reveal Answer
          </motion.button>
        ) : (
          <motion.div key="answer" {...fadeUp} className="p-4 rounded-xl bg-teal-dark/5 dark:bg-accent-lime/5 border border-teal-dark/20 dark:border-accent-lime/20 space-y-2">
            <div className="space-y-1.5 text-xs text-ink dark:text-cream-soft">
              <p><strong className="text-teal-dark dark:text-accent-lime">A</strong>tomicity — transactions are all-or-nothing</p>
              <p><strong className="text-teal-dark dark:text-accent-lime">C</strong>onsistency — database moves from one valid state to another</p>
              <p><strong className="text-teal-dark dark:text-accent-lime">I</strong>solation — concurrent transactions don't interfere</p>
              <p><strong className="text-teal-dark dark:text-accent-lime">D</strong>urability — committed data survives system failures</p>
            </div>
            <div className="pt-2 flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold flex items-center gap-1"><Check size={10} /> Got it right</button>
              <button className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold flex items-center gap-1"><RotateCcw size={10} /> Needs review</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   20. SPACED REVIEW
   ═══════════════════════════════════════════════════════════ */
export function SpacedReviewPreview() {
  const [reviewed, setReviewed] = useState(false);
  return (
    <div className="w-full max-w-[440px] mx-auto space-y-4">
      <Badge color="amber">Due for Review</Badge>
      <div className="p-4 rounded-xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-ink dark:text-cream-soft">SQL: GROUP BY vs HAVING</h4>
          <span className="text-[10px] text-grey-green dark:text-[#8FA29B] font-mono">3 days ago</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-grey-green dark:text-[#8FA29B]">
          <span>Interval: <strong className="text-ink dark:text-cream-soft">6 days</strong></span>
          <span>Strength: <strong className="text-amber-600">Medium</strong></span>
        </div>
        <ScoreBar value={55} color="amber" />
        {!reviewed ? (
          <motion.button onClick={() => setReviewed(true)} whileTap={{ scale: 0.98 }}
            className="w-full py-2.5 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
            <RotateCcw size={14} /> Start Review
          </motion.button>
        ) : (
          <motion.div {...fadeUp} className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 size={14} /> Review recorded! Next review in 10 days.
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   21. RAPID RECALL
   ═══════════════════════════════════════════════════════════ */
export function RapidRecallPreview() {
  const [qi, setQi] = useState(0);
  const [timer, setTimer] = useState(15);
  const [done, setDone] = useState<number | null>(null);
  const questions = [
    { q: "Default value of boolean in Java?", a: "false", opts: ["true", "false", "null", "0"] },
    { q: "Size of int in Java?", a: "4 bytes", opts: ["2 bytes", "4 bytes", "8 bytes", "1 byte"] },
    { q: "Which keyword prevents inheritance?", a: "final", opts: ["static", "final", "private", "abstract"] },
  ];
  const cq = questions[qi];
  React.useEffect(() => { if (timer > 0 && done === null) { const t = setTimeout(() => setTimer(timer - 1), 1000); return () => clearTimeout(t); } }, [timer, done]);
  return (
    <div className="w-full max-w-[440px] mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Badge color="red">Speed Round</Badge>
        <div className="flex items-center gap-1.5 text-xs font-mono text-amber-600 dark:text-amber-400"><Timer size={12} /> {timer}s</div>
      </div>
      <div className="text-[10px] text-grey-green dark:text-[#8FA29B] font-mono">{qi + 1} / {questions.length}</div>
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">{cq.q}</p>
      <div className="grid grid-cols-2 gap-2">{cq.opts.map((o, i) => (
        <motion.button key={i} onClick={() => done === null && setDone(i)} disabled={done !== null}
          className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${
            done !== null && cq.opts[i] === cq.a ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700" :
            done === i ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600" :
            "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-ink dark:text-cream-soft hover:border-teal-dark/40 cursor-pointer"
          }`} whileTap={done === null ? { scale: 0.96 } : {}}>
          {o}
        </motion.button>
      ))}</div>
      <AnimatePresence>{done !== null && (
        <motion.div {...fadeUp} className="flex gap-2">
          {qi < questions.length - 1 ? (
            <motion.button onClick={() => { setQi(qi + 1); setDone(null); setTimer(15); }} whileTap={{ scale: 0.97 }}
              className="px-4 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold cursor-pointer flex items-center gap-1">Next <SkipForward size={12} /></motion.button>
          ) : (
            <motion.div {...fadeUp} className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5"><CheckCircle2 size={14} /> Round complete!</motion.div>
          )}
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   22. RETRIEVAL GRID
   ═══════════════════════════════════════════════════════════ */
export function RetrievalGridPreview() {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const cells = [
    { term: "Encapsulation", def: "Bundling data + methods, hiding internals" },
    { term: "Inheritance", def: "Creating new classes from existing ones" },
    { term: "Polymorphism", def: "One interface, multiple implementations" },
    { term: "Abstraction", def: "Hiding complexity, showing essential features" },
  ];
  return (
    <div className="w-full max-w-[440px] mx-auto space-y-3">
      <Badge color="purple">Matrix Memory Check</Badge>
      <div className="grid grid-cols-2 gap-3">
        {cells.map((c, i) => (
          <motion.button key={i} onClick={() => setFlipped(p => ({ ...p, [i]: !p[i] }))}
            className="relative h-[100px] rounded-xl text-left cursor-pointer"
            style={{ perspective: "600px" }}
            whileTap={{ scale: 0.97 }}>
            <motion.div className="absolute inset-0 rounded-xl p-3 flex flex-col justify-center" style={{ backfaceVisibility: "hidden", transformStyle: "preserve-3d" }}
              animate={{ rotateY: flipped[i] ? 180 : 0 }} transition={{ duration: 0.4 }}>
              <div className={`absolute inset-0 rounded-xl border-2 ${flipped[i] ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323]"}`} />
              <div className="relative z-10 p-1">
                {flipped[i] ? <p className="text-[11px] text-emerald-700 dark:text-emerald-300">{c.def}</p> : <p className="text-xs font-bold text-ink dark:text-cream-soft">{c.term}</p>}
              </div>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   23. MEMORY CHECK
   ═══════════════════════════════════════════════════════════ */
export function MemoryCheckPreview() {
  const [val, setVal] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div className="w-full max-w-[480px] mx-auto space-y-4">
      <Badge color="amber">Yesterday's Recap</Badge>
      <p className="text-sm font-semibold text-ink dark:text-cream-soft">Summarize 2 key takeaways from yesterday's lesson on Object-Oriented Design.</p>
      <textarea value={val} onChange={e => { setVal(e.target.value); setDone(false); }} placeholder="What do you remember..." rows={3}
        className="w-full px-4 py-3 rounded-xl border border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-sm text-ink dark:text-cream-soft placeholder:text-grey-green dark:placeholder:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime resize-none transition" />
      <motion.button onClick={() => setDone(true)} disabled={!val.trim()} whileTap={{ scale: 0.97 }}
        className="px-5 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-2">
        <Brain size={14} /> Check My Recall
      </motion.button>
      <AnimatePresence>{done && (
        <motion.div {...fadeUp} className="space-y-2">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-xs text-emerald-700 dark:text-emerald-300">
            <div className="font-semibold mb-1">Key concepts to remember:</div>
            <div>✓ SOLID principles and their purpose</div>
            <div>✓ Single Responsibility vs Interface Segregation</div>
          </div>
          {val.length < 30 && <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-xs text-amber-700 dark:text-amber-300">
            Try to recall more detail next time — specificity helps long-term retention.
          </div>}
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   24. FLASHCARD
   ═══════════════════════════════════════════════════════════ */
export function FlashcardPreview() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="w-full flex items-center justify-center py-4" style={{ perspective: "1000px" }}>
      <motion.div className="relative w-full max-w-[360px] h-[240px] cursor-pointer" onClick={() => setFlipped(!flipped)}
        style={{ transformStyle: "preserve-3d" }} animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}>
        {/* Front */}
        <div className="absolute inset-0 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: "hidden" }}>
          <Badge color="teal">Question</Badge>
          <p className="text-base font-semibold text-ink dark:text-cream-soft text-center leading-relaxed mt-3">What is the primary function of mitochondria?</p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-grey-green dark:text-[#8FA29B]"><RotateCcw size={12} /> Tap to flip</div>
        </div>
        {/* Back */}
        <div className="absolute inset-0 rounded-2xl bg-teal-dark dark:bg-accent-lime/20 border border-teal-dark/30 dark:border-accent-lime/30 shadow-lg flex flex-col items-center justify-center p-6" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <Badge color="green">Answer</Badge>
          <p className="text-base font-semibold text-white dark:text-accent-lime text-center leading-relaxed mt-3">Energy production — converts nutrients into ATP via cellular respiration.</p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] text-white/60 dark:text-accent-lime/60"><RotateCcw size={12} /> Tap to flip back</div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   25. PROGRESS CARD
   ═══════════════════════════════════════════════════════════ */
export function ProgressCardPreview() {
  const [pct, setPct] = useState(0);
  React.useEffect(() => { const t = setTimeout(() => setPct(72), 100); return () => clearTimeout(t); }, []);
  return (
    <div className="w-full max-w-[400px] mx-auto flex items-center gap-6 p-6 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg">
      <div className="relative size-24 shrink-0">
        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
          <circle className="text-mist-green/50 dark:text-[#2A3838]" cx="18" cy="18" r="15.9" strokeWidth="3.5" fill="none" stroke="currentColor" />
          <motion.circle className="text-teal-dark dark:text-accent-lime" cx="18" cy="18" r="15.9" strokeWidth="3.5" fill="none" stroke="currentColor" strokeLinecap="round"
            initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${pct}, 100` }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span className="text-xl font-bold text-ink dark:text-cream-soft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>{pct}%</motion.span>
          <span className="text-[9px] text-grey-green dark:text-[#8FA29B] font-medium">Mastery</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-xs font-semibold text-ink dark:text-cream-soft">Overall Progress</div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-teal-dark dark:bg-accent-lime" /><span className="text-ink dark:text-cream-soft">Strong (4 topics)</span></div>
          <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-mist-green dark:bg-[#2A3838]" /><span className="text-ink dark:text-cream-soft">Developing (3 topics)</span></div>
          <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-slate-200 dark:bg-[#3A4A4A]" /><span className="text-grey-green dark:text-[#8FA29B]">Not started (2 topics)</span></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   26–47: PROGRESS, SESSION, EXAM, RESOURCE COMPONENTS
   (Informational with subtle animations)
   ═══════════════════════════════════════════════════════════ */

export function LearningPathPreview() {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => { const t = setInterval(() => setActive(p => p < 3 ? p + 1 : 3), 1200); return () => clearInterval(t); }, []);
  const steps = [{ label: "Arrays & Lists", done: true }, { label: "Stacks & Queues", done: true }, { label: "Binary Trees", done: false }, { label: "Graph Algorithms", done: false }];
  return (
    <div className="w-full max-w-[380px] mx-auto space-y-1">
      <p className="text-xs font-semibold text-ink dark:text-cream-soft mb-2">Data Structures Path</p>
      {steps.map((s, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <motion.div className={`size-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${i <= active ? "bg-teal-dark dark:bg-accent-lime text-white dark:text-ink border-teal-dark dark:border-accent-lime" : "bg-cream-light dark:bg-[#232D2D] text-grey-green border-mist-green dark:border-[#2A3838]"}`}
              animate={i === active ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 0.6, repeat: i === active ? Infinity : 0, repeatDelay: 1 }}>
              {s.done ? <Check size={14} /> : i + 1}
            </motion.div>
            {i < steps.length - 1 && <div className={`w-0.5 h-6 transition-colors ${i < active ? "bg-teal-dark dark:bg-accent-lime" : "bg-mist-green dark:bg-[#2A3838]"}`} />}
          </div>
          <span className={`pt-1.5 text-xs font-semibold ${i <= active ? "text-ink dark:text-cream-soft" : "text-grey-green dark:text-[#8FA29B]"}`}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export function MilestoneCardPreview() {
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <div className="flex items-center gap-3"><Award size={20} className="text-amber-500" /><span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Milestone Achieved</span></div>
      <h4 className="text-sm font-bold text-ink dark:text-cream-soft">Binary Search Trees</h4>
      <p className="text-[11px] text-grey-green dark:text-[#8FA29B]">Scored 92% across 3 quizzes with consistent recall after 7-day interval.</p>
      <div className="flex flex-wrap gap-1.5">{["Insertion", "Deletion", "Traversal"].map(t => <span key={t} className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-semibold">{t}</span>)}</div>
    </div>
  );
}

export function MasteryCardPreview() {
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <h4 className="text-sm font-bold text-ink dark:text-cream-soft">OOP — Polymorphism</h4>
      <div className="flex items-center gap-3"><ScoreBar value={88} /><span className="text-sm font-bold text-ink dark:text-cream-soft">88%</span></div>
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="text-center"><div className="font-bold text-ink dark:text-cream-soft">3</div><div className="text-grey-green dark:text-[#8FA29B]">Quizzes</div></div>
        <div className="text-center"><div className="font-bold text-ink dark:text-cream-soft">5d</div><div className="text-grey-green dark:text-[#8FA29B]">Until decay</div></div>
        <div className="text-center"><div className="font-bold text-emerald-600">Strong</div><div className="text-grey-green dark:text-[#8FA29B]">Status</div></div>
      </div>
    </div>
  );
}

export function ReadinessCardPreview() {
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <div className="flex items-center justify-between"><h4 className="text-sm font-bold text-ink dark:text-cream-soft">CSC 201 Final Exam</h4><span className="text-lg font-bold text-amber-600">74%</span></div>
      <ScoreBar value={74} color="amber" />
      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="text-center"><div className="font-bold text-emerald-600">18</div><div className="text-grey-green dark:text-[#8FA29B]">Covered</div></div>
        <div className="text-center"><div className="font-bold text-amber-600">4</div><div className="text-grey-green dark:text-[#8FA29B]">Partial</div></div>
        <div className="text-center"><div className="font-bold text-red-500">2</div><div className="text-grey-green dark:text-[#8FA29B]">Missing</div></div>
      </div>
    </div>
  );
}

export function WeakAreaPreview() {
  const areas = [
    { name: "Graph Traversal", pct: 38, errors: 7 },
    { name: "Hash Collisions", pct: 42, errors: 5 },
    { name: "B-Tree Insertion", pct: 45, errors: 4 },
  ];
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /><span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Needs Attention</span></div>
      <div className="space-y-3">{areas.map((a, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-xs"><span className="font-semibold text-ink dark:text-cream-soft">{a.name}</span><span className="text-red-500 font-bold">{a.pct}%</span></div>
          <ScoreBar value={a.pct} color="red" />
          <div className="text-[10px] text-grey-green dark:text-[#8FA29B]">{a.errors} recent errors</div>
        </div>
      ))}</div>
    </div>
  );
}

export function NextActionPreview() {
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <Badge color="teal">Best Next Step</Badge>
      <h4 className="text-sm font-bold text-ink dark:text-cream-soft">Practice applying Kirchhoff's Laws</h4>
      <p className="text-[11px] text-grey-green dark:text-[#8FA29B] leading-relaxed">Your recall is strong (82%) but application is weak (48%). Practice multi-loop circuit analysis.</p>
      <motion.button whileTap={{ scale: 0.98 }} className="w-full py-2.5 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
        Start Practice <ArrowRight size={14} />
      </motion.button>
    </div>
  );
}

export function SessionPlanPreview() {
  const steps = [{ label: "Review: Linked Lists & Stacks", icon: <RotateCcw size={12} />, done: true }, { label: "Learn: Binary Trees", icon: <BookOpen size={12} />, done: true }, { label: "Practice: 5 problems", icon: <Target size={12} />, current: true }, { label: "Check: 5-question quiz", icon: <CheckCircle2 size={12} />, done: false }];
  return (
    <div className="w-full max-w-[380px] mx-auto space-y-3">
      <div className="flex items-center justify-between"><h4 className="text-xs font-bold text-ink dark:text-cream-soft">Today's Session</h4><span className="text-[10px] text-grey-green dark:text-[#8FA29B] font-mono">~25 min</span></div>
      {steps.map((s, i) => (
        <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${s.current ? "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime border border-teal-dark/20 dark:border-accent-lime/20" : s.done ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-300" : "bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B]"}`}>
          <span className="shrink-0">{s.done ? <Check size={14} className="text-emerald-500" /> : s.icon}</span>
          <span className="flex-1">{s.label}</span>
          {s.current && <span className="text-[10px] font-bold">Current</span>}
        </div>
      ))}
    </div>
  );
}

export function SessionProgressPreview() {
  const [prog, setProg] = useState(0);
  React.useEffect(() => { const t = setTimeout(() => setProg(75), 100); return () => clearTimeout(t); }, []);
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-4">
      <div className="flex items-center justify-between"><h4 className="text-xs font-bold text-ink dark:text-cream-soft">Session Progress</h4><span className="text-[10px] text-grey-green dark:text-[#8FA29B] font-mono">18 min remaining</span></div>
      <div className="space-y-1"><div className="flex items-center justify-between text-[11px]"><span className="text-grey-green dark:text-[#8FA29B]">Concepts</span><span className="font-bold text-ink dark:text-cream-soft">3 / 4</span></div><ScoreBar value={75} /></div>
      <div className="space-y-1"><div className="flex items-center justify-between text-[11px]"><span className="text-grey-green dark:text-[#8FA29B]">Quiz Accuracy</span><span className="font-bold text-ink dark:text-cream-soft">80%</span></div><ScoreBar value={80} /></div>
      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">2 concepts need review</p>
    </div>
  );
}

export function SessionSummaryPreview() {
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <h4 className="text-xs font-bold text-ink dark:text-cream-soft">Session Complete</h4>
      <div className="space-y-2 text-[11px]">
        <div className="flex items-start gap-2"><Check size={12} className="text-emerald-500 mt-0.5 shrink-0" /><span><strong className="text-ink dark:text-cream-soft">Learned:</strong> Inorder & preorder traversal</span></div>
        <div className="flex items-start gap-2"><AlertTriangle size={12} className="text-amber-500 mt-0.5 shrink-0" /><span><strong className="text-ink dark:text-cream-soft">Weak:</strong> Postorder recursion logic</span></div>
        <div className="flex items-start gap-2"><ArrowRight size={12} className="text-teal-dark dark:text-accent-lime mt-0.5 shrink-0" /><span><strong className="text-ink dark:text-cream-soft">Next:</strong> Practice 3 postorder problems</span></div>
      </div>
    </div>
  );
}

export function ResumeLearningPreview() {
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <div className="flex items-center gap-2"><Play size={14} className="text-teal-dark dark:text-accent-lime" /><span className="text-xs font-bold text-ink dark:text-cream-soft">Continue where you stopped</span></div>
      <h4 className="text-sm font-bold text-ink dark:text-cream-soft">Binary Trees — Postorder Traversal</h4>
      <p className="text-[11px] text-grey-green dark:text-[#8FA29B]">Step 2 of 4: Writing the recursive case</p>
      <ScoreBar value={50} />
      <motion.button whileTap={{ scale: 0.98 }} className="w-full py-2.5 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold cursor-pointer flex items-center justify-center gap-2">
        <Play size={14} /> Continue
      </motion.button>
    </div>
  );
}

export function ExamCountdownPreview() {
  const [time, setTime] = React.useState(12 * 86400);
  React.useEffect(() => { const t = setInterval(() => setTime(p => p > 0 ? p - 86400 : 0), 3000); return () => clearInterval(t); }, []);
  const days = Math.floor(time / 86400);
  return (
    <div className="w-full max-w-[360px] mx-auto p-6 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg text-center space-y-3">
      <Badge color="amber">Exam Countdown</Badge>
      <h4 className="text-xs font-semibold text-grey-green dark:text-[#8FA29B]">CSC 201 Final Exam</h4>
      <div className="text-4xl font-bold text-teal-dark dark:text-accent-lime font-mono">{days}</div>
      <div className="text-[10px] text-grey-green dark:text-[#8FA29B] uppercase tracking-wider">days remaining</div>
      <p className="text-[11px] text-amber-600 dark:text-amber-400">Focus: Graph algorithms (38% mastery)</p>
    </div>
  );
}

export function ExamReadinessPreview() {
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-4">
      <div className="text-center"><div className="text-3xl font-bold text-amber-600">68%</div><div className="text-[10px] text-grey-green dark:text-[#8FA29B] uppercase tracking-wider">Exam Readiness</div></div>
      <ScoreBar value={68} color="amber" />
      <div className="space-y-2 text-[11px]">
        <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-emerald-500" /><span className="text-ink dark:text-cream-soft"><strong>Strong:</strong> OOP, Memory Management</span></div>
        <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-amber-500" /><span className="text-ink dark:text-cream-soft"><strong>Partial:</strong> Graphs, Trees</span></div>
        <div className="flex items-center gap-2"><span className="size-2 rounded-full bg-red-500" /><span className="text-ink dark:text-cream-soft"><strong>Weak:</strong> B-Trees, Hashing</span></div>
      </div>
    </div>
  );
}

export function TopicCoveragePreview() {
  const topics = [
    { name: "Mechanics", pct: 92, color: "emerald" },
    { name: "Waves & Optics", pct: 68, color: "amber" },
    { name: "Electricity", pct: 45, color: "red" },
    { name: "Thermodynamics", pct: 30, color: "red" },
  ];
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <h4 className="text-xs font-bold text-ink dark:text-cream-soft">Syllabus Coverage</h4>
      <div className="space-y-3">{topics.map((t, i) => (
        <div key={i} className="space-y-1">
          <div className="flex items-center justify-between text-[11px]"><span className="font-semibold text-ink dark:text-cream-soft">{t.name}</span><span className="font-bold">{t.pct}%</span></div>
          <ScoreBar value={t.pct} color={t.color} />
        </div>
      ))}</div>
    </div>
  );
}

export function PastQuestionPreview() {
  const patterns = [
    { topic: "Trees & Graphs", freq: "Every year", icon: <Database size={12} /> },
    { topic: "Memory Management", freq: "4/5 years", icon: <Cpu size={12} /> },
    { topic: "B-Trees & Indexing", freq: "3/5 years", icon: <Layers size={12} /> },
    { topic: "Process Scheduling", freq: "3/5 years", icon: <GitBranch size={12} /> },
  ];
  return (
    <div className="w-full max-w-[400px] mx-auto p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-3">
      <h4 className="text-xs font-bold text-ink dark:text-cream-soft">Past Paper Analysis (5 years)</h4>
      <div className="space-y-2">{patterns.map((p, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-cream-light dark:bg-[#232D2D] text-xs">
          <span className="text-teal-dark dark:text-accent-lime">{p.icon}</span>
          <span className="flex-1 font-semibold text-ink dark:text-cream-soft">{p.topic}</span>
          <span className="text-[10px] text-grey-green dark:text-[#8FA29B]">{p.freq}</span>
        </div>
      ))}</div>
    </div>
  );
}

export function PredictedPracticePreview() {
  return (
    <div className="w-full max-w-[420px] mx-auto space-y-3">
      <div className="flex items-center gap-2"><Sparkles size={14} className="text-purple-500" /><span className="text-xs font-bold text-purple-600 dark:text-purple-400">AI-Generated Practice</span></div>
      <div className="space-y-2">
        {[1, 2].map(i => (
          <div key={i} className="p-3 rounded-xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] space-y-1">
            <div className="flex items-center justify-between text-[10px]"><span className="text-grey-green dark:text-[#8FA29B]">Predicted Q{i}</span><span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/20 text-amber-600 font-semibold">Medium</span></div>
            <p className="text-xs font-semibold text-ink dark:text-cream-soft">{i === 1 ? "Explain BFS vs DFS with a real-world use case." : "Write pseudocode for BST node deletion."}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-grey-green dark:text-[#8FA29B] italic">Based on your learning patterns — not a guaranteed exam prediction.</p>
    </div>
  );
}

export function ExamSimulationPreview() {
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = React.useState(5400);
  React.useEffect(() => { if (!started) return; const t = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000); return () => clearInterval(t); }, [started]);
  const h = Math.floor(timer / 3600), m = Math.floor((timer % 3600) / 60), s = timer % 60;
  return (
    <div className="w-full max-w-[420px] mx-auto space-y-4">
      {!started ? (
        <div className="text-center space-y-3">
          <h4 className="text-sm font-bold text-ink dark:text-cream-soft">CSC 201 Mock Exam</h4>
          <div className="flex items-center justify-center gap-4 text-[11px] text-grey-green dark:text-[#8FA29B]">
            <span className="flex items-center gap-1"><Timer size={12} /> 1:30:00</span>
            <span className="flex items-center gap-1"><Hash size={12} /> 30 questions</span>
            <span className="flex items-center gap-1"><Shield size={12} /> No hints</span>
          </div>
          <motion.button onClick={() => setStarted(true)} whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold cursor-pointer flex items-center gap-2 mx-auto">
            <Play size={14} /> Begin Exam
          </motion.button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-600 dark:text-amber-400 font-bold">{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}</span>
            <div className="flex gap-2">
              <motion.button whileTap={{ scale: 0.95 }} className="p-1.5 rounded-lg border border-mist-green dark:border-[#2A3838] cursor-pointer"><Flag size={12} /></motion.button>
              <motion.button whileTap={{ scale: 0.95 }} className="p-1.5 rounded-lg border border-mist-green dark:border-[#2A3838] cursor-pointer"><SkipForward size={12} /></motion.button>
            </div>
          </div>
          <ScoreBar value={40} />
          <p className="text-[10px] text-grey-green dark:text-[#8FA29B] text-center">Question 12 of 30</p>
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838]">
            <p className="text-xs font-semibold text-ink dark:text-cream-soft">Which data structure is most efficient for implementing an LRU cache?</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function PostExamReflectionPreview() {
  const [feeling, setFeeling] = useState<number | null>(null);
  const emojis = ["😟", "😐", "🙂", "😄"];
  return (
    <div className="w-full max-w-[400px] mx-auto space-y-4">
      <h4 className="text-xs font-bold text-ink dark:text-cream-soft">Post-Exam Reflection</h4>
      <div className="space-y-3">
        <div className="space-y-2"><p className="text-[11px] text-grey-green dark:text-[#8FA29B]">How did the exam feel?</p>
          <div className="flex gap-3">{emojis.map((e, i) => (
            <motion.button key={i} onClick={() => setFeeling(i)} whileTap={{ scale: 0.95 }}
              className={`size-10 rounded-xl border-2 flex items-center justify-center text-lg cursor-pointer transition-all ${feeling === i ? "border-teal-dark dark:border-accent-lime bg-teal-dark/10 dark:bg-accent-lime/10" : "border-mist-green dark:border-[#2A3838] bg-white dark:bg-[#1C2323]"}`}>
              {e}
            </motion.button>
          ))}</div>
        </div>
        {feeling !== null && <motion.div {...fadeUp} className="p-3 rounded-xl bg-cream-light dark:bg-[#232D2D] text-[11px] text-ink dark:text-cream-soft">
          <strong>Hardest section:</strong> Graph traversal algorithms<br/>
          <strong>Focus area:</strong> BFS/DFS implementation patterns
        </motion.div>}
      </div>
    </div>
  );
}

export function ResourceCardPreview() {
  return (
    <div className="w-full max-w-[380px] mx-auto p-4 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg flex items-start gap-3">
      <div className="size-10 rounded-xl bg-teal-dark/10 dark:bg-accent-lime/10 flex items-center justify-center shrink-0"><BookOpen size={16} className="text-teal-dark dark:text-accent-lime" /></div>
      <div className="flex-1 space-y-1">
        <h4 className="text-xs font-bold text-ink dark:text-cream-soft">Introduction to Algorithms</h4>
        <p className="text-[10px] text-grey-green dark:text-[#8FA29B]">CLRS, Chapter 12: Binary Search Trees</p>
        <div className="flex items-center gap-2 text-[10px]"><span className="px-1.5 py-0.5 rounded bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-semibold">Textbook</span><span className="text-grey-green dark:text-[#8FA29B]">~20 min read</span></div>
      </div>
      <ExternalLink size={14} className="text-grey-green dark:text-[#8FA29B] shrink-0 mt-1" />
    </div>
  );
}

export function SourceCardPreview() {
  return (
    <div className="w-full max-w-[380px] mx-auto p-4 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg space-y-2">
      <div className="flex items-center gap-2"><FileText size={14} className="text-teal-dark dark:text-accent-lime" /><span className="text-[10px] font-bold text-grey-green dark:text-[#8FA29B] uppercase tracking-wider">Source</span></div>
      <h4 className="text-xs font-bold text-ink dark:text-cream-soft">CSC 201 Lecture Notes — Week 8</h4>
      <div className="flex items-center gap-3 text-[10px] text-grey-green dark:text-[#8FA29B]">
        <span>Uploaded by: Prof. Adebayo</span>
        <span>Pages 14–16</span>
      </div>
      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold"><CheckCircle2 size={10} /> Verified source</div>
    </div>
  );
}

export function RecommendedResourcePreview() {
  return (
    <div className="w-full max-w-[380px] mx-auto p-4 rounded-2xl bg-white dark:bg-[#1C2323] border border-teal-dark/20 dark:border-accent-lime/20 shadow-lg space-y-2">
      <Badge color="teal">Recommended for You</Badge>
      <h4 className="text-xs font-bold text-ink dark:text-cream-soft">Visualgo — BST Operations</h4>
      <p className="text-[11px] text-grey-green dark:text-[#8FA29B]">Interactive visualization of binary search tree insertion, deletion, and traversal.</p>
      <div className="flex items-center gap-2 text-[10px]"><span className="text-amber-600 font-semibold">Why:</span><span className="text-grey-green dark:text-[#8FA29B]">You scored 45% on BST insertion</span></div>
      <div className="flex items-center gap-3 text-[10px] text-grey-green dark:text-[#8FA29B]"><span className="flex items-center gap-1"><Clock size={10} /> 12 min</span><span className="flex items-center gap-1"><Star size={10} /> Highly relevant</span></div>
    </div>
  );
}

export function ResourceSectionPreview() {
  const resources = [
    { type: "Textbook", title: "CLRS Ch. 12: BSTs", icon: <BookOpen size={12} /> },
    { type: "Video", title: "MIT OCW Lecture 5", icon: <Play size={12} /> },
    { type: "Notes", title: "Your lecture notes p.14–16", icon: <FileText size={12} /> },
  ];
  return (
    <div className="w-full max-w-[380px] mx-auto space-y-3">
      <h4 className="text-xs font-bold text-ink dark:text-cream-soft">Resources for Binary Trees</h4>
      <div className="space-y-2">{resources.map((r, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] text-xs">
          <span className="text-teal-dark dark:text-accent-lime">{r.icon}</span>
          <span className="flex-1"><span className="text-[10px] text-grey-green dark:text-[#8FA29B] block">{r.type}</span><span className="font-semibold text-ink dark:text-cream-soft">{r.title}</span></span>
          <ExternalLink size={12} className="text-grey-green dark:text-[#8FA29B]" />
        </div>
      ))}</div>
    </div>
  );
}

export function CitationDrawerPreview() {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full max-w-[420px] mx-auto space-y-3">
      <div className="p-4 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838]">
        <p className="text-xs text-ink dark:text-cream-soft italic leading-relaxed">"A binary search tree is a binary tree where each node has at most two children, and all values in the left subtree are less than the node's value."</p>
      </div>
      <motion.button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-xs font-semibold text-teal-dark dark:text-accent-lime cursor-pointer">
        <FileText size={12} /> {open ? "Hide" : "View"} sources
      </motion.button>
      <AnimatePresence>{open && (
        <motion.div {...fadeUp} className="p-4 rounded-xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] space-y-2">
          <div className="text-[10px] font-bold text-grey-green dark:text-[#8FA29B] uppercase tracking-wider">Sources</div>
          <div className="space-y-1.5 text-[11px] text-ink dark:text-cream-soft">
            <p>📄 CSC 201 Notes, p.14 — Prof. Adebayo</p>
            <p>📖 CLRS Introduction to Algorithms, Ch. 12</p>
          </div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
