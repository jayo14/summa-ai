import { Link } from "wouter";
import {
  GraduationCap,
  BookOpen,
  Code,
  Target,
  User,
  ArrowRight,
} from "lucide-react";
import { SEOPageLayout } from "@/components/seo/SEOPageLayout";
import { Breadcrumbs } from "@/components/seo";
import { PAGES } from "@/data/seo/site";

const useCases = [
  {
    icon: <GraduationCap className="size-6" />,
    title: "University Students",
    description:
      "Deep learning with persistent memory. Summa AI tracks your understanding across courses and builds on what you know.",
    href: "/use-cases/university-students",
    color: "bg-[#003F3F] text-[#B8FF4D]",
  },
  {
    icon: <BookOpen className="size-6" />,
    title: "College Students",
    description:
      "Manage coursework, generate practice quizzes, and build flashcards from lecture notes across multiple subjects.",
    href: "/use-cases/college-students",
    color: "bg-[#005A57] text-white",
  },
  {
    icon: <Code className="size-6" />,
    title: "Computer Science Students",
    description:
      "Master algorithms, data structures, systems design, and programming concepts with persistent learning.",
    href: "/use-cases/computer-science-students",
    color: "bg-[#003F3F] text-[#B8FF4D]",
  },
  {
    icon: <Target className="size-6" />,
    title: "Exam Preparation",
    description:
      "AI-powered gap analysis, practice quizzes, and adaptive study plans focused on your weak areas.",
    href: "/use-cases/exam-preparation",
    color: "bg-[#005A57] text-white",
  },
  {
    icon: <User className="size-6" />,
    title: "Self-Learners",
    description:
      "Structured learning paths, progress tracking, and knowledge retention for independent study.",
    href: "/use-cases/self-learners",
    color: "bg-[#003F3F] text-[#B8FF4D]",
  },
];

export default function UseCasesPage() {
  return (
    <SEOPageLayout
      title={PAGES["use-cases"].title}
      description={PAGES["use-cases"].description}
      canonical={PAGES["use-cases"].path}
      keywords={[
        "AI study tool for students",
        "AI for university students",
        "AI study assistant",
        "exam preparation AI",
        "self-learning AI",
      ]}
    >
      <Breadcrumbs items={[{ label: "Use Cases" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 px-6 bg-[#003F3F] text-[#F5F3EC] -mx-6 md:mx-0 md:rounded-none">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005A57]/60 text-[#B8FF4D] text-[11px] font-mono font-semibold mb-6">
            USE CASES
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-[#FBFAF6] tracking-tight leading-[1.1] mb-6">
            Who uses{" "}
            <span className="italic text-[#B8FF4D]">Summa AI?</span>
          </h1>
          <p className="text-sm sm:text-lg text-[#DDE8DF]/90 max-w-2xl mx-auto leading-relaxed">
            From university students to self-learners, Summa AI adapts to how
            you study and what you need to learn.
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="py-20 px-6 md:px-0 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((uc) => (
            <Link
              key={uc.href}
              href={uc.href}
              className="group p-8 rounded-3xl bg-white dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838] hover:shadow-xl transition-all"
            >
              <div
                className={`size-12 rounded-2xl ${uc.color} flex items-center justify-center mb-5`}
              >
                {uc.icon}
              </div>
              <h2 className="text-xl font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-2 group-hover:text-[#005A57] dark:group-hover:text-[#B8FF4D] transition-colors">
                {uc.title}
              </h2>
              <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] leading-relaxed mb-4">
                {uc.description}
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
          Start learning for free. No credit card required.
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
