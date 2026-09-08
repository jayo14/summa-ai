import { Target, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { FeatureDetailPage } from "../FeatureDetailPage";
import { PAGES } from "@/data/seo/site";

export default function KnowledgeGapAnalysisPage() {
  return (
    <FeatureDetailPage
      title={PAGES["features-knowledge-gap-analysis"].title}
      description={PAGES["features-knowledge-gap-analysis"].description}
      canonical={PAGES["features-knowledge-gap-analysis"].path}
      keywords={[
        "knowledge gap analysis",
        "identify knowledge gaps",
        "study gaps",
        "learning gaps",
        "what don't I know",
      ]}
      icon={<Target className="size-3" />}
      heroTag="GAP ANALYSIS"
      heroTitle="Know what you"
      heroHighlight="don't know"
      heroDescription="AI identifies knowledge gaps before exams. Get targeted review recommendations based on your learning history and quiz performance."
      whatItIs="Knowledge gap analysis identifies the specific concepts, topics, or skills you haven't mastered yet. Summa AI analyzes your quiz results, flashcard performance, and study patterns to pinpoint exactly where you need to focus."
      howItWorks={[
        {
          step: "Continuous assessment",
          detail: "Every quiz, flashcard review, and conversation feeds data into your mastery model.",
        },
        {
          step: "Gap identification",
          detail: "Summa AI compares your mastery against the full topic map to find gaps — concepts you should know but don't.",
        },
        {
          step: "Prioritized recommendations",
          detail: "Gaps are ranked by importance and urgency. Before an exam, high-impact gaps are prioritized.",
        },
        {
          step: "Targeted practice",
          detail: "Get quizzes, flashcards, and explanations focused specifically on your weak areas.",
        },
      ]}
      benefits={[
        "Identifies gaps before they become problems",
        "Prioritized by exam relevance",
        "Based on actual performance data",
        "Targets practice to weak areas",
        "Tracks gap closure over time",
        "Proactive recommendations",
        "Works across all subjects",
        "Integrates with study planner",
      ]}
      useCases={[
        {
          title: "Pre-exam review",
          description: "Find and fix knowledge gaps in the days before an exam.",
        },
        {
          title: "Course progress tracking",
          description: "See which topics you've mastered and which need more work.",
        },
        {
          title: "Self-assessment",
          description: "Get an honest picture of your understanding beyond what you think you know.",
        },
      ]}
      ctaTitle="Find your knowledge gaps"
      ctaDescription="Start studying. Summa AI tracks your gaps automatically."
    />
  );
}
