import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, Lightbulb, Brain, Trophy } from "lucide-react";

function Badge({ children, color = "teal" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    teal: "bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 text-[#005A57] dark:text-[#B8FF4D]",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    green: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[color]}`}>{children}</span>;
}

export function MatchingRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const pairs = data.pairs || [];
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const leftItems = pairs.map((p: any) => p.left || p.term);
  const rightItems = pairs.map((p: any) => p.right || p.definition);
  const shuffledRight = [...rightItems].sort(() => Math.random() - 0.5);

  function handleRightClick(rightIdx: number) {
    if (submitted || selectedLeft === null) return;
    setMatches({ ...matches, [selectedLeft]: rightIdx });
    setSelectedLeft(null);
  }

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3"><Badge color="purple">Matching</Badge></div>
      <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mb-3">Select a term on the left, then click its match on the right.</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {leftItems.map((item: string, idx: number) => (
            <button key={idx} onClick={() => !submitted && setSelectedLeft(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                selectedLeft === idx ? "border-[#005A57] dark:border-[#B8FF4D] bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 ring-2 ring-[#005A57]/30"
                  : matches[idx] !== undefined ? "border-[#005A57]/40 bg-[#005A57]/5"
                  : "border-[#DDE8DF] dark:border-[#2A3838] hover:border-[#005A57]/50"
              }`}>
              <span className="font-semibold text-[#102B2B] dark:text-[#F5F3EC]">{item}</span>
              {matches[idx] !== undefined && (
                <span className="block text-[10px] text-[#005A57] dark:text-[#B8FF4D] mt-1">&gt; {shuffledRight[matches[idx]]}</span>
              )}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shuffledRight.map((item: string, idx: number) => (
            <button key={idx} onClick={() => handleRightClick(idx)}
              className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                Object.values(matches).includes(idx) ? "border-[#005A57]/40 bg-[#005A57]/5 opacity-70"
                  : "border-[#DDE8DF] dark:border-[#2A3838] hover:border-blue-400"
              }`}>
              <span className="text-[#102B2B] dark:text-[#F5F3EC]">{item}</span>
            </button>
          ))}
        </div>
      </div>
      {Object.keys(matches).length === pairs.length && !submitted && (
        <button onClick={() => { setSubmitted(true); onComplete?.(); }}
          className="mt-3 w-full py-2 rounded-xl bg-[#005A57] dark:bg-[#B8FF4D] text-white dark:text-[#003F3F] text-xs font-bold">
          <Check size={14} className="inline mr-1" /> Check Matches
        </button>
      )}
    </div>
  );
}

export function OrderingRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const items = data.items || data.steps || [];
  const [ordered, setOrdered] = useState<string[]>(() => [...items].sort(() => Math.random() - 0.5));
  const [submitted, setSubmitted] = useState(false);

  function moveItem(from: number, dir: -1 | 1) {
    const to = from + dir;
    if (to < 0 || to >= ordered.length) return;
    const arr = [...ordered];
    [arr[from], arr[to]] = [arr[to], arr[from]];
    setOrdered(arr);
  }

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3"><Badge color="blue">Ordering</Badge></div>
      <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mb-3">Arrange items in the correct order.</p>
      <div className="space-y-2">
        {ordered.map((item: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border border-[#DDE8DF] dark:border-[#2A3838] bg-white/40 dark:bg-[#232D2D]/40">
            <span className="size-6 rounded-full bg-[#005A57] dark:bg-[#B8FF4D] text-white dark:text-[#003F3F] text-[10px] font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
            <span className="flex-1 text-xs text-[#102B2B] dark:text-[#F5F3EC]">{item}</span>
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveItem(idx, -1)} disabled={idx === 0} className="p-0.5 text-[#6D7E78] hover:text-[#005A57] disabled:opacity-30 cursor-pointer"><ChevronLeft size={12} /></button>
              <button onClick={() => moveItem(idx, 1)} disabled={idx === ordered.length - 1} className="p-0.5 text-[#6D7E78] hover:text-[#005A57] disabled:opacity-30 cursor-pointer"><ChevronRight size={12} /></button>
            </div>
          </div>
        ))}
      </div>
      {!submitted && (
        <button onClick={() => { setSubmitted(true); onComplete?.(); }} className="mt-3 w-full py-2 rounded-xl bg-[#005A57] dark:bg-[#B8FF4D] text-white dark:text-[#003F3F] text-xs font-bold">
          <Check size={14} className="inline mr-1" /> Submit Order
        </button>
      )}
    </div>
  );
}

export function FillBlankRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const items = data.items || data.questions || [];
  const [answers, setAnswers] = useState<string[]>(() => Array(items.length).fill(""));
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3"><Badge color="green">Fill in the Blank</Badge></div>
      <div className="space-y-3">
        {items.map((item: any, idx: number) => {
          const parts = (item.text || item.question || "").split("___");
          return (
            <div key={idx} className="rounded-xl border border-[#DDE8DF] dark:border-[#2A3838] bg-white/40 dark:bg-[#232D2D]/40 p-3">
              <div className="text-xs text-[#102B2B] dark:text-[#F5F3EC] flex flex-wrap items-center gap-1">
                {parts.map((part: string, pIdx: number) => (
                  <span key={pIdx} className="inline-flex items-center">
                    <span>{part}</span>
                    {pIdx < parts.length - 1 && (
                      <input value={answers[idx] || ""} disabled={submitted} placeholder="..."
                        onChange={(e) => { const a = [...answers]; a[idx] = e.target.value; setAnswers(a); }}
                        className="mx-1 w-24 px-2 py-1 rounded-lg border border-[#005A57]/30 dark:border-[#B8FF4D]/30 bg-white dark:bg-[#1C2323] text-xs text-[#102B2B] dark:text-[#F5F3EC] focus:outline-none focus:ring-1 focus:ring-[#005A57]" />
                    )}
                  </span>
                ))}
              </div>
              {submitted && item.answer && <p className="mt-1.5 text-[10px] text-[#005A57] dark:text-[#B8FF4D]">Answer: {item.answer}</p>}
            </div>
          );
        })}
      </div>
      {!submitted && (
        <button onClick={() => { setSubmitted(true); onComplete?.(); }} className="mt-3 w-full py-2 rounded-xl bg-[#005A57] dark:bg-[#B8FF4D] text-white dark:text-[#003F3F] text-xs font-bold">
          <Check size={14} className="inline mr-1" /> Check Answers
        </button>
      )}
    </div>
  );
}

export function ScenarioRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const options = data.options || [];

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3"><Badge color="amber">Scenario</Badge></div>
      <div className="p-3 rounded-xl bg-[#FBFAF6] dark:bg-[#232D2D] border border-[#DDE8DF] dark:border-[#2A3838] mb-3">
        <p className="text-xs text-[#102B2B] dark:text-[#F5F3EC] leading-relaxed">{data.scenario || data.context}</p>
      </div>
      <p className="text-sm font-semibold text-[#102B2B] dark:text-[#F5F3EC] mb-3">{data.question}</p>
      <div className="space-y-2">
        {options.map((opt: string, idx: number) => (
          <button key={idx} disabled={submitted} onClick={() => { setSelected(idx); setSubmitted(true); onComplete?.(); }}
            className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
              submitted && idx === selected
                ? idx === (data.correctIndex ?? -1) ? "border-[#005A57]/60 bg-[#005A57]/10 text-[#005A57] dark:text-[#B8FF4D]"
                  : "border-[#be747e]/60 bg-[#be747e]/10 text-[#be747e]"
                : "border-[#DDE8DF] dark:border-[#2A3838] hover:border-[#005A57]/50 bg-white/40 dark:bg-[#232D2D]/40"
            }`}>
            <span className="font-semibold mr-2 opacity-60">{String.fromCharCode(65 + idx)}.</span>
            <span className="text-[#102B2B] dark:text-[#F5F3EC]">{opt}</span>
            {submitted && idx === (data.correctIndex ?? -1) && <Check size={12} className="inline ml-2 text-[#005A57] dark:text-[#B8FF4D]" />}
          </button>
        ))}
      </div>
      {submitted && data.explanation && (
        <div className="mt-3 p-3 rounded-xl bg-[#005A57]/5 dark:bg-[#B8FF4D]/5 border border-[#005A57]/20 text-xs text-[#005A57] dark:text-[#B8FF4D]">
          <Lightbulb size={12} className="inline mr-1" /> {data.explanation}
        </div>
      )}
    </div>
  );
}

