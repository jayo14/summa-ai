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
          <span className="eyebrow">CHECK UNDERSTANDING</span>
          <h3 id="quiz-title">Which one is overriding?</h3>
        </div>
        <span className="interactive-count">1 / 1</span>
      </header>
      <p className="interactive-instruction">
        Choose the statement that gives runtime polymorphism its behaviour.
      </p>
      <div className="answer-list" role="radiogroup" aria-label="Choose one answer">
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
              className={`quiz-option ${selectedClass} ${resultClass}`}
              onClick={() => selectChoice(index)}
            >
              <span className="option-key">{String.fromCharCode(65 + index)}</span>
              <span className="option-copy">
                <strong>{choice.title}</strong>
                {answered && <small>{choice.note}</small>}
              </span>
              {answered && isCorrect && <Check size={17} strokeWidth={2.5} aria-label="Correct answer" />}
            </button>
          );
        })}
      </div>
      {!answered ? (
        <button type="button" className="interactive-primary" disabled={selected === null} onClick={checkAnswer}>
          Check my reasoning <ArrowRight size={16} />
        </button>
      ) : (
        <div className={`feedback-callout ${selected === 1 ? "positive" : "supportive"}`} aria-live="polite">
          <div className="feedback-icon">{selected === 1 ? <Check size={16} /> : <Lightbulb size={16} />}</div>
          <p>
            {selected === 1
              ? "Exactly. The runtime object decides which same-signature method runs. That is overriding."
              : "Close, but this is a useful distinction: overloading is chosen from parameters; overriding is chosen from the runtime object."}
          </p>
          <button type="button" onClick={resetQuiz} className="quiet-inline-button">
            <RotateCcw size={13} /> Try a fresh retrieval
          </button>
        </div>
      )}
      <footer className="interactive-footer">
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
      <header className="interactive-heading">
        <div>
          <span className="eyebrow">RETRIEVAL REVIEW</span>
          <h3 id="flashcard-title">Polymorphism recall</h3>
        </div>
        <span className="interactive-count">{current + 1} / {cards.length}</span>
      </header>
      <button
        type="button"
        className={`flashcard-stage ${revealed ? "is-revealed" : ""}`}
        onClick={() => setRevealed((value) => !value)}
        aria-label={revealed ? "Hide answer" : "Reveal answer"}
      >
        <span className="flashcard-label">{revealed ? "ANSWER" : "PROMPT"}</span>
        <strong>{revealed ? card.back : card.front}</strong>
        <small>{revealed ? card.cue : "Pause, retrieve it yourself, then reveal."}</small>
        <span className="reveal-affordance">{revealed ? "Hide answer" : "Reveal answer"}<ChevronRight size={15} /></span>
      </button>
      {revealed && (
        <div className="confidence-row" aria-label="Rate your recall confidence">
          <span>How did that recall feel?</span>
          <div>
            <button type="button" onClick={() => nextCard("Low-confidence recall recorded")}>Need work</button>
            <button type="button" onClick={() => nextCard("Confident recall recorded")}>Clear</button>
          </div>
        </div>
      )}
      <footer className="interactive-footer"><span>Saved to OOP review</span><span>Spaced review</span></footer>
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
      <header className="interactive-heading">
        <div>
          <span className="eyebrow">GUIDED PRACTICE</span>
          <h3 id="practice-title">Predict, then explain</h3>
        </div>
        <span className="difficulty-pill"><span /> Intermediate</span>
      </header>
      <div className="code-sample" aria-label="Java code sample">
        <code><span className="code-type">Animal</span> animal = <span className="code-keyword">new</span> <span className="code-type">Dog</span>();<br />animal.<span className="code-function">makeSound</span>();</code>
      </div>
      <p className="practice-question">Which <code>makeSound()</code> runs, and what evidence tells you that?</p>
      {!submitted ? (
        <>
          <label htmlFor="practice-answer" className="sr-only">Your explanation</label>
          <textarea
            id="practice-answer"
            className="practice-input"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Write the reasoning, not only the answer…"
            rows={3}
          />
          {hintLevel > 0 && <p className="hint-copy"><Lightbulb size={14} /> {hints[hintLevel - 1]}</p>}
          <div className="practice-actions">
            <button type="button" onClick={requestHint} disabled={hintLevel === hints.length} className="secondary-action"><Sparkles size={15} /> {hintLevel === 0 ? "Give me a hint" : hintLevel === hints.length ? "All hints used" : "One more hint"}</button>
            <button type="button" onClick={submitPractice} disabled={!answer.trim()} className="interactive-primary">Submit reasoning <ArrowRight size={16} /></button>
          </div>
        </>
      ) : (
        <div className="practice-feedback" aria-live="polite">
          <div className="feedback-icon"><Check size={16} /></div>
          <div>
            <span className="eyebrow">SUMMA’S DIAGNOSIS</span>
            <p>You named the runtime object—good evidence. The important next step is connecting that object to the matching same-signature override in <code>Dog</code>.</p>
            <button type="button" className="quiet-inline-button" onClick={tryAgain}><RotateCcw size={13} /> Rework this explanation</button>
          </div>
        </div>
      )}
      <footer className="interactive-footer"><span>Objective: explain dynamic dispatch</span><span>Feedback: immediate</span></footer>
    </section>
  );
}

export function ProgressMoment({ mastery }: { mastery: number }) {
  return (
    <section className="progress-moment" aria-labelledby="progress-moment-title">
      <div className="progress-stamp"><Sparkles size={18} /></div>
      <div className="progress-copy">
        <span className="eyebrow">LEARNING EVIDENCE</span>
        <h3 id="progress-moment-title">Your reasoning is getting sharper.</h3>
        <p>Runtime dispatch is becoming more reliable. Keep the next practice on explaining <em>why</em>, not just naming the method.</p>
      </div>
      <div className="progress-score" aria-label={`Estimated mastery ${mastery} percent`}>
        <span>ESTIMATE</span>
        <strong>{mastery}%</strong>
        <small>+12 this session</small>
      </div>
      <EvidenceLedger value={mastery} className="progress-ledger-marks" />
      <footer><span>Based on retrieval + explanation evidence</span><span>Next review: Saturday</span></footer>
    </section>
  );
}

function EvidenceLedger({ value, className = "" }: { value: number; className?: string }) {
  const activeCount = Math.max(1, Math.round(value / 10));
  return <div className={`evidence-ledger ${className}`} aria-label={`${value}% estimated mastery from learning evidence`}>{Array.from({ length: 10 }, (_, index) => <i className={index < activeCount ? "is-active" : ""} key={index} />)}</div>;
}
