/**
 * ChatComponentRenderer — renders structured LearningActivity payloads dynamically inside conversation turns.
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
} from "lucide-react";
import { fetchApi } from "@/lib/api";

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
    | "recall-prompt";
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

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-4 text-sm text-foreground">
      <div className="flex items-center gap-2 font-medium text-indigo-400 mb-1">
        <Sparkles className="h-4 w-4" />
        <span>{activity.title || data.title || "Interactive Component"}</span>
      </div>
      <pre className="mt-2 overflow-x-auto text-xs opacity-80">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

function ComparisonRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  return (
    <div className="my-3 rounded-2xl border border-indigo-500/30 bg-background/60 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
        Compare & Contrast: {data.conceptA} vs {data.conceptB}
      </div>
      <div className="space-y-2.5">
        {data.distinctions?.map((d: any, idx: number) => (
          <div key={idx} className="rounded-lg border border-border/40 bg-secondary/20 p-3 text-xs">
            <div className="font-semibold text-indigo-300 mb-1">{d.aspect}</div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <div className="bg-background/50 p-2 rounded"><span className="font-medium text-foreground block">{data.conceptA}:</span> {d.conceptA}</div>
              <div className="bg-background/50 p-2 rounded"><span className="font-medium text-foreground block">{data.conceptB}:</span> {d.conceptB}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HintLadderRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const [hintLevel, setHintLevel] = useState(0);
  return (
    <div className="my-3 rounded-2xl border border-amber-500/30 bg-background/60 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-400 flex justify-between items-center">
        <span>Guided Problem Scaffolding</span>
        <span className="font-mono text-[10px]">Hints ({hintLevel}/{data.hints?.length || 0})</span>
      </div>
      <p className="text-sm font-medium mb-3 text-foreground">{data.problem}</p>
      <div className="space-y-2">
        {data.hints?.slice(0, hintLevel).map((h: any, idx: number) => (
          <div key={idx} className="rounded-lg border border-amber-500/20 bg-amber-950/20 p-2.5 text-xs text-amber-200">
            <span className="font-bold mr-1">Hint {h.stepNumber || idx + 1}:</span> {h.hintText}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        {hintLevel < (data.hints?.length || 0) && (
          <button
            onClick={() => setHintLevel((prev) => prev + 1)}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium border border-amber-500/30"
          >
            Reveal Hint {hintLevel + 1}
          </button>
        )}
      </div>
    </div>
  );
}

function WorkedExampleRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  return (
    <div className="my-3 rounded-2xl border border-emerald-500/30 bg-background/60 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
        Worked Example
      </div>
      <p className="text-sm font-semibold mb-3 text-foreground">{data.problem}</p>
      <div className="space-y-2">
        {data.steps?.map((s: any, idx: number) => (
          <div key={idx} className="rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-xs">
            <div className="font-bold text-emerald-300 mb-0.5">Step {idx + 1}: {s.step}</div>
            <div className="text-muted-foreground">{s.explanation}</div>
          </div>
        ))}
      </div>
      {data.takeaway && (
        <div className="mt-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 p-2.5 text-xs text-emerald-200 font-medium">
          💡 Key Takeaway: {data.takeaway}
        </div>
      )}
    </div>
  );
}

function ShortAnswerRenderer({ data, activityId, onComplete }: { data: any; activityId?: string; onComplete?: () => void }) {
  const [ans, setAns] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="my-3 rounded-2xl border border-indigo-500/30 bg-background/60 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
        {data.type === "recall-prompt" ? "Active Recall Check" : "Practice Question"}
      </div>
      <p className="text-sm font-medium mb-3 text-foreground">{data.question || data.prompt}</p>
      {!submitted ? (
        <div className="space-y-2">
          <textarea
            value={ans}
            onChange={(e) => setAns(e.target.value)}
            placeholder="Type your reasoning here..."
            className="w-full rounded-xl border border-border/50 bg-secondary/20 p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[70px]"
          />
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
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Submit Answer
          </button>
        </div>
      ) : (
        <div className="rounded-lg bg-indigo-950/30 border border-indigo-500/20 p-3 text-xs text-indigo-200">
          <div className="font-semibold text-emerald-400 mb-1">Answer Submitted</div>
          <div className="opacity-90 italic mb-2">"{ans}"</div>
          {(data.sampleAnswer || data.answer) && (
            <div className="mt-2 pt-2 border-t border-indigo-500/20 text-muted-foreground">
              <span className="font-semibold text-foreground block">Model Answer:</span>
              {data.sampleAnswer || data.answer}
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
    <div className="my-3 rounded-2xl border border-indigo-500/30 bg-background/60 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
        Flashcard ({cardIdx + 1}/{cards.length})
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="min-h-[100px] cursor-pointer rounded-xl border border-border/50 bg-secondary/20 p-4 flex items-center justify-center text-center font-medium text-sm transition-all hover:border-indigo-500/40"
      >
        {flipped ? card.back : card.front}
      </div>

      {flipped && (
        <div className="mt-3 flex gap-2">
          {(["again", "hard", "good", "easy"] as const).map((r) => (
            <button
              key={r}
              onClick={() => handleRating(r)}
              className="flex-1 rounded-lg border border-indigo-500/20 bg-indigo-950/20 py-1.5 text-xs capitalize text-indigo-300 hover:bg-indigo-900/40"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
