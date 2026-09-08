import { Link } from "wouter";
import {
  Brain,
  Zap,
  BookOpen,
  Database,
  Target,
  Clock,
  Layers,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SEOPageLayout } from "@/components/seo/SEOPageLayout";
import { Breadcrumbs } from "@/components/seo";
import { PAGES } from "@/data/seo/site";

const features = [
  {
    icon: <Brain className="size-6" />,
    title: "AI Study Assistant",
    description:
      "Ask questions in plain English. Summa AI adapts to your level, tracks mastery, and gives grounded answers from your knowledge graph.",
    href: "/features/ai-study-assistant",
    color: "bg-[#003F3F] text-[#B8FF4D]",
  },
  {
    icon: <Zap className="size-6" />,
    title: "AI Quiz Generator",
    description:
      "Generate unlimited practice quizzes from your materials. Multiple question types, adaptive difficulty, and performance tracking.",
    href: "/features/ai-quiz-generator",
    color: "bg-[#005A57] text-white",
  },
  {
    icon: <Layers className="size-6" />,
    title: "AI Flashcards",
    description:
      "Smart flashcards with spaced repetition. Auto-generated from your notes, scheduled at optimal intervals for long-term retention.",
    href: "/features/ai-flashcards",
    color: "bg-[#003F3F] text-[#B8FF4D]",
  },
  {
    icon: <Clock className="size-6" />,
    title: "AI Study Planner",
    description:
      "Personalized study plans based on your schedule, exam dates, and mastery level. Prioritizes weak areas automatically.",
    href: "/features/study-planner",
    color: "bg-[#005A57] text-white",
  },
  {
    icon: <Database className="size-6" />,
    title: "Knowledge Graph",
    description:
      "Visual map of how concepts connect. Track mastery across topics and understand the relationships between ideas.",
    href: "/features/knowledge-graph",
    color: "bg-[#003F3F] text-[#B8FF4D]",
  },
  {
    icon: <Target className="size-6" />,
    title: "Knowledge Gap Analysis",
    description:
      "AI identifies what you don't know before exams. Targeted review recommendations based on your learning history.",
    href: "/features/knowledge-gap-analysis",
    color: "bg-[#005A57] text-white",
  },
  {
    icon: <BookOpen className="size-6" />,
    title: "Persistent AI Memory",
    description:
      "Unlike chatbots that forget, Summa AI remembers every session. Your knowledge graph persists forever.",
    href: "/features/persistent-ai-memory",
    color: "bg-[#003F3F] text-[#B8FF4D]",
  },
  {
    icon: <GraduationCap className="size-6" />,
    title: "AI Exam Prep",
    description:
      "AI-powered exam preparation: study plans, practice quizzes, gap analysis, and focused review of weak topics.",
    href: "/features/exam-prep",
    color: "bg-[#005A57] text-white",
  },
];

export default function FeaturesPage() {
  return (
    <SEOPageLayout
      title={PAGES.features.title}
      description={PAGES.features.description}
      canonical={PAGES.features.path}
      keywords={[
        "AI study tools",
        "AI flashcards",
        "AI quiz generator",
        "AI study planner",
        "knowledge graph",
        "spaced repetition",
        "exam preparation",
      ]}
    >
      <Breadcrumbs items={[{ label: "Features" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 px-6 bg-[#003F3F] text-[#F5F3EC] -mx-6 md:mx-0 md:rounded-none">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005A57]/60 text-[#B8FF4D] text-[11px] font-mono font-semibold mb-6">
            <Sparkles className="size-3" />
            FEATURES
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-[#FBFAF6] tracking-tight leading-[1.1] mb-6">
            AI-powered study tools{" "}
            <span className="italic text-[#B8FF4D]">that actually work</span>
          </h1>
          <p className="text-sm sm:text-lg text-[#DDE8DF]/90 max-w-2xl mx-auto leading-relaxed">
            Everything you need to study smarter: quizzes, flashcards, study
            plans, knowledge graphs, and persistent memory — all in one
            workspace.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 md:px-0 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.href}
              href={feature.href}
              className="group p-8 rounded-3xl bg-white dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838] hover:shadow-xl transition-all"
            >
              <div
                className={`size-12 rounded-2xl ${feature.color} flex items-center justify-center mb-5`}
              >
                {feature.icon}
              </div>
              <h2 className="text-xl font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-2 group-hover:text-[#005A57] dark:group-hover:text-[#B8FF4D] transition-colors">
                {feature.title}
              </h2>
              <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] leading-relaxed mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003F3F] dark:text-[#B8FF4D] group-hover:gap-2.5 transition-all">
                Learn more <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-0 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#102B2B] dark:text-[#F5F3EC] mb-4">
          Ready to study smarter?
        </h2>
        <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] mb-8 max-w-lg mx-auto">
          Start learning for free. No credit card required. Set up in under 2
          minutes.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold shadow-xl transition-all hover:scale-[1.02]"
        >
          Get started free <ArrowRight className="size-4" />
        </Link>
      </section>
    </SEOPageLayout>
  );
}
