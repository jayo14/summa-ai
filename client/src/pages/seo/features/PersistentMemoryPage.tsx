import { BookOpen, Infinity, Shield, Clock } from "lucide-react";
import { FeatureDetailPage } from "../FeatureDetailPage";
import { PAGES } from "@/data/seo/site";

export default function PersistentMemoryPage() {
  return (
    <FeatureDetailPage
      title={PAGES["features-persistent-memory"].title}
      description={PAGES["features-persistent-memory"].description}
      canonical={PAGES["features-persistent-memory"].path}
      keywords={[
        "persistent AI memory",
        "AI remembers",
        "learning memory",
        "study memory",
        "persistent learning",
      ]}
      icon={<BookOpen className="size-3" />}
      heroTag="PERSISTENT MEMORY"
      heroTitle="Learning that"
      heroHighlight="never resets"
      heroDescription="Unlike chatbots that forget, Summa AI remembers every study session. Your knowledge graph persists forever, building on what you already know."
      whatItIs="Persistent AI memory means Summa AI remembers everything across your study sessions — your knowledge graph, quiz results, flashcard progress, questions asked, and concepts mastered. Unlike general chatbots that forget between conversations, your learning accumulates."
      howItWorks={[
        {
          step: "Every session is recorded",
          detail: "Questions, answers, quiz results, and study patterns all feed into your persistent knowledge graph.",
        },
        {
          step: "Knowledge accumulates",
          detail: "Each new session builds on everything you've previously learned. No starting from scratch.",
        },
        {
          step: "Context carries forward",
          detail: "Summa AI knows what you've mastered, what needs review, and how you learn best — across every session.",
        },
        {
          step: "Permanent learning record",
          detail: "Your knowledge graph is your permanent learning record. It grows with you throughout your academic journey.",
        },
      ]}
      benefits={[
        "No learning is ever lost",
        "Context carries across all sessions",
        "Knowledge graph grows over time",
        "Personalization improves with use",
        "Review scheduling persists",
        "Multi-subject memory",
        "Private and secure",
        "Available on all devices",
      ]}
      useCases={[
        {
          title: "Long-term courses",
          description: "Study over months without losing context. Summa AI remembers everything from Day 1.",
        },
        {
          title: "Multi-subject learning",
          description: "Switch between subjects without losing your place in any of them.",
        },
        {
          title: "Academic journey",
          description: "Build a permanent knowledge base that grows throughout your education.",
        },
      ]}
      ctaTitle="Start building your knowledge"
      ctaDescription="Every session adds to your permanent learning record."
    />
  );
}
