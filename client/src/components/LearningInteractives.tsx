/**
 * Summa AI visual system — The Margin Classroom.
 * These controlled, accessible interactives turn a conversational explanation into evidence of learning without taking the student out of context.
 */

import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react";

type LearningEvent = "retrieval" | "confidence" | "practice" | "hint";

type InteractiveProps = {
  onMasteryChange: (amount: number) => void;
  onLearningEvent: (event: LearningEvent, detail: string) => void;
};

const quizChoices = [
  {
    title: "Two methods share a name but have different parameters.",
    note: "That describes overloading.",
  },
  {
    title: "A child class defines its own method with the same signature as its parent.",
    note: "That lets dynamic dispatch choose the implementation.",
  },
  {
    title: "A method is marked private so it cannot be called outside its class.",
    note: "That changes visibility, not polymorphic behavior.",
  },
];

export function RecallQuiz({ onMasteryChange, onLearningEvent }: InteractiveProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  function selectChoice(index: number) {
    if (answered) return;
    setSelected(index);
  }

  function checkAnswer() {
    if (selected === null) return;
    setAnswered(true);
    const correct = selected === 1;
    onLearningEvent("retrieval", correct ? "Correct retrieval: method overriding" : "Retrieval needs reinforcement: method overriding");
    onMasteryChange(correct ? 7 : 2);
  }

  function resetQuiz() {
    setAnswered(false);
    setSelected(null);
  }

  return (
    <section className="interactive-card quiz-card" aria-labelledby="quiz-title">
      <header className="interactive-heading">
        <div>
          <span className="eyebrow text-xs tracking-wider">CHECK UNDERSTANDING</span>
          <h3 id="quiz-title" className="text-xl sm:text-2xl font-bold">Which one is overriding?</h3>
        </div>
        <span className="interactive-count text-xs font-mono font-bold">1 / 1</span>
      </header>
      <p className="interactive-instruction text-sm sm:text-base leading-relaxed text-[#6D7E78] dark:text-[#DDE8DF] my-3">
        Choose the statement that gives runtime polymorphism its behaviour.
      </p>
      <div className="answer-list space-y-3" role="radiogroup" aria-label="Choose one answer">
        {quizChoices.map((choice, index) => {
          const isCorrect = index === 1;
          const selectedClass = selected === index ? "is-selected" : "";
          const resultClass = answered ? (isCorrect ? "is-correct" : selected === index ? "is-incorrect" : "") : "";
          return (
            <button
              type="button"
              key={choice.title}
              role="radio"
              aria-checked={selected === index}
              tabIndex={0}
              className={`quiz-option w-full p-3.5 sm:p-4 text-left rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#005A57] dark:focus:ring-[#B8FF4D] ${selectedClass} ${resultClass}`}
              onClick={() => selectChoice(index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  selectChoice(index);
                }
              }}
            >
              <span className="option-key flex-shrink-0 size-7 font-semibold text-xs rounded-full flex items-center justify-center border border-[#6D7E78]/40">{String.fromCharCode(65 + index)}</span>
              <span className="option-copy flex-1 space-y-1">
                <strong className="text-sm sm:text-base font-semibold block text-[#102B2B] dark:text-[#FBFAF6]">{choice.title}</strong>
                {answered && <small className="text-xs text-[#6D7E78] dark:text-[#DDE8DF] block">{choice.note}</small>}
              </span>
              {answered && isCorrect && <Check className="size-5 text-[#005A57] dark:text-[#B8FF4D] flex-shrink-0" strokeWidth={3} aria-label="Correct answer" />}
            </button>
          );
        })}
      </div>
      {!answered ? (
        <button
          type="button"
          className="interactive-primary mt-5 px-6 py-3 rounded-full bg-[#B8FF4D] text-[#003F3F] text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-[#c7ff62] disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[#005A57]"
          disabled={selected === null}
          onClick={checkAnswer}
        >
          <span>Check my reasoning</span>
          <ArrowRight className="size-4" />
        </button>
      ) : (
        <div className={`feedback-callout mt-4 p-4 rounded-xl border flex flex-col sm:flex-row gap-3 items-start ${selected === 1 ? "bg-[#E7EFE7] dark:bg-[#1C2825] border-[#005A57] text-[#003F3F] dark:text-[#DDE8DF]" : "bg-[#FDF6F3] dark:bg-[#251E1D] border-[#E9B8A7] text-[#102B2B] dark:text-[#F5F3EC]"}`} aria-live="polite">
          <div className="feedback-icon p-2 rounded-full bg-[#005A57] text-white flex-shrink-0">{selected === 1 ? <Check size={18} /> : <Lightbulb size={18} />}</div>
          <div className="space-y-2">
            <p className="text-sm leading-relaxed font-medium">
              {selected === 1
                ? "Exactly. The runtime object decides which same-signature method runs. That is overriding."
                : "Close, but this is a useful distinction: overloading is chosen from parameters; overriding is chosen from the runtime object."}
            </p>
            <button type="button" onClick={resetQuiz} className="quiet-inline-button text-xs font-bold text-[#005A57] dark:text-[#B8FF4D] flex items-center gap-1.5 underline hover:no-underline focus:outline-none">
              <RotateCcw size={14} /> Try a fresh retrieval
            </button>
          </div>
        </div>
      )}
      <footer className="interactive-footer mt-4 pt-3 border-t border-[#DDE8DF] dark:border-[#2A3838] flex justify-between text-xs font-mono text-[#6D7E78] dark:text-[#8FA29B]">
        <span>Objective: identify runtime dispatch</span>
        <span>Evidence: retrieval</span>
      </footer>
    </section>
  );
}

