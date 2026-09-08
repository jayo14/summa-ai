import { Zap, CheckCircle2, BarChart3, RefreshCw } from "lucide-react";
import { FeatureDetailPage } from "../FeatureDetailPage";
import { PAGES } from "@/data/seo/site";

export default function AIQuizGeneratorPage() {
  return (
    <FeatureDetailPage
      title={PAGES["features-ai-quiz-generator"].title}
      description={PAGES["features-ai-quiz-generator"].description}
      canonical={PAGES["features-ai-quiz-generator"].path}
      keywords={[
        "AI quiz generator",
        "practice questions",
        "AI test maker",
        "quiz maker AI",
        "exam practice",
      ]}
      icon={<Zap className="size-3" />}
      heroTag="AI QUIZ GENERATOR"
      heroTitle="Unlimited practice quizzes"
      heroHighlight="from any material"
      heroDescription="Generate practice quizzes from your notes, PDFs, and study materials. Multiple question types, adaptive difficulty, and performance tracking."
      whatItIs="An AI quiz generator creates practice questions from your study materials. Summa AI analyzes your content and generates relevant questions in multiple formats — multiple choice, true/false, short answer, and fill-in-the-blank — calibrated to your mastery level."
      howItWorks={[
        {
          step: "Upload or reference your materials",
          detail: "Summa AI uses your uploaded notes, PDFs, and knowledge graph to generate questions grounded in your actual study content.",
        },
        {
          step: "AI generates targeted questions",
          detail: "Questions are created based on your materials and adapted to your current mastery level. Weak areas get more practice.",
        },
        {
          step: "Take the quiz interactively",
          detail: "Answer questions in the workspace. Get immediate feedback with explanations and source citations.",
        },
        {
          step: "Performance feeds your knowledge graph",
          detail: "Quiz results update your mastery tracking. Summa AI knows what you've mastered and what needs review.",
        },
      ]}
      benefits={[
        "Unlimited quizzes from your own materials",
        "Multiple question types: MCQ, true/false, short answer, fill-in-the-blank",
        "Adaptive difficulty based on your mastery",
        "Immediate feedback with explanations",
        "Source citations for every answer",
        "Performance tracking across sessions",
        "Spaced repetition scheduling for weak topics",
        "Works across all subjects",
      ]}
      useCases={[
        {
          title: "Exam preparation",
          description: "Generate practice exams from your course materials. Focus on weak areas identified by gap analysis.",
        },
        {
          title: "Active recall practice",
          description: "Use quizzes as an active recall technique — the most effective way to retain information.",
        },
        {
          title: "Self-assessment",
          description: "Test your understanding after studying a topic. Identify gaps before they become problems.",
        },
      ]}
      ctaTitle="Generate your first quiz free"
      ctaDescription="Upload notes or ask a question. Summa AI creates practice quizzes instantly."
    />
  );
}
