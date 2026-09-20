/**
 * ChatComponentRenderer — renders structured LearningActivity payloads dynamically inside conversation turns.
 * Uses the same design system as the admin component library (InteractivePreviews.tsx).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Brain,
  Lightbulb,
  GripVertical,
  Calendar,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import {
  MatchingRenderer,
  OrderingRenderer,
  FillBlankRenderer,
  ScenarioRenderer,
  TrueFalseRenderer,
  PastQuestionRenderer,
  PredictedPracticeRenderer,
  MilestoneRenderer,
} from "./ExtraRenderers";

/* ── Shared helpers (matching admin library) ── */

function Badge({ children, color = "teal" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    teal: "bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 text-[#005A57] dark:text-[#B8FF4D]",
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
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 80);
    return () => clearTimeout(t);
  }, [value]);
  const pct = (animated / max) * 100;
  const barColor = color === "teal" ? "bg-[#005A57] dark:bg-[#B8FF4D]" : color === "amber" ? "bg-amber-500" : color === "red" ? "bg-red-500" : "bg-emerald-500";
  return (
    <div className="w-full h-2 bg-[#DDE8DF]/50 dark:bg-[#2A3838] rounded-full overflow-hidden">
      <div className={`h-full ${barColor} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export type ComponentData = {
  type:
    | "quiz"
    | "flashcards"
    | "study-plan"
    | "hexagon"
    | "graph"
    | "timeline"
    | "gap-analysis"
    | "comparison"
    | "hint-ladder"
    | "worked-example"
    | "short-answer"
    | "recall-prompt"
    | "matching"
    | "ordering"
    | "fill-blank"
    | "scenario"
    | "true-false"
    | "past-question"
    | "predicted-practice"
    | "milestone";
  [key: string]: any;
};

export type LearningActivityEnvelope = {
  id?: string;
  title?: string;
  type?: string;
  data: ComponentData;
  purpose?: string;
  difficulty?: string;
};

export function ChatComponentRenderer({
  activity,
  onInteractionComplete,
}: {
  activity: LearningActivityEnvelope;
  onInteractionComplete?: () => void;
}) {
  const data = activity.data;
  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  if (data.type === "quiz") {
    return <QuizRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }

  if (data.type === "flashcards") {
    return <FlashcardsRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }

  if (data.type === "comparison") {
    return <ComparisonRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }

  if (data.type === "hint-ladder") {
    return <HintLadderRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }

  if (data.type === "worked-example") {
    return <WorkedExampleRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }

  if (data.type === "short-answer" || data.type === "recall-prompt") {
    return <ShortAnswerRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }

  if (data.type === "matching") {
    return <MatchingRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }
  if (data.type === "ordering") {
    return <OrderingRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }
  if (data.type === "fill-blank") {
    return <FillBlankRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }
  if (data.type === "scenario") {
    return <ScenarioRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }
  if (data.type === "true-false") {
    return <TrueFalseRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }
  if (data.type === "past-question") {
    return <PastQuestionRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }
  if (data.type === "predicted-practice") {
    return <PredictedPracticeRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }
  if (data.type === "milestone") {
    return <MilestoneRenderer data={data} activityId={activity.id} onComplete={onInteractionComplete} />;
  }

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="flex items-center gap-2 font-medium text-[#005A57] dark:text-[#B8FF4D] mb-1">
        <Sparkles className="h-4 w-4" />
        <span>{activity.title || data.title || "Interactive Component"}</span>
      </div>
      <pre className="mt-2 overflow-x-auto text-xs text-[#6D7E78] dark:text-[#8FA29B] opacity-80">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function ComparisonRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3">
        <Badge color="teal">Compare & Contrast</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[#005A57]/5 dark:bg-[#B8FF4D]/5 border border-[#005A57]/20 dark:border-[#B8FF4D]/20 space-y-2">
          <h4 className="text-xs font-bold text-[#005A57] dark:text-[#B8FF4D]">{data.conceptA}</h4>
          <ul className="space-y-1.5 text-[11px] text-[#102B2B] dark:text-[#F5F3EC]">
            {data.distinctions?.map((d: any, idx: number) => (
              <li key={idx} className="flex items-start gap-1.5">
                <Check size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                {d.conceptA}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 space-y-2">
          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400">{data.conceptB}</h4>
          <ul className="space-y-1.5 text-[11px] text-[#102B2B] dark:text-[#F5F3EC]">
            {data.distinctions?.map((d: any, idx: number) => (
              <li key={idx} className="flex items-start gap-1.5">
                <Check size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                {d.conceptB}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {data.insight && (
        <div className="mt-3 p-3 rounded-xl bg-[#FBFAF6] dark:bg-[#232D2D] border border-[#DDE8DF] dark:border-[#2A3838]">
          <p className="text-[11px] text-[#102B2B] dark:text-[#F5F3EC]">
            <strong className="text-[#005A57] dark:text-[#B8FF4D]">Key insight:</strong> {data.insight}
          </p>
        </div>
      )}
    </div>
  );
}

function HintLadderRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const [hintLevel, setHintLevel] = useState(0);
  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <Badge color="amber">Hint Ladder</Badge>
        <span className="font-mono text-[10px] text-[#6D7E78] dark:text-[#8FA29B]">Hints ({hintLevel}/{data.hints?.length || 0})</span>
      </div>
      <p className="text-sm font-semibold mb-3 text-[#102B2B] dark:text-[#F5F3EC]">{data.problem}</p>
      <div className="space-y-2">
        {data.hints?.slice(0, hintLevel).map((h: any, idx: number) => (
          <div key={idx} className="rounded-xl border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10 p-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Lightbulb size={12} className="text-amber-600 dark:text-amber-400" />
              <span className="font-bold text-amber-700 dark:text-amber-300">Hint {h.stepNumber || idx + 1}</span>
            </div>
            <p className="text-amber-800 dark:text-amber-200">{h.hintText}</p>
          </div>
        ))}
      </div>
      <div className="mt-3">
        {hintLevel < (data.hints?.length || 0) ? (
          <button
            onClick={() => setHintLevel((prev) => prev + 1)}
            className="px-4 py-2 rounded-xl border border-[#005A57]/30 dark:border-[#B8FF4D]/30 bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 text-[#005A57] dark:text-[#B8FF4D] text-xs font-semibold hover:bg-[#005A57]/20 dark:hover:bg-[#B8FF4D]/20 transition-colors"
          >
            Reveal Hint {hintLevel + 1}
          </button>
        ) : (
          <p className="text-[11px] text-[#6D7E78] dark:text-[#8FA29B] italic">All hints revealed</p>
        )}
      </div>
    </div>
  );
}

function WorkedExampleRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3">
        <Badge color="green">Worked Example</Badge>
      </div>
      <p className="text-sm font-semibold mb-3 text-[#102B2B] dark:text-[#F5F3EC]">{data.problem}</p>
      <div className="space-y-2">
        {data.steps?.map((s: any, idx: number) => (
          <div key={idx} className="rounded-xl border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50 dark:bg-emerald-900/10 p-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="size-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300">{s.step}</span>
            </div>
            <p className="text-emerald-800 dark:text-emerald-200 ml-7">{s.explanation}</p>
          </div>
        ))}
      </div>
      {data.takeaway && (
        <div className="mt-3 p-3 rounded-xl bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 border border-[#005A57]/20 dark:border-[#B8FF4D]/20">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={12} className="text-[#005A57] dark:text-[#B8FF4D]" />
            <span className="text-xs font-bold text-[#005A57] dark:text-[#B8FF4D]">Key Takeaway</span>
          </div>
          <p className="text-xs text-[#102B2B] dark:text-[#F5F3EC]">{data.takeaway}</p>
        </div>
      )}
    </div>
  );
}

function ShortAnswerRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const [ans, setAns] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      <div className="mb-3">
        <Badge color={data.type === "recall-prompt" ? "purple" : "blue"}>
          {data.type === "recall-prompt" ? "Active Recall" : "Short Answer"}
        </Badge>
      </div>
      <p className="text-sm font-semibold mb-3 text-[#102B2B] dark:text-[#F5F3EC]">{data.question || data.prompt}</p>
      {!submitted ? (
        <div className="space-y-3">
          <textarea
            value={ans}
            onChange={(e) => setAns(e.target.value)}
            placeholder="Type your answer here..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#DDE8DF] dark:border-[#2A3838] bg-white dark:bg-[#1C2323] text-sm text-[#102B2B] dark:text-[#F5F3EC] placeholder:text-[#6D7E78] dark:placeholder:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-[#005A57] dark:focus:ring-[#B8FF4D] resize-none transition"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                if (!ans.trim()) return;
                setSubmitted(true);
                try {
                  await fetchApi("/interactions/quiz-result", {
                    method: "POST",
                    body: JSON.stringify({
                      artifact_id: activityId || "short-answer",
                      topic: data.question || data.prompt,
                      score: 100,
                      answers: { answer: ans },
                    }),
                  });
                } catch (e) {}
                if (onComplete) onComplete();
              }}
              disabled={!ans.trim()}
              className="px-5 py-2 rounded-xl bg-[#005A57] dark:bg-[#B8FF4D] text-white dark:text-[#003F3F] text-xs font-bold disabled:opacity-40 cursor-pointer flex items-center gap-2 transition-opacity"
            >
              <Check size={14} /> Submit
            </button>
            <span className="text-[11px] text-[#6D7E78] dark:text-[#8FA29B]">{ans.length} characters</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 border border-[#005A57]/20 dark:border-[#B8FF4D]/20 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <Check size={12} className="text-[#005A57] dark:text-[#B8FF4D]" />
              <span className="font-semibold text-[#005A57] dark:text-[#B8FF4D]">Answer Submitted</span>
            </div>
            <p className="text-[#102B2B] dark:text-[#F5F3EC] italic">"{ans}"</p>
          </div>
          {(data.sampleAnswer || data.answer) && (
            <div className="p-3 rounded-xl bg-white dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838]">
              <div className="flex items-center gap-2 mb-1">
                <Brain size={12} className="text-[#005A57] dark:text-[#B8FF4D]" />
                <span className="text-xs font-semibold text-[#102B2B] dark:text-[#F5F3EC]">Model Answer</span>
              </div>
              <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B]">{data.sampleAnswer || data.answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function QuizRenderer({
  data,
  activityId,
  onComplete,
}: {
  data: any;
  activityId?: string;
  onComplete?: () => void;
}) {
  const questions = data.questions || [];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState<(boolean)[]>(() => Array(questions.length).fill(false));
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = questions[currentIdx];
  const allSubmitted = submitted.every(Boolean);
  const isLastQuestion = currentIdx === questions.length - 1;
  const isFirstQuestion = currentIdx === 0;

  // Overall timer
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Per-question timer — resets on question change
  useEffect(() => {
    setQuestionElapsed(0);
    questionTimerRef.current = setInterval(() => setQuestionElapsed((t) => t + 1), 1000);
    return () => { if (questionTimerRef.current) clearInterval(questionTimerRef.current); };
  }, [currentIdx]);

  // Stop timers when all questions are answered
  useEffect(() => {
    if (allSubmitted) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    }
  }, [allSubmitted]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (allSubmitted && !isLastQuestion) {
        if (e.key === "ArrowRight" || e.key === "Enter") {
          e.preventDefault();
          goNext();
        }
        return;
      }
      if (submitted[currentIdx]) return;
      // 1-4 keys for options
      const num = parseInt(e.key);
      if (num >= 1 && num <= (q?.options?.length || 0)) {
        handleOptionSelect(num - 1);
      }
      // Arrow keys for navigation (when not selecting)
      if (e.key === "ArrowLeft" && !isFirstQuestion) {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight" && submitted[currentIdx] && !isLastQuestion) {
        e.preventDefault();
        goNext();
      }
    }
    containerRef.current?.addEventListener("keydown", handleKeyDown);
    return () => containerRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [currentIdx, submitted, q, allSubmitted, isFirstQuestion, isLastQuestion]);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleOptionSelect(idx: number) {
    if (submitted[currentIdx]) return;
    const newAnswers = [...answers];
    newAnswers[currentIdx] = idx;
    setAnswers(newAnswers);

    const newSubmitted = [...submitted];
    newSubmitted[currentIdx] = true;
    setSubmitted(newSubmitted);

    const isCorrect = idx === q.correctIndex;
    if (isCorrect) setScore((s) => s + 1);

    try {
      await fetchApi("/interactions/quiz-result", {
        method: "POST",
        body: JSON.stringify({
          artifact_id: activityId || "quiz-component",
          topic: q.question,
          score: isCorrect ? 100 : 0,
          answers: { selected: idx, correct: q.correctIndex, time_ms: questionElapsed * 1000 },
        }),
      });
    } catch (e) {
      console.warn("Failed to record quiz result", e);
    }

    if (onComplete) onComplete();
  }

  function goNext() {
    if (isLastQuestion) return;
    setCurrentIdx((i) => Math.min(i + 1, questions.length - 1));
  }

  function goPrev() {
    if (isFirstQuestion) return;
    setCurrentIdx((i) => Math.max(i - 1, 0));
  }

  function resetQuiz() {
    setCurrentIdx(0);
    setAnswers(Array(questions.length).fill(null));
    setSubmitted(Array(questions.length).fill(false));
    setScore(0);
    setElapsed(0);
    setQuestionElapsed(0);
    timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
  }

  // Score summary when all questions are answered
  if (allSubmitted) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6D7E78] dark:text-[#8FA29B] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-[#E9B8A7] dark:text-[#B8FF4D]" />
            Quiz Complete
          </span>
          <span className="font-mono text-[10px]">{formatTime(elapsed)}</span>
        </div>

        {/* Score display */}
        <div className="flex items-center justify-center py-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-[#DDE8DF]/30 dark:text-[#2A3838]/30" />
              <circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * pct) / 100}
                className={pct >= 70 ? "text-[#005A57] dark:text-[#B8FF4D]" : pct >= 40 ? "text-[#E9B8A7] dark:text-[#E9B8A7]" : "text-[#be747e] dark:text-[#be747e]"}
                stroke="currentColor"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#102B2B] dark:text-[#F5F3EC]">{pct}%</span>
              <span className="text-[10px] text-[#6D7E78] dark:text-[#8FA29B]">{score}/{questions.length}</span>
            </div>
          </div>
        </div>

        {/* Per-question breakdown */}
        <div className="space-y-1.5 mb-3">
          {questions.map((question: any, idx: number) => {
            const wasCorrect = answers[idx] === question.correctIndex;
            const chosenOption = question.options?.[answers[idx] ?? -1];
            return (
              <div
                key={idx}
                className={`flex items-center gap-2 rounded-[12px] border p-2 text-xs ${
                  wasCorrect
                    ? "border-[#005A57]/30 dark:border-[#B8FF4D]/30 bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 text-[#005A57] dark:text-[#B8FF4D]"
                    : "border-[#be747e]/30 bg-[#be747e]/10 text-[#be747e]"
                }`}
              >
                {wasCorrect ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <X className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate flex-1">{question.question}</span>
                {!wasCorrect && chosenOption && (
                  <span className="text-[10px] opacity-70 shrink-0 hidden sm:inline">Your: {chosenOption}</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={resetQuiz}
          className="w-full flex items-center justify-center gap-2 rounded-[14px] border border-[#005A57]/30 dark:border-[#B8FF4D]/30 bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 py-2 text-xs font-semibold text-[#005A57] dark:text-[#B8FF4D] hover:bg-[#005A57]/20 dark:hover:bg-[#B8FF4D]/20 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Try Again
        </button>
      </div>
    );
  }

  if (!q) return null;

  const selectedOpt = answers[currentIdx];
  const isSubmitted = submitted[currentIdx];
  const isCorrect = selectedOpt === q.correctIndex;

  return (
    <div ref={containerRef} tabIndex={0} className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md outline-none">
      {/* Header: progress + timer */}
      <div className="mb-3 flex items-center justify-between text-xs text-[#6D7E78] dark:text-[#8FA29B]">
        <span className="font-semibold uppercase tracking-wider text-[#005A57] dark:text-[#B8FF4D]">
          Quiz ({currentIdx + 1}/{questions.length})
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[11px] text-[#6D7E78]/70 dark:text-[#8FA29B]/70">
            <Clock className="h-3 w-3" />
            {formatTime(elapsed)}
          </span>
          {isSubmitted && (
            <span className={isCorrect ? "text-[#005A57] dark:text-[#B8FF4D] font-semibold" : "text-[#be747e] font-semibold"}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1 w-full rounded-full bg-[#DDE8DF]/30 dark:bg-[#2A3838]/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#005A57] to-[#B8FF4D] dark:from-[#B8FF4D] dark:to-[#005A57] transition-all duration-300"
          style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <p className="mb-3 font-medium text-[#102B2B] dark:text-[#F5F3EC] text-sm">{q.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {q.options?.map((opt: string, idx: number) => {
          const optionKey = String.fromCharCode(65 + idx); // A, B, C, D
          let stateClass = "border-[#DDE8DF] dark:border-[#2A3838] hover:border-[#005A57]/50 dark:hover:border-[#B8FF4D]/50 hover:bg-[#005A57]/5 dark:hover:bg-[#B8FF4D]/5 bg-white/40 dark:bg-[#232D2D]/40";
          if (isSubmitted) {
            if (idx === q.correctIndex) {
              stateClass = "border-[#005A57]/60 dark:border-[#B8FF4D]/60 bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 text-[#005A57] dark:text-[#B8FF4D]";
            } else if (idx === selectedOpt) {
              stateClass = "border-[#be747e]/60 bg-[#be747e]/10 text-[#be747e]";
            } else {
              stateClass = "border-[#DDE8DF]/50 dark:border-[#2A3838]/50 bg-[#DDE8DF]/10 dark:bg-[#232D2D]/10 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              disabled={isSubmitted}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full flex items-center gap-3 text-left text-xs p-2.5 md:p-3 rounded-[14px] border transition-all ${stateClass}`}
            >
              <span className="shrink-0 w-6 h-6 rounded-[10px] border border-current/30 flex items-center justify-center text-[10px] font-bold opacity-70">
                {optionKey}
              </span>
              <span className="flex-1">{opt}</span>
              {isSubmitted && idx === q.correctIndex && (
                <Check className="h-3.5 w-3.5 shrink-0 text-[#005A57] dark:text-[#B8FF4D]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {isSubmitted && q.explanation && (
        <div className="mt-3 rounded-[12px] bg-[#005A57]/5 dark:bg-[#B8FF4D]/5 p-2.5 text-xs text-[#005A57] dark:text-[#B8FF4D] border border-[#005A57]/20 dark:border-[#B8FF4D]/20">
          <HelpCircle className="inline h-3.5 w-3.5 mr-1" />
          {q.explanation}
        </div>
      )}

      {/* Navigation: prev / next */}
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={isFirstQuestion}
          className="flex items-center gap-1 rounded-[12px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/40 dark:bg-[#232D2D]/40 px-3 py-1.5 text-xs text-[#6D7E78] dark:text-[#8FA29B] hover:bg-[#DDE8DF]/50 dark:hover:bg-[#2A3838]/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </button>

        <div className="flex items-center gap-1">
          {questions.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIdx
                  ? "bg-[#005A57] dark:bg-[#B8FF4D] w-4"
                  : submitted[idx]
                    ? answers[idx] === questions[idx].correctIndex
                      ? "bg-[#005A57] dark:bg-[#B8FF4D]"
                      : "bg-[#be747e]"
                    : "bg-[#DDE8DF] dark:bg-[#2A3838]"
              }`}
              aria-label={`Go to question ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goNext}
          disabled={isLastQuestion}
          className="flex items-center gap-1 rounded-[12px] border border-[#005A57]/30 dark:border-[#B8FF4D]/30 bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 px-3 py-1.5 text-xs text-[#005A57] dark:text-[#B8FF4D] hover:bg-[#005A57]/20 dark:hover:bg-[#B8FF4D]/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="mt-2 text-center text-[10px] text-[#6D7E78]/50 dark:text-[#8FA29B]/50">
        Press <kbd className="px-1 py-0.5 rounded border border-[#DDE8DF]/30 dark:border-[#2A3838]/30 bg-white/20 dark:bg-[#232D2D]/20 text-[9px]">1</kbd>-<kbd className="px-1 py-0.5 rounded border border-[#DDE8DF]/30 dark:border-[#2A3838]/30 bg-white/20 dark:bg-[#232D2D]/20 text-[9px]">4</kbd> to select · <kbd className="px-1 py-0.5 rounded border border-[#DDE8DF]/30 dark:border-[#2A3838]/30 bg-white/20 dark:bg-[#232D2D]/20 text-[9px]">←</kbd> <kbd className="px-1 py-0.5 rounded border border-[#DDE8DF]/30 dark:border-[#2A3838]/30 bg-white/20 dark:bg-[#232D2D]/20 text-[9px]">→</kbd> to navigate
      </div>
    </div>
  );
}

