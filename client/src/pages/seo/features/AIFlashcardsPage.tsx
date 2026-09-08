import { Layers, Clock, Brain, Repeat } from "lucide-react";
import { FeatureDetailPage } from "../FeatureDetailPage";
import { PAGES } from "@/data/seo/site";

export default function AIFlashcardsPage() {
  return (
    <FeatureDetailPage
      title={PAGES["features-ai-flashcards"].title}
      description={PAGES["features-ai-flashcards"].description}
      canonical={PAGES["features-ai-flashcards"].path}
      keywords={[
        "AI flashcards",
        "smart flashcards",
        "spaced repetition flashcards",
        "AI flashcard generator",
        "flashcard app",
      ]}
      icon={<Layers className="size-3" />}
      heroTag="AI FLASHCARDS"
      heroTitle="Smart flashcards that"
      heroHighlight="adapt to your memory"
      heroDescription="Auto-generated flashcards from your notes with spaced repetition. Review at the optimal time for long-term retention."
      whatItIs="AI flashcards are study cards automatically generated from your materials. Unlike static flashcard apps, Summa AI creates cards from your content and schedules reviews using spaced repetition — showing you cards right before you'd forget them."
      howItWorks={[
        {
          step: "Flashcards generated from your content",
          detail: "Summa AI creates flashcards from your notes, PDFs, quiz answers, and knowledge graph entries.",
        },
        {
          step: "Spaced repetition scheduling",
          detail: "Cards are scheduled based on how well you know each concept. Harder concepts appear more frequently.",
        },
        {
          step: "Review at the right time",
          detail: "Get notified when cards are due. Each review strengthens your memory for that concept.",
        },
        {
          step: "Mastery tracking",
          detail: "Your flashcard performance feeds back into your knowledge graph and quiz generation.",
        },
      ]}
      benefits={[
        "Auto-generated from your study materials",
        "Spaced repetition for optimal retention",
        "Adaptive scheduling based on performance",
        "Multiple card types: definition, concept, application",
        "Performance tracking per card and deck",
        "Integration with knowledge graph",
        "Review reminders",
        "Works offline on mobile",
      ]}
      useCases={[
        {
          title: "Vocabulary and terminology",
          description: "Memorize definitions, formulas, and technical terms with spaced repetition.",
        },
        {
          title: "Concept review",
          description: "Reinforce understanding of complex concepts through repeated recall.",
        },
        {
          title: "Exam cramming",
          description: "Use focused flashcard sessions before exams to reinforce weak areas.",
        },
      ]}
      ctaTitle="Create your first flashcard deck"
      ctaDescription="Upload notes or study a topic. Summa AI generates flashcards automatically."
    />
  );
}