const cards = [
  {
    front: "What does polymorphism let one interface do?",
    back: "It lets the same operation produce different behaviour depending on the actual object receiving it.",
    cue: "Think: one call, several possible implementations.",
  },
  {
    front: "Which object controls an overridden method call?",
    back: "The runtime object. The reference type limits what can be called, while the object type chooses the override.",
    cue: "Use the phrase ‘runtime object’ in your own words.",
  },
  {
    front: "How is overriding different from overloading?",
    back: "Overriding uses the same signature across an inheritance relationship. Overloading changes the parameter list.",
    cue: "Contrast signature and parameters.",
  },
];

export function FlashcardReview({ onLearningEvent }: InteractiveProps) {
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const card = cards[current];

  function nextCard(detail: string) {
    onLearningEvent("confidence", detail);
    setRevealed(false);
    setCurrent((value) => (value + 1) % cards.length);
  }

  return (
    <section className="interactive-card flashcard-card" aria-labelledby="flashcard-title">
      <header className="interactive-heading flex items-center justify-between">
        <div>
          <span className="eyebrow text-xs tracking-wider">RETRIEVAL REVIEW</span>
          <h3 id="flashcard-title" className="text-xl sm:text-2xl font-bold">Polymorphism recall</h3>
        </div>
        <span className="interactive-count text-xs font-mono font-bold">{current + 1} / {cards.length}</span>
      </header>
      <button
        type="button"
        className={`flashcard-stage w-full min-h-[190px] my-4 p-5 sm:p-6 rounded-2xl border transition-all text-left flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-[#005A57] ${revealed ? "bg-[#E7EFE7] dark:bg-[#1C2A26] border-[#005A57]" : "bg-[#FBFAF6] dark:bg-[#181E1E] border-[#DDE8DF] dark:border-[#2A3838]"}`}
        onClick={() => setRevealed((value) => !value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setRevealed((value) => !value);
          }
        }}
        aria-label={revealed ? "Hide answer" : "Reveal answer"}
      >
        <span className="flashcard-label text-xs font-mono font-bold text-[#005A57] dark:text-[#B8FF4D] tracking-widest">{revealed ? "ANSWER" : "PROMPT"}</span>
        <strong className="text-lg sm:text-xl md:text-2xl font-serif font-normal text-[#102B2B] dark:text-[#FBFAF6] my-3 leading-snug">{revealed ? card.back : card.front}</strong>
        <small className="text-xs sm:text-sm text-[#6D7E78] dark:text-[#DDE8DF] leading-relaxed">{revealed ? card.cue : "Pause, retrieve it yourself, then click to reveal."}</small>
        <span className="reveal-affordance self-end mt-3 text-xs font-bold text-[#003F3F] dark:text-[#B8FF4D] flex items-center gap-1">
          {revealed ? "Hide answer" : "Reveal answer"} <ChevronRight size={16} />
        </span>
      </button>
      {revealed && (
        <div className="confidence-row mt-4 p-3.5 rounded-xl bg-[#F5F3EC] dark:bg-[#1C2323] border border-[#DDE8DF] dark:border-[#2A3838] flex flex-col sm:flex-row items-center justify-between gap-3" aria-label="Rate your recall confidence">
          <span className="text-xs sm:text-sm font-semibold text-[#102B2B] dark:text-[#DDE8DF]">How did that recall feel?</span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => nextCard("Low-confidence recall recorded")}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-[#DDE8DF] dark:border-[#2A3838] bg-white dark:bg-[#181E1E] text-xs font-bold text-[#102B2B] dark:text-[#FBFAF6] hover:bg-[#E9DED0] dark:hover:bg-[#232D2D] transition-colors"
            >
              Need work
            </button>
            <button
              type="button"
              onClick={() => nextCard("Confident recall recorded")}
              className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-[#005A57] bg-[#B8FF4D] text-[#003F3F] text-xs font-extrabold hover:bg-[#c7ff62] transition-colors"
            >
              Clear &amp; Confident
            </button>
          </div>
        </div>
      )}
      <footer className="interactive-footer mt-4 pt-3 border-t border-[#DDE8DF] dark:border-[#2A3838] flex justify-between text-xs font-mono text-[#6D7E78] dark:text-[#8FA29B]">
        <span>Saved to OOP review</span>
        <span>Spaced review</span>
      </footer>
    </section>
  );
}