function FlashcardsRenderer({
  data,
  activityId,
  onComplete,
}: {
  data: any;
  activityId?: string;
  onComplete?: () => void;
}) {
  const cards = data.cards || [];
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = cards[cardIdx];
  if (!card) return null;

  const progress = cards.length > 0 ? ((cardIdx + 1) / cards.length) * 100 : 0;

  async function handleRating(rating: "again" | "hard" | "good" | "easy") {
    try {
      await fetchApi("/interactions/quiz-result", {
        method: "POST",
        body: JSON.stringify({
          artifact_id: activityId || "flashcards-component",
          topic: card.front,
          score: rating === "good" || rating === "easy" ? 100 : 0,
          answers: { rating },
        }),
      });
    } catch (e) {
      console.warn("Failed to record flashcard review", e);
    }

    setFlipped(false);
    if (cardIdx + 1 < cards.length) {
      setCardIdx(cardIdx + 1);
    }
    if (onComplete) onComplete();
  }

  return (
    <div className="my-3 rounded-[17px] border border-[#DDE8DF] dark:border-[#2A3838] bg-white/60 dark:bg-[#1C2323]/60 p-4 md:p-5 shadow-[0_9px_20px_rgba(111,131,198,.06)] backdrop-blur-md">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <Badge color="teal">Flashcard</Badge>
        <span className="font-mono text-[10px] text-[#6D7E78] dark:text-[#8FA29B]">{cardIdx + 1}/{cards.length}</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 rounded-full bg-[#DDE8DF]/30 dark:bg-[#2A3838]/30 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#005A57] to-[#B8FF4D] dark:from-[#B8FF4D] dark:to-[#005A57] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 3D Flip Card (matching admin library FlashcardPreview) */}
      <div
        className="w-full cursor-pointer"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative w-full min-h-[180px] transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl bg-white dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] shadow-lg flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Badge color="teal">Question</Badge>
            <p className="text-base font-semibold text-[#102B2B] dark:text-[#F5F3EC] text-center leading-relaxed mt-3">
              {card.front}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#6D7E78] dark:text-[#8FA29B]">
              <RotateCcw size={12} /> Tap to flip
            </div>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#005A57] dark:bg-[#B8FF4D]/20 border border-[#005A57]/30 dark:border-[#B8FF4D]/30 shadow-lg flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <Badge color="green">Answer</Badge>
            <p className="text-base font-semibold text-white dark:text-[#B8FF4D] text-center leading-relaxed mt-3">
              {card.back}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-[11px] text-white/60 dark:text-[#B8FF4D]/60">
              <RotateCcw size={12} /> Tap to flip back
            </div>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {(["again", "hard", "good", "easy"] as const).map((r) => {
            const isPositive = r === "good" || r === "easy";
            return (
              <button
                key={r}
                onClick={(e) => { e.stopPropagation(); handleRating(r); }}
                className={`rounded-[12px] border py-2 text-xs font-semibold capitalize transition-colors ${
                  isPositive
                    ? "border-[#005A57]/30 dark:border-[#B8FF4D]/30 bg-[#005A57]/10 dark:bg-[#B8FF4D]/10 text-[#005A57] dark:text-[#B8FF4D] hover:bg-[#005A57]/20 dark:hover:bg-[#B8FF4D]/20"
                    : "border-[#DDE8DF] dark:border-[#2A3838] bg-white/40 dark:bg-[#232D2D]/40 text-[#6D7E78] dark:text-[#8FA29B] hover:bg-[#DDE8DF]/50 dark:hover:bg-[#2A3838]/50"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
