import { Brain } from "lucide-react";
import { FeatureDetailPage } from "../FeatureDetailPage";
import { PAGES } from "@/data/seo/site";

export default function AIStudyAssistantPage() {
  return (
    <FeatureDetailPage
      title={PAGES["features-ai-study-assistant"].title}
      description={PAGES["features-ai-study-assistant"].description}
      canonical={PAGES["features-ai-study-assistant"].path}
      keywords={[
        "AI study assistant",
        "AI tutor",
        "personalized learning",
        "AI learning assistant",
        "study with AI",
      ]}
      icon={<Brain className="size-3" />}
      heroTag="AI STUDY ASSISTANT"
      heroTitle="Your personal AI tutor"
      heroHighlight="that remembers everything"
      heroDescription="Ask questions in plain English. Summa AI adapts to your level, tracks your mastery across topics, and gives grounded answers from your knowledge graph."
      whatItIs="An AI study assistant is a purpose-built learning tool that adapts to your knowledge level, tracks what you know, and generates study materials from your content. Unlike a general chatbot, it remembers every session and builds on what you've already learned."
      howItWorks={[
        {
          step: "Ask a question in plain English",
          detail: "No keywords, no filters. Type your question the way you'd ask a tutor — 'Explain backpropagation simply' or 'What's the difference between TCP and UDP?'",
        },
        {
          step: "Summa AI adapts to your level",
          detail: "It detects whether you're an undergraduate, graduate, or professional and calibrates its explanation accordingly.",
        },
        {
          step: "Get grounded, cited answers",
          detail: "Every answer comes with source activities from your knowledge graph. You can verify claims against your own study materials.",
        },
        {
          step: "Everything persists",
          detail: "Your questions, answers, and understanding all feed into your knowledge graph. Next session, Summa AI remembers what you've learned.",
        },
      ]}
      benefits={[
        "Ask questions in natural language, no special syntax",
        "Answers adapt to your education level",
        "Grounded in your own study materials",
        "Persistent memory across all sessions",
        "Automatic quiz and flashcard generation from conversations",
        "Knowledge gap identification",
        "Multi-subject support in one workspace",
        "Available on desktop, tablet, and mobile",
      ]}
      useCases={[
        {
          title: "University students",
          description: "Use Summa AI as a always-available study companion that understands your course material and adapts to your level.",
        },
        {
          title: "Self-learners",
          description: "Get structured explanations and practice materials for any topic without enrolling in a course.",
        },
        {
          title: "Exam candidates",
          description: "Ask targeted questions about weak areas and get focused explanations with practice materials.",
        },
      ]}
      ctaTitle="Try the AI study assistant free"
      ctaDescription="Start learning in under 2 minutes. No credit card required."
    />
  );
}