export function GuidedPractice({ onMasteryChange, onLearningEvent }: InteractiveProps) {
  const [answer, setAnswer] = useState("");
  const [hintLevel, setHintLevel] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const hints = [
    "Hint 1: begin by identifying the reference type and the object type.",
    "Hint 2: `animal` is typed as `Animal`, but it points to a `Dog` at runtime.",
  ];

  function requestHint() {
    if (hintLevel < hints.length) {
      const next = hintLevel + 1;
      setHintLevel(next);
      onLearningEvent("hint", `Scaffold hint ${next} requested`);
    }
  }

  function submitPractice() {
    if (!answer.trim()) return;
    setSubmitted(true);
    onLearningEvent("practice", "Short explanation submitted for diagnosis");
    if (answer.trim().length > 26) onMasteryChange(5);
  }

  function tryAgain() {
    setAnswer("");
    setSubmitted(false);
    setHintLevel(0);
  }

  return (
    <section className="interactive-card practice-card" aria-labelledby="practice-title">
      <header className="interactive-heading flex items-center justify-between">
        <div>
          <span className="eyebrow text-xs tracking-wider">GUIDED PRACTICE</span>
          <h3 id="practice-title" className="text-xl sm:text-2xl font-bold">Predict, then explain</h3>
        </div>
        <span className="difficulty-pill text-xs font-mono font-semibold px-2.5 py-1 rounded-full border border-[#DDE8DF] dark:border-[#2A3838] flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-[#005A57] dark:bg-[#B8FF4D]" /> Intermediate
        </span>
      </header>
      <div className="code-sample my-4 p-4 rounded-xl bg-[#003F3F] text-[#FBFAF6] font-mono text-sm sm:text-base leading-relaxed overflow-x-auto shadow-inner border border-[#005A57]" aria-label="Java code sample">
        <code><span className="text-[#B8FF4D] font-bold">Animal</span> animal = <span className="text-[#E9B8A7] font-bold">new</span> <span className="text-[#B8FF4D] font-bold">Dog</span>();<br />animal.<span className="text-[#DDE8DF] font-semibold">makeSound</span>();</code>
      </div>
      <p className="practice-question text-sm sm:text-base font-medium text-[#102B2B] dark:text-[#FBFAF6] mb-3">Which <code className="font-mono text-[#005A57] dark:text-[#B8FF4D] bg-[#E7EFE7] dark:bg-[#1C2825] px-1.5 py-0.5 rounded">makeSound()</code> runs, and what evidence tells you that?</p>
      {!submitted ? (
        <>
          <label htmlFor="practice-answer" className="sr-only">Your explanation</label>
          <textarea
            id="practice-answer"
            className="practice-input w-full p-3.5 rounded-xl border border-[#DDE8DF] dark:border-[#2A3838] bg-white dark:bg-[#181E1E] text-sm sm:text-base text-[#102B2B] dark:text-[#FBFAF6] focus:outline-none focus:ring-2 focus:ring-[#005A57] dark:focus:ring-[#B8FF4D] min-h-[90px] leading-relaxed"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Write the reasoning, not only the answer…"
            rows={3}
          />
          {hintLevel > 0 && (
            <p className="hint-copy mt-2 text-xs sm:text-sm text-[#005A57] dark:text-[#B8FF4D] flex items-center gap-2 p-2.5 rounded-lg bg-[#E7EFE7] dark:bg-[#1C2825]">
              <Lightbulb size={16} className="flex-shrink-0" /> {hints[hintLevel - 1]}
            </p>
          )}
          <div className="practice-actions mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={requestHint}
              disabled={hintLevel === hints.length}
              className="secondary-action text-xs font-bold text-[#6D7E78] dark:text-[#DDE8DF] flex items-center gap-1.5 hover:text-[#003F3F] dark:hover:text-[#B8FF4D] disabled:opacity-45 transition-colors"
            >
              <Sparkles size={16} /> {hintLevel === 0 ? "Give me a hint" : hintLevel === hints.length ? "All hints used" : "One more hint"}
            </button>
            <button
              type="button"
              onClick={submitPractice}
              disabled={!answer.trim()}
              className="interactive-primary w-full sm:w-auto px-6 py-3 rounded-full bg-[#B8FF4D] text-[#003F3F] text-sm font-extrabold flex items-center justify-center gap-2 hover:bg-[#c7ff62] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <span>Submit reasoning</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className="practice-feedback mt-4 p-4 rounded-xl bg-[#E7EFE7] dark:bg-[#1C2825] border border-[#005A57] text-[#003F3F] dark:text-[#DDE8DF] flex items-start gap-3" aria-live="polite">
          <div className="feedback-icon p-2 rounded-full bg-[#005A57] text-white flex-shrink-0"><Check size={18} /></div>
          <div className="space-y-2">
            <span className="eyebrow text-xs font-mono font-bold text-[#005A57] dark:text-[#B8FF4D] uppercase">SUMMA’S DIAGNOSIS</span>
            <p className="text-sm sm:text-base leading-relaxed">You named the runtime object—good evidence. The important next step is connecting that object to the matching same-signature override in <code className="font-mono font-bold text-[#005A57] dark:text-[#B8FF4D]">Dog</code>.</p>
            <button type="button" className="quiet-inline-button text-xs font-bold text-[#005A57] dark:text-[#B8FF4D] flex items-center gap-1.5 underline hover:no-underline" onClick={tryAgain}>
              <RotateCcw size={14} /> Rework this explanation
            </button>
          </div>
        </div>
      )}
      <footer className="interactive-footer mt-4 pt-3 border-t border-[#DDE8DF] dark:border-[#2A3838] flex justify-between text-xs font-mono text-[#6D7E78] dark:text-[#8FA29B]">
        <span>Objective: explain dynamic dispatch</span>
        <span>Feedback: immediate</span>
      </footer>
    </section>
  );
}

export function ProgressMoment({ mastery }: { mastery: number }) {
  return (
    <section className="progress-moment my-6 p-5 sm:p-6 rounded-2xl border border-[#DDE8DF] dark:border-[#2A3838] bg-[#FBFAF6] dark:bg-[#1C2323] text-[#102B2B] dark:text-[#FBFAF6] shadow-md grid grid-cols-1 sm:grid-cols-12 gap-4 items-center relative overflow-hidden" aria-labelledby="progress-moment-title">
      <div className="sm:col-span-1 flex justify-center">
        <div className="progress-stamp size-10 rounded-full bg-[#B8FF4D] text-[#003F3F] flex items-center justify-center font-bold shadow-sm">
          <Sparkles size={20} />
        </div>
      </div>
      <div className="progress-copy sm:col-span-8 space-y-1">
        <span className="eyebrow text-xs font-mono font-bold text-[#005A57] dark:text-[#B8FF4D] uppercase">LEARNING EVIDENCE</span>
        <h3 id="progress-moment-title" className="text-lg sm:text-xl font-bold tracking-tight text-[#102B2B] dark:text-[#FBFAF6]">Your reasoning is getting sharper.</h3>
        <p className="text-xs sm:text-sm text-[#6D7E78] dark:text-[#DDE8DF] leading-relaxed">Runtime dispatch is becoming more reliable. Keep the next practice on explaining <em>why</em>, not just naming the method.</p>
      </div>
      <div className="progress-score sm:col-span-3 text-right flex flex-col items-end" aria-label={`Estimated mastery ${mastery} percent`}>
        <span className="text-[10px] font-mono text-[#6D7E78] dark:text-[#8FA29B]">ESTIMATE</span>
        <strong className="text-2xl sm:text-3xl font-mono font-bold text-[#003F3F] dark:text-[#B8FF4D]">{mastery}%</strong>
        <small className="text-[11px] font-mono font-semibold text-[#005A57] dark:text-[#B8FF4D]">+12 this session</small>
      </div>
      <div className="sm:col-span-12 w-full pt-2">
        <EvidenceLedger value={mastery} className="progress-ledger-marks flex gap-1.5 py-2 border-y border-[#DDE8DF] dark:border-[#2A3838]" />
      </div>
      <footer className="sm:col-span-12 flex justify-between text-xs font-mono text-[#6D7E78] dark:text-[#8FA29B] pt-1">
        <span>Based on retrieval + explanation evidence</span>
        <span>Next review: Saturday</span>
      </footer>
    </section>
  );
}

function EvidenceLedger({ value, className = "" }: { value: number; className?: string }) {
  const activeCount = Math.max(1, Math.round(value / 10));
  return <div className={`evidence-ledger ${className}`} aria-label={`${value}% estimated mastery from learning evidence`}>{Array.from({ length: 10 }, (_, index) => <i className={index < activeCount ? "is-active" : ""} key={index} />)}</div>;
}
