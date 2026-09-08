import { Clock, Calendar, Target, TrendingUp } from "lucide-react";
import { FeatureDetailPage } from "../FeatureDetailPage";
import { PAGES } from "@/data/seo/site";

export default function StudyPlannerPage() {
  return (
    <FeatureDetailPage
      title={PAGES["features-study-planner"].title}
      description={PAGES["features-study-planner"].description}
      canonical={PAGES["features-study-planner"].path}
      keywords={[
        "AI study planner",
        "study schedule",
        "exam study plan",
        "personalized study plan",
        "study timetable",
      ]}
      icon={<Clock className="size-3" />}
      heroTag="AI STUDY PLANNER"
      heroTitle="Study plans that"
      heroHighlight="adapt to your life"
      heroDescription="Personalized study plans based on your schedule, exam dates, and mastery level. Prioritizes weak areas automatically."
      whatItIs="An AI study planner creates a personalized schedule for your study sessions. It considers your exam dates, available time, current mastery level, and weak areas to build a plan that maximizes your learning efficiency."
      howItWorks={[
        {
          step: "Set your constraints",
          detail: "Enter your exam dates, available study hours, and subjects. Summa AI handles the scheduling.",
        },
        {
          step: "AI builds your plan",
          detail: "The planner considers your mastery levels, weak areas, and spaced repetition schedules to prioritize what to study.",
        },
        {
          step: "Follow your daily plan",
          detail: "Each day, get a focused list of what to study — no decision fatigue, no guesswork.",
        },
        {
          step: "Plan adapts as you progress",
          detail: "As you complete sessions and master topics, the plan adjusts to focus on remaining weak areas.",
        },
      ]}
      benefits={[
        "Personalized to your schedule and exam dates",
        "Automatic prioritization of weak areas",
        "Daily focused study lists",
        "Adapts to your progress",
        "Integrates quizzes, flashcards, and review",
        "Tracks completion and mastery",
        "Reduces study anxiety",
        "Works across all subjects",
      ]}
      useCases={[
        {
          title: "Exam preparation",
          description: "Count down to your exam with a plan that ensures you cover everything important.",
        },
        {
          title: "Semester planning",
          description: "Balance multiple courses with a unified study schedule.",
        },
        {
          title: "Self-paced learning",
          description: "Stay on track with your personal learning goals.",
        },
      ]}
      ctaTitle="Build your study plan"
      ctaDescription="Enter your exam date and subjects. Get a personalized plan in seconds."
    />
  );
}
