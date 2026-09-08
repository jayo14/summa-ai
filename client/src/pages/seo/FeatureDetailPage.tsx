import { Link } from "wouter";
import { ArrowRight, Check } from "lucide-react";
import { SEOPageLayout } from "@/components/seo/SEOPageLayout";
import { Breadcrumbs } from "@/components/seo";

interface FeatureDetailProps {
  title: string;
  description: string;
  canonical: string;
  keywords: string[];
  icon: React.ReactNode;
  heroTag: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  whatItIs: string;
  howItWorks: Array<{ step: string; detail: string }>;
  benefits: string[];
  useCases: Array<{ title: string; description: string }>;
  faqs?: Array<{ question: string; answer: string }>;
  ctaTitle: string;
  ctaDescription: string;
}

export function FeatureDetailPage({
  title,
  description,
  canonical,
  keywords,
  icon,
  heroTag,
  heroTitle,
  heroHighlight,
  heroDescription,
  whatItIs,
  howItWorks,
  benefits,
  useCases,
  ctaTitle,
  ctaDescription,
}: FeatureDetailProps) {
  return (
    <SEOPageLayout
      title={title}
      description={description}
      canonical={canonical}
      keywords={keywords}
    >
      <Breadcrumbs
        items={[
          { label: "Features", href: "/features" },
          { label: heroTag },
        ]}
      />

      {/* Hero */}
      <section className="py-16 md:py-24 px-6 bg-[#003F3F] text-[#F5F3EC] -mx-6 md:mx-0 md:rounded-none mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005A57]/60 text-[#B8FF4D] text-[11px] font-mono font-semibold mb-6">
            {icon}
            {heroTag}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-[#FBFAF6] tracking-tight leading-[1.1] mb-6">
            {heroTitle}{" "}
            <span className="italic text-[#B8FF4D]">{heroHighlight}</span>
          </h1>
          <p className="text-sm sm:text-lg text-[#DDE8DF]/90 max-w-2xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto space-y-20">
        {/* What It Is */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-4">
            What is {heroTag}?
          </h2>
          <p className="text-sm sm:text-base text-[#6D7E78] dark:text-[#8FA29B] leading-relaxed">
            {whatItIs}
          </p>
        </section>

        {/* How It Works */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-8">
            How it works
          </h2>
          <div className="space-y-6">
            {howItWorks.map((item, i) => (
              <div
                key={i}
                className="flex gap-4 p-6 rounded-2xl bg-[#F5F3EC] dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838]"
              >
                <div className="size-8 rounded-full bg-[#003F3F] dark:bg-[#005A57] text-[#B8FF4D] flex items-center justify-center shrink-0 text-xs font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-1">
                    {item.step}
                  </h3>
                  <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-8">
            Benefits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((benefit, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F3EC] dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838]"
              >
                <Check className="size-4 text-[#005A57] dark:text-[#B8FF4D] mt-0.5 shrink-0" />
                <span className="text-sm text-[#102B2B] dark:text-[#F5F3EC]">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-8">
            Who uses this?
          </h2>
          <div className="space-y-4">
            {useCases.map((uc, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-[#F5F3EC] dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838]"
              >
                <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-2">
                  {uc.title}
                </h3>
                <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] leading-relaxed">
                  {uc.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal Links */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-6">
            Related features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/features/ai-flashcards"
              className="p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838] hover:shadow-lg transition-all group"
            >
              <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-1 group-hover:text-[#005A57] dark:group-hover:text-[#B8FF4D] transition-colors">
                AI Flashcards
              </h3>
              <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B]">
                Smart flashcards with spaced repetition
              </p>
            </Link>
            <Link
              href="/features/ai-quiz-generator"
              className="p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838] hover:shadow-lg transition-all group"
            >
              <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-1 group-hover:text-[#005A57] dark:group-hover:text-[#B8FF4D] transition-colors">
                AI Quiz Generator
              </h3>
              <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B]">
                Unlimited practice quizzes from your materials
              </p>
            </Link>
            <Link
              href="/features/knowledge-gap-analysis"
              className="p-5 rounded-2xl bg-white dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838] hover:shadow-lg transition-all group"
            >
              <h3 className="text-sm font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-1 group-hover:text-[#005A57] dark:group-hover:text-[#B8FF4D] transition-colors">
                Knowledge Gap Analysis
              </h3>
              <p className="text-xs text-[#6D7E78] dark:text-[#8FA29B]">
                Find what you don't know before exams
              </p>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#102B2B] dark:text-[#F5F3EC] mb-4">
            {ctaTitle}
          </h2>
          <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] mb-8 max-w-lg mx-auto">
            {ctaDescription}
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold shadow-xl transition-all hover:scale-[1.02]"
          >
            Get started free <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </SEOPageLayout>
  );
}
