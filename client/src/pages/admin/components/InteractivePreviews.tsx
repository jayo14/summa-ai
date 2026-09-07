import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Flashcard: flip on click ── */
export function FlashcardPreview() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="w-full h-[280px] flex items-center justify-center perspective-[800px]">
      <motion.div
        className="relative w-full max-w-[320px] h-[220px] cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] shadow-lg flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-[10px] font-bold text-teal-dark dark:text-accent-lime uppercase tracking-widest mb-3">Question</span>
          <p className="text-sm font-semibold text-ink dark:text-cream-soft text-center leading-relaxed">
            What is the primary function of mitochondria?
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-grey-green dark:text-[#8FA29B]">
            <span>Tap to reveal answer</span>
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl bg-teal-dark dark:bg-accent-lime/20 border border-teal-dark/30 dark:border-accent-lime/30 shadow-lg flex flex-col items-center justify-center p-6"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="text-[10px] font-bold text-white/70 dark:text-accent-lime uppercase tracking-widest mb-3">Answer</span>
          <p className="text-sm font-semibold text-white dark:text-accent-lime text-center leading-relaxed">
            Energy production — converts nutrients into ATP via cellular respiration.
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-white/60 dark:text-accent-lime/60">
            <span>Tap to see question</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Multiple Choice: pick an answer ── */
export function MultipleChoicePreview() {
  const [selected, setSelected] = useState<number | null>(null);
  const options = [
    "Protein synthesis",
    "Energy production (ATP)",
    "Cellular division",
    "DNA replication",
  ];
  const correct = 1;
  const answered = selected !== null;

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-4">
        <p className="text-sm font-semibold text-ink dark:text-cream-soft">
          What is the main function of mitochondria?
        </p>
        <div className="space-y-2" role="radiogroup" aria-label="Answer options">
          {options.map((opt, i) => {
            const isCorrect = i === correct;
            const isSelected = selected === i;
            let ring = "";
            let bg = "";
            if (answered && isSelected && isCorrect) { ring = "ring-2 ring-emerald-500"; bg = "bg-emerald-50 dark:bg-emerald-900/20"; }
            else if (answered && isSelected && !isCorrect) { ring = "ring-2 ring-red-400"; bg = "bg-red-50 dark:bg-red-900/20"; }
            else if (answered && isCorrect) { ring = "ring-2 ring-emerald-500/50"; bg = "bg-emerald-50/50 dark:bg-emerald-900/10"; }

            return (
              <motion.button
                key={i}
                onClick={() => !answered && setSelected(i)}
                disabled={answered}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm transition-all ${bg} ${ring} ${
                  !answered ? "hover:bg-cream-light dark:hover:bg-[#232D2D] cursor-pointer" : "cursor-default"
                }`}
                whileTap={!answered ? { scale: 0.98 } : {}}
              >
                <div className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  answered && isCorrect ? "border-emerald-500 bg-emerald-500" :
                  answered && isSelected && !isCorrect ? "border-red-400 bg-red-400" :
                  isSelected ? "border-teal-dark dark:border-accent-lime bg-teal-dark dark:bg-accent-lime" :
                  "border-slate-300 dark:border-[#4A5A5A]"
                }`}>
                  {(answered && isCorrect) || (isSelected && !answered) ? (
                    <div className="size-1.5 rounded-full bg-white" />
                  ) : null}
                </div>
                <span className="text-ink dark:text-cream-soft">{opt}</span>
                {answered && isCorrect && <span className="ml-auto text-emerald-600 dark:text-emerald-400 text-xs font-bold">✓</span>}
                {answered && isSelected && !isCorrect && <span className="ml-auto text-red-500 text-xs font-bold">✗</span>}
              </motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs p-3 rounded-xl ${selected === correct ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}
            >
              {selected === correct ? "Correct! Mitochondria produce ATP through cellular respiration." : "Not quite — mitochondria are the powerhouse of the cell, producing ATP energy."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── True / False: pick true or false ── */
export function TrueFalsePreview() {
  const [answer, setAnswer] = useState<"true" | "false" | null>(null);
  const isCorrectAnswer = true; // statement is true
  const answered = answer !== null;

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-4">
        <span className="text-[10px] font-bold text-teal-dark dark:text-accent-lime uppercase tracking-widest">Rapid Check</span>
        <p className="text-sm font-semibold text-ink dark:text-cream-soft">
          Java interfaces can contain private helper methods since Java 9.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => !answered && setAnswer("true")}
            disabled={answered}
            className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
              answered && answer === "true" && isCorrectAnswer
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                : answered && answer === "true" && !isCorrectAnswer
                ? "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400"
                : answered && isCorrectAnswer
                ? "bg-emerald-50/50 border-emerald-500/40 text-emerald-600/60"
                : "bg-cream-light dark:bg-[#232D2D] border-mist-green dark:border-[#2A3838] text-ink dark:text-cream-soft hover:border-teal-dark/50 cursor-pointer"
            }`}
            whileTap={!answered ? { scale: 0.96 } : {}}
          >
            TRUE ✓
          </motion.button>
          <motion.button
            onClick={() => !answered && setAnswer("false")}
            disabled={answered}
            className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
              answered && answer === "false" && !isCorrectAnswer
                ? "bg-red-50 dark:bg-red-900/20 border-red-400 text-red-600 dark:text-red-400"
                : answered && answer === "false" && isCorrectAnswer
                ? "bg-emerald-50/50 border-emerald-500/40 text-emerald-600/60"
                : "bg-cream-light dark:bg-[#232D2D] border-mist-green dark:border-[#2A3838] text-ink dark:text-cream-soft hover:border-teal-dark/50 cursor-pointer"
            }`}
            whileTap={!answered ? { scale: 0.96 } : {}}
          >
            FALSE
          </motion.button>
        </div>
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs p-3 rounded-xl ${answer === "true" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}
            >
              {answer === "true" ? "Correct! Java 9 introduced private interface methods." : "Incorrect — private methods in interfaces were added in Java 9."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Progress Card: animated ring ── */
export function ProgressCardPreview() {
  const [pct, setPct] = useState(0);
  React.useEffect(() => {
    const t = setTimeout(() => setPct(72), 100);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[340px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-6 flex items-center gap-6">
        <div className="relative size-24 shrink-0">
          <svg className="size-full -rotate-90" viewBox="0 0 36 36">
            <circle className="text-mist-green dark:text-[#2A3838]" cx="18" cy="18" r="15.9" strokeWidth="3.5" fill="none" stroke="currentColor" />
            <motion.circle
              className="text-teal-dark dark:text-accent-lime"
              cx="18" cy="18" r="15.9" strokeWidth="3.5" fill="none" stroke="currentColor"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray: `${pct}, 100` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-xl font-bold text-ink dark:text-cream-soft"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {pct}%
            </motion.span>
            <span className="text-[9px] text-grey-green dark:text-[#8FA29B] font-medium">Mastery</span>
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="text-xs font-semibold text-ink dark:text-cream-soft">Overall Progress</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="size-2 rounded-full bg-teal-dark dark:bg-accent-lime" />
              <span className="text-ink dark:text-cream-soft font-medium">Strong (4 topics)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="size-2 rounded-full bg-mist-green dark:bg-[#2A3838]" />
              <span className="text-ink dark:text-cream-soft font-medium">Developing (3 topics)</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="size-2 rounded-full bg-slate-200 dark:bg-[#3A4A4A]" />
              <span className="text-grey-green dark:text-[#8FA29B] font-medium">Not started (2 topics)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Recall Prompt: show/hide answer ── */
export function RecallPromptPreview() {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-4">
        <span className="text-[10px] font-bold text-teal-dark dark:text-accent-lime uppercase tracking-widest">Recall Check</span>
        <p className="text-sm font-semibold text-ink dark:text-cream-soft">
          Without looking at your notes, explain the difference between TCP and UDP.
        </p>
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.button
              key="reveal"
              onClick={() => setRevealed(true)}
              className="w-full py-2.5 rounded-xl bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] text-xs font-semibold text-ink dark:text-cream-soft hover:bg-mist-green/30 transition cursor-pointer"
              whileTap={{ scale: 0.98 }}
            >
              Show Answer
            </motion.button>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0 }}
              className="bg-teal-dark/5 dark:bg-accent-lime/5 border border-teal-dark/20 dark:border-accent-lime/20 rounded-xl p-4 text-xs text-ink dark:text-cream-soft leading-relaxed space-y-2"
            >
              <p><strong className="text-teal-dark dark:text-accent-lime">TCP</strong> is connection-oriented, reliable, ordered delivery. Used for HTTP, email, file transfer.</p>
              <p><strong className="text-teal-dark dark:text-accent-lime">UDP</strong> is connectionless, faster, no guaranteed delivery. Used for video streaming, gaming, DNS.</p>
              <div className="pt-2 flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">Got it right ✓</button>
                <button className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[11px] font-semibold">Needs review</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Short Answer: type and check ── */
export function ShortAnswerPreview() {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const answer = "O(n log n)";
  const isCorrect = val.trim().toLowerCase().replace(/\s/g, "") === answer.toLowerCase().replace(/\s/g, "");

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-4">
        <p className="text-sm font-semibold text-ink dark:text-cream-soft">
          What is the average-case time complexity of merge sort?
        </p>
        <input
          type="text"
          value={val}
          onChange={(e) => { setVal(e.target.value); setChecked(false); }}
          placeholder="Type your answer..."
          className="w-full px-4 py-2.5 rounded-xl border border-mist-green dark:border-[#2A3838] bg-cream-light dark:bg-[#232D2D] text-sm text-ink dark:text-cream-soft placeholder:text-grey-green dark:placeholder:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime transition"
        />
        <div className="flex gap-2">
          <motion.button
            onClick={() => setChecked(true)}
            disabled={!val.trim()}
            className="px-4 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold disabled:opacity-40 cursor-pointer"
            whileTap={{ scale: 0.97 }}
          >
            Check Answer
          </motion.button>
          {checked && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-xs flex items-center font-semibold ${isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
            >
              {isCorrect ? `✓ Correct! ${answer}` : `✗ Expected: ${answer}`}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Fill in the Blank: type to fill ── */
export function FillBlankPreview() {
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState(false);
  const answer = "endoplasmic reticulum";
  const isCorrect = val.trim().toLowerCase() === answer;

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-4">
        <p className="text-sm text-ink dark:text-cream-soft leading-relaxed">
          Proteins are synthesized by ribosomes attached to the{" "}
          <input
            type="text"
            value={val}
            onChange={(e) => { setVal(e.target.value); setChecked(false); }}
            placeholder="______"
            className="inline-block w-40 px-2 py-0.5 rounded-lg border-b-2 border-teal-dark dark:border-accent-lime bg-transparent text-sm font-semibold text-ink dark:text-cream-soft placeholder:text-grey-green/50 focus:outline-none focus:border-teal-dark transition"
          />
          .
        </p>
        <div className="flex gap-2 items-center">
          <motion.button
            onClick={() => setChecked(true)}
            disabled={!val.trim()}
            className="px-4 py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold disabled:opacity-40 cursor-pointer"
            whileTap={{ scale: 0.97 }}
          >
            Check
          </motion.button>
          {checked && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-xs font-semibold ${isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}
            >
              {isCorrect ? `✓ Correct!` : `✗ Answer: ${answer}`}
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Confidence Check: pick confidence level ── */
export function ConfidenceCheckPreview() {
  const [level, setLevel] = useState<number | null>(null);
  const levels = [
    { label: "Guessing", emoji: "🤔", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700" },
    { label: "Unsure", emoji: "😐", color: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600" },
    { label: "Pretty sure", emoji: "😊", color: "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-700" },
    { label: "Confident", emoji: "💪", color: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700" },
  ];

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-4">
        <p className="text-sm font-semibold text-ink dark:text-cream-soft">
          What is the capital of Nigeria?
        </p>
        <p className="text-xs text-grey-green dark:text-[#8FA29B]">Lagos or Abuja?</p>
        <div className="grid grid-cols-2 gap-2">
          {levels.map((l, i) => (
            <motion.button
              key={i}
              onClick={() => setLevel(i)}
              className={`py-2.5 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer ${
                level === i ? l.color + " ring-2 ring-offset-1" : "border-mist-green dark:border-[#2A3838] bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B]"
              }`}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-base mr-1">{l.emoji}</span> {l.label}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {level !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs p-3 rounded-xl bg-teal-dark/5 dark:bg-accent-lime/5 text-ink dark:text-cream-soft border border-teal-dark/20 dark:border-accent-lime/20"
            >
              Correct answer: <strong className="text-teal-dark dark:text-accent-lime">Abuja</strong> — your recall confidence: {levels[level].label}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Matching: click pairs ── */
export function MatchingPreview() {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const left = ["TCP", "UDP", "HTTP"];
  const right = ["Reliable delivery", "Fast streaming", "Web protocol"];
  const correctPairs: Record<number, number> = { 0: 0, 1: 1, 2: 2 };

  const handleRightClick = (ri: number) => {
    if (selectedLeft === null) return;
    setMatches((prev) => ({ ...prev, [selectedLeft]: ri }));
    setSelectedLeft(null);
  };

  const isMatched = (li: number) => li in matches;
  const isCorrectPair = (li: number) => matches[li] === correctPairs[li];

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5">
        <p className="text-xs font-semibold text-ink dark:text-cream-soft mb-3">Match each term with its definition:</p>
        <div className="grid grid-cols-[1fr_1fr] gap-3">
          <div className="space-y-2">
            {left.map((item, li) => (
              <motion.button
                key={li}
                onClick={() => !isMatched(li) && setSelectedLeft(li)}
                className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border-2 transition-all text-left ${
                  selectedLeft === li
                    ? "border-teal-dark dark:border-accent-lime bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime"
                    : isMatched(li)
                    ? isCorrectPair(li)
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                      : "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600"
                    : "border-mist-green dark:border-[#2A3838] bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft hover:border-teal-dark/40 cursor-pointer"
                }`}
                whileTap={!isMatched(li) ? { scale: 0.97 } : {}}
              >
                {item}
              </motion.button>
            ))}
          </div>
          <div className="space-y-2">
            {right.map((item, ri) => {
              const matchedBy = Object.entries(matches).find(([, v]) => v === ri)?.[0];
              return (
                <motion.button
                  key={ri}
                  onClick={() => handleRightClick(ri)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all text-left ${
                    matchedBy !== undefined
                      ? Number(matchedBy) === correctPairs[Number(matchedBy)]
                        ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                        : "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600"
                      : "border-mist-green dark:border-[#2A3838] bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] hover:border-teal-dark/40 cursor-pointer"
                  }`}
                  whileTap={{ scale: 0.97 }}
                >
                  {item}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Ordering: drag-reorder with click buttons ── */
export function OrderingPreview() {
  const [items, setItems] = useState(["Gather data", "Analyze results", "Form hypothesis", "Draw conclusion"]);
  const [checked, setChecked] = useState(false);
  const correct = ["Gather data", "Form hypothesis", "Analyze results", "Draw conclusion"];
  const isCorrect = checked && items.every((item, i) => item === correct[i]);

  const moveUp = (i: number) => {
    if (i === 0) return;
    setItems((prev) => { const n = [...prev]; [n[i-1], n[i]] = [n[i], n[i-1]]; return n; });
    setChecked(false);
  };
  const moveDown = (i: number) => {
    if (i === items.length - 1) return;
    setItems((prev) => { const n = [...prev]; [n[i], n[i+1]] = [n[i+1], n[i]]; return n; });
    setChecked(false);
  };

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-3">
        <p className="text-xs font-semibold text-ink dark:text-cream-soft">Put these steps in the correct order:</p>
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <motion.div
              key={item}
              layout
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                checked && item === correct[i]
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : checked
                  ? "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600"
                  : "border-mist-green dark:border-[#2A3838] bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft"
              }`}
            >
              <span className="size-5 rounded-full bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="flex-1">{item}</span>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveUp(i)} className="text-[10px] text-grey-green hover:text-ink dark:hover:text-cream-soft cursor-pointer" aria-label="Move up">▲</button>
                <button onClick={() => moveDown(i)} className="text-[10px] text-grey-green hover:text-ink dark:hover:text-cream-soft cursor-pointer" aria-label="Move down">▼</button>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.button
          onClick={() => setChecked(true)}
          className="w-full py-2 rounded-xl bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-xs font-bold cursor-pointer"
          whileTap={{ scale: 0.98 }}
        >
          Check Order
        </motion.button>
      </div>
    </div>
  );
}

/* ── Categorization: drag/click into buckets ── */
export function CategorizationPreview() {
  const [placements, setPlacements] = useState<Record<string, string | null>>({});
  const items = ["Mitochondria", "Nucleus", "Ribosome"];
  const buckets = ["Energy", "Genetics", "Protein Synthesis"];
  const correctMap: Record<string, string> = { "Mitochondria": "Energy", "Nucleus": "Genetics", "Ribosome": "Protein Synthesis" };

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-3">
        <p className="text-xs font-semibold text-ink dark:text-cream-soft">Categorize each organelle:</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <motion.span
              key={item}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border cursor-pointer transition-all ${
                placements[item]
                  ? placements[item] === correctMap[item]
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                    : "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600"
                  : "border-teal-dark/30 dark:border-accent-lime/30 bg-teal-dark/5 dark:bg-accent-lime/5 text-teal-dark dark:text-accent-lime"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {item}{placements[item] ? ` → ${placements[item]}` : ""}
            </motion.span>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {buckets.map((bucket) => (
            <button
              key={bucket}
              onClick={() => {
                const unplaced = items.find((item) => !placements[item]);
                if (unplaced) setPlacements((prev) => ({ ...prev, [unplaced]: bucket }));
              }}
              className="py-2.5 rounded-xl border-2 border-dashed border-mist-green dark:border-[#2A3838] text-[10px] font-semibold text-grey-green dark:text-[#8FA29B] hover:border-teal-dark/50 hover:text-teal-dark dark:hover:text-accent-lime transition-all cursor-pointer text-center"
            >
              {bucket}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Scenario: choose an action ── */
export function ScenarioPreview() {
  const [choice, setChoice] = useState<number | null>(null);
  const scenario = "Your server returns HTTP 503. Users are reporting downtime. What do you do first?";
  const options = [
    "Restart the server immediately",
    "Check server logs for errors",
    "Send an email to the CEO",
    "Post on Twitter that it's fixed",
  ];
  const correct = 1;

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-4">
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Scenario</span>
        <p className="text-sm font-semibold text-ink dark:text-cream-soft leading-relaxed">{scenario}</p>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => choice === null && setChoice(i)}
              disabled={choice !== null}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                choice !== null && i === correct
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300"
                  : choice === i && i !== correct
                  ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600"
                  : "border-mist-green dark:border-[#2A3838] bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft hover:border-teal-dark/40 cursor-pointer"
              }`}
              whileTap={choice === null ? { scale: 0.98 } : {}}
            >
              {opt}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {choice !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs p-3 rounded-xl ${choice === correct ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}
            >
              {choice === correct ? "Correct! Diagnosing before acting is incident response 101." : "Not the best first step — always diagnose before acting."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Concept Breakdown: expand steps ── */
export function ConceptBreakdownPreview() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const steps = [
    { title: "Input Layer", desc: "Receives raw data (pixels, text, numbers)" },
    { title: "Hidden Layers", desc: "Transform data through weighted connections" },
    { title: "Activation Function", desc: "Decides if a neuron should fire" },
    { title: "Output Layer", desc: "Produces the final prediction" },
  ];

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-5 space-y-3">
        <p className="text-xs font-semibold text-ink dark:text-cream-soft">Neural Network — Tap each layer to learn more:</p>
        <div className="space-y-1.5">
          {steps.map((step, i) => (
            <div key={i}>
              <motion.button
                onClick={() => setExpanded(expanded === i ? null : i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                  expanded === i ? "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime" : "bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft hover:bg-mist-green/30"
                }`}
              >
                <span className="size-5 rounded-full bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                {step.title}
                <motion.span className="ml-auto text-grey-green" animate={{ rotate: expanded === i ? 180 : 0 }}>▾</motion.span>
              </motion.button>
              <AnimatePresence>
                {expanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-10 py-2 text-[11px] text-grey-green dark:text-[#8FA29B] leading-relaxed">{step.desc}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Exam Countdown: animated timer ── */
export function ExamCountdownPreview() {
  const [time, setTime] = React.useState(3 * 3600 + 24 * 60 + 15); // 3h 24m 15s
  React.useEffect(() => {
    const t = setInterval(() => setTime((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = time % 60;

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[340px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-6 text-center space-y-4">
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Exam Countdown</span>
        <p className="text-xs text-grey-green dark:text-[#8FA29B]">Linear Algebra Final</p>
        <div className="flex items-center justify-center gap-3">
          {[
            { val: h, label: "HRS" },
            { val: m, label: "MIN" },
            { val: s, label: "SEC" },
          ].map((unit, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="text-2xl font-bold text-teal-dark dark:text-accent-lime animate-pulse">:</span>}
              <div className="flex flex-col items-center">
                <motion.div
                  className="w-14 h-14 rounded-xl bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/20 dark:border-accent-lime/20 flex items-center justify-center"
                  key={unit.val}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xl font-bold text-teal-dark dark:text-accent-lime font-mono">
                    {String(unit.val).padStart(2, "0")}
                  </span>
                </motion.div>
                <span className="text-[9px] font-bold text-grey-green dark:text-[#8FA29B] mt-1">{unit.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Learning Path: animated steps ── */
export function LearningPathPreview() {
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setActive((prev) => (prev < 3 ? prev + 1 : 3)), 1500);
    return () => clearInterval(t);
  }, []);
  const steps = [
    { label: "Basics", done: true },
    { label: "Intermediate", done: true },
    { label: "Advanced", done: false },
    { label: "Expert", done: false },
  ];

  return (
    <div className="w-full h-[280px] flex items-center justify-center">
      <div className="w-full max-w-[380px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838] shadow-lg p-6 space-y-4">
        <p className="text-xs font-semibold text-ink dark:text-cream-soft">Your Learning Path — Calculus</p>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  className={`size-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                    i <= active
                      ? "bg-teal-dark dark:bg-accent-lime text-white dark:text-ink border-teal-dark dark:border-accent-lime"
                      : "bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] border-mist-green dark:border-[#2A3838]"
                  }`}
                  animate={i === active ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.6, repeat: i === active ? Infinity : 0, repeatDelay: 1 }}
                >
                  {step.done ? "✓" : i + 1}
                </motion.div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-6 transition-colors ${i < active ? "bg-teal-dark dark:bg-accent-lime" : "bg-mist-green dark:bg-[#2A3838]"}`} />
                )}
              </div>
              <div className="pt-1.5">
                <span className={`text-xs font-semibold ${i <= active ? "text-ink dark:text-cream-soft" : "text-grey-green dark:text-[#8FA29B]"}`}>{step.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
