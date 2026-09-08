import { GraduationCap, Calendar, Target, TrendingUp } from "lucide-react";
import { FeatureDetailPage } from "../FeatureDetailPage";
import { PAGES } from "@/data/seo/site";

export default function ExamPrepPage() {
  return (
    <FeatureDetailPage
      title={PAGES["features-exam-prep"].title}
      description={PAGES["features-exam-prep"].description}
      canonical={PAGES["features-exam-prep"].path}
      keywords={[
        "AI exam prep",
        "exam preparation",
        "study for exams",
        "exam study plan",
        "exam practice",
      ]}
      icon={<GraduationCap className="size-3" />}
      heroTag="AI EXAM PREP"
      heroTitle="Prepare for exams"
      heroHighlight="with confidence"
      heroDescription="AI-powered exam preparation: study plans, practice quizzes, gap analysis, and focused review of weak topics."
      whatItIs="AI exam preparation combines study planning, practice quizzes, gap analysis, and flashcards into a focused exam preparation workflow. Summa AI counts down to your exam date and ensures you've covered everything important."
      howItWorks={[
        {
          step: "Set your exam date",
          detail: "Enter when your exam is and what it covers. Summa AI builds a countdown plan.",
        },
        {
          step: "AI builds your exam plan",
          detail: "The plan prioritizes high-weight topics, weak areas, and spaced repetition reviews.",
        },
        {
          step: "Daily focused practice",
          detail: "Each day, get specific tasks: topics to review, quizzes to take, flashcards to review.",
        },
        {
          step: "Track readiness",
          detail: "See your readiness percentage increase as you close knowledge gaps and improve mastery.",
        },
      ]}
      benefits={[
        "Countdown-based study planning",
        "Prioritizes high-impact topics",
        "Identifies and targets weak areas",
        "Practice quizzes calibrated to exam level",
        "Flashcard review with spaced repetition",
        "Readiness tracking",
        "Reduced exam anxiety",
        "Proven study techniques built in",
      ]}
      useCases={[
        {
          title: "Final exams",
          description: "Prepare for end-of-semester exams with a comprehensive, personalized plan.",
        },
        {
          title: "Standardized tests",
          description: "Study for GRE, GMAT, JAMB, WAEC, or professional certifications.",
        },
        {
          title: "Course midterms",
          description: "Stay ahead with regular self-assessment and gap identification.",
        },
      ]}
      ctaTitle="Start exam preparation"
      ctaDescription="Set your exam date. Get a personalized study plan instantly."
    />
  );
}
