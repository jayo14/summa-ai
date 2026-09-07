/**
 * ChatComponentRenderer — renders structured LearningActivity payloads dynamically inside conversation turns.
 */

import { useState } from "react";
import { Check, Sparkles, HelpCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";

export type ComponentData = {
  type: "quiz" | "flashcards" | "study-plan" | "hexagon" | "graph" | "timeline" | "gap-analysis";
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
