/**
 * ChatComponentRenderer — renders structured LearningActivity payloads dynamically inside conversation turns.
 */

import { useState } from "react";
import { Check, Sparkles, HelpCircle } from "lucide-react";
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
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const q = questions[currentIdx];

  async function handleOptionSelect(idx: number) {
    if (submitted) return;
    setSelectedOpt(idx);
    setSubmitted(true);

    const isCorrect = idx === q.correctIndex;
    const nextScore = isCorrect ? score + 1 : score;
    setScore(nextScore);

    try {
      await fetchApi("/interactions/quiz-result", {
        method: "POST",
        body: JSON.stringify({
          artifact_id: activityId || "quiz-component",
          topic: q.question,
          score: isCorrect ? 100 : 0,
          answers: { selected: idx, correct: q.correctIndex },
        }),
      });
    } catch (e) {
      console.warn("Failed to record quiz result", e);
    }

    if (onComplete) onComplete();
  }

  if (!q) return null;

  return (
    <div className="my-3 rounded-2xl border border-indigo-500/30 bg-background/60 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-semibold uppercase tracking-wider text-indigo-400">
          Quiz ({currentIdx + 1}/{questions.length})
        </span>
        {submitted && (
          <span className={selectedOpt === q.correctIndex ? "text-emerald-400" : "text-rose-400"}>
            {selectedOpt === q.correctIndex ? "Correct!" : "Incorrect"}
          </span>
        )}
      </div>

      <p className="mb-3 font-medium text-foreground text-sm">{q.question}</p>

      <div className="space-y-2">
        {q.options?.map((opt: string, idx: number) => {
          let stateClass = "border-border/40 hover:border-indigo-500/50 bg-secondary/30";
          if (submitted) {
            if (idx === q.correctIndex) {
              stateClass = "border-emerald-500/60 bg-emerald-950/30 text-emerald-300";
            } else if (idx === selectedOpt) {
              stateClass = "border-rose-500/60 bg-rose-950/30 text-rose-300";
            }
          }

          return (
            <button
              key={idx}
              disabled={submitted}
              onClick={() => handleOptionSelect(idx)}
              className={`w-full text-left text-xs p-2.5 rounded-lg border transition-all ${stateClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {submitted && q.explanation && (
        <div className="mt-3 rounded-lg bg-indigo-950/30 p-2.5 text-xs text-indigo-200 border border-indigo-500/20">
          <HelpCircle className="inline h-3.5 w-3.5 mr-1" />
          {q.explanation}
        </div>
      )}
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