export function TrueFalseRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const [selected, setSelected] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleChoice(val: boolean) {
    setSelected(val);
    setSubmitted(true);
    onComplete?.();
  }

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3"><Badge color="teal">True or False</Badge></div>
      <p className="text-sm font-semibold text-[#102B2B] dark:text-[#F5F3EC] mb-4">{data.statement || data.question}</p>
      <div className="grid grid-cols-2 gap-3">
        {[true, false].map((val) => {
          const isCorrect = val === data.correctAnswer;
          const isSelected = selected === val;
          return (
            <button key={String(val)} disabled={submitted} onClick={() => handleChoice(val)}
              className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                submitted && isSelected
                  ? isCorrect ? "border-[#005A57]/60 bg-[#005A57]/10 text-[#005A57] dark:text-[#B8FF4D]"
                    : "border-[#be747e]/60 bg-[#be747e]/10 text-[#be747e]"
                  : "border-[#DDE8DF] dark:border-[#2A3838] hover:border-[#005A57]/50 bg-white/40 dark:bg-[#232D2D]/40 text-[#102B2B] dark:text-[#F5F3EC]"
              }`}>
              {val ? "True" : "False"}
              {submitted && isCorrect && <Check size={12} className="inline ml-1" />}
            </button>
          );
        })}
      </div>
      {submitted && data.explanation && (
        <div className="mt-3 p-3 rounded-xl bg-[#005A57]/5 dark:bg-[#B8FF4D]/5 border border-[#005A57]/20 text-xs text-[#005A57] dark:text-[#B8FF4D]">
          <Lightbulb size={12} className="inline mr-1" /> {data.explanation}
        </div>
      )}
    </div>
  );
}

export function PastQuestionRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const [ans, setAns] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2">
        <Badge color="amber">Past Question</Badge>
        {data.year && <span className="text-[10px] font-mono text-[#6D7E78] dark:text-[#8FA29B]">{data.year}</span>}
        {data.marks > 0 && <span className="text-[10px] text-[#6D7E78] dark:text-[#8FA29B]">({data.marks} marks)</span>}
      </div>
      <p className="text-sm font-semibold text-[#102B2B] dark:text-[#F5F3EC] mb-3">{data.question}</p>
      {!submitted ? (
        <div className="space-y-3">
          <textarea value={ans} onChange={(e) => setAns(e.target.value)} rows={4} placeholder="Write your answer..."
            className="w-full px-4 py-3 rounded-xl border border-[#DDE8DF] dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-sm text-[#102B2B] dark:text-[#F5F3EC] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] resize-none" />
          <button onClick={() => { setSubmitted(true); onComplete?.(); }} disabled={!ans.trim()}
            className="px-5 py-2 rounded-xl bg-[#005A57] dark:bg-[#B8FF4D] text-white dark:text-[#003F3F] text-xs font-bold disabled:opacity-40 cursor-pointer">
            <Check size={14} className="inline mr-1" /> Submit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 border border-[#005A57]/20 text-xs">
            <p className="font-semibold text-[#005A57] dark:text-[#B8FF4D] mb-1">Your Answer</p>
            <p className="text-[#102B2B] dark:text-[#F5F3EC]">{ans}</p>
          </div>
          {data.modelAnswer && (
            <div className="p-3 rounded-xl bg-white dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838]">
              <p className="text-xs font-semibold text-[#102B2B] dark:text-[#F5F3EC] mb-1"><Brain size={12} className="inline mr-1" />Model Answer</p>
              <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B]">{data.modelAnswer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PredictedPracticeRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const [ans, setAns] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3 flex items-center gap-2">
        <Badge color="purple">Predicted Practice</Badge>
        {data.structural_basis && <span className="text-[10px] text-[#6D7E78] dark:text-[#8FA29B]">{data.structural_basis}</span>}
      </div>
      <p className="text-sm font-semibold text-[#102B2B] dark:text-[#F5F3EC] mb-3">{data.practice_question}</p>
      {data.rubric && (
        <div className="mb-3 p-3 rounded-xl bg-[#FBFAF6] dark:bg-[#232D2D] border border-[#DDE8DF] dark:border-[#2A3838]">
          <p className="text-[10px] font-bold text-[#6D7E78] dark:text-[#8FA29B] uppercase mb-1">Assessment Criteria</p>
          <ul className="space-y-1">
            {data.rubric.map((r: string, i: number) => (
              <li key={i} className="text-[11px] text-[#102B2B] dark:text-[#F5F3EC] flex items-start gap-1.5">
                <Check size={10} className="text-[#005A57] dark:text-[#B8FF4D] mt-0.5 shrink-0" /> {r}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!submitted ? (
        <div className="space-y-3">
          <textarea value={ans} onChange={(e) => setAns(e.target.value)} rows={4} placeholder="Write your answer..."
            className="w-full px-4 py-3 rounded-xl border border-[#DDE8DF] dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-sm text-[#102B2B] dark:text-[#F5F3EC] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] resize-none" />
          <button onClick={() => { setSubmitted(true); onComplete?.(); }} disabled={!ans.trim()}
            className="px-5 py-2 rounded-xl bg-[#005A57] dark:bg-[#B8FF4D] text-white dark:text-[#003F3F] text-xs font-bold disabled:opacity-40 cursor-pointer">
            <Check size={14} className="inline mr-1" /> Submit
          </button>
        </div>
      ) : (
        <div className="p-3 rounded-xl bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 border border-[#005A57]/20 text-xs">
          <p className="font-semibold text-[#005A57] dark:text-[#B8FF4D] mb-1">Answer Submitted</p>
          <p className="text-[#102B2B] dark:text-[#F5F3EC] italic">{ans}</p>
        </div>
      )}
    </div>
  );
}

export function MilestoneRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const progress = data.progress ?? 0;
  const target = data.target ?? 100;
  const pct = Math.min(100, Math.round((progress / target) * 100));

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3"><Badge color="green">Milestone</Badge></div>
      <p className="text-sm font-semibold text-[#102B2B] dark:text-[#F5F3EC] mb-2">{data.title || "Achievement Unlocked"}</p>
      {data.description && <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B] mb-3">{data.description}</p>}
      <div className="h-3 rounded-full bg-[#DDE8DF]/30 dark:bg-[#2A3838]/30 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#005A57] to-[#B8FF4D] transition-all duration-700"
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-[#6D7E78] dark:text-[#8FA29B]">
        <span>{progress}/{target}</span>
        <span>{pct}%</span>
      </div>
      {pct >= 100 && (
        <div className="mt-3 p-3 rounded-xl bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 border border-[#005A57]/20 dark:border-[#B8FF4D]/20 text-center">
          <Trophy size={20} className="mx-auto text-[#E9B8A7] dark:text-[#B8FF4D] mb-1" />
          <p className="text-xs font-bold text-[#005A57] dark:text-[#B8FF4D]">Milestone Complete!</p>
        </div>
      )}
    </div>
  );
}
