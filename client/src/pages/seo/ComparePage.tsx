import { Link } from "wouter";
import { ArrowRight, MessageSquare, BookOpen, Layers, Brain, Clock, Database, Target, GraduationCap, Check, X } from "lucide-react";
import { SEOPageLayout } from "@/components/seo/SEOPageLayout";
import { Breadcrumbs } from "@/components/seo";
import { PAGES } from "@/data/seo/site";

const comparisons = [
  {
    title: "Summa AI vs ChatGPT",
    description: "Purpose-built AI study assistant vs general chatbot. See which is better for learning.",
    href: "/compare/summa-ai-vs-chatgpt",
    icon: <MessageSquare className="size-5" />,
  },
];

export default function ComparePage() {
  return (
    <SEOPageLayout
      title={PAGES.compare.title}
      description={PAGES.compare.description}
      canonical={PAGES.compare.path}
      keywords={[
        "AI study tool comparison",
        "Summa AI vs ChatGPT",
        "best AI study tools",
        "AI study assistant comparison",
      ]}
    >
      <Breadcrumbs items={[{ label: "Compare" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 px-6 bg-[#003F3F] text-[#F5F3EC] -mx-6 md:mx-0 md:rounded-none">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005A57]/60 text-[#B8FF4D] text-[11px] font-mono font-semibold mb-6">
            COMPARISONS
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal text-[#FBFAF6] tracking-tight leading-[1.1] mb-6">
            Summa AI{" "}
            <span className="italic text-[#B8FF4D]">vs alternatives</span>
          </h1>
          <p className="text-sm sm:text-lg text-[#DDE8DF]/90 max-w-2xl mx-auto leading-relaxed">
            Objective comparisons to help you choose the right study tool. No
            bias — just facts.
          </p>
        </div>
      </section>

      {/* Comparison: Summa AI vs ChatGPT */}
      <section className="py-20 px-6 md:px-0 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-8">
          Summa AI vs ChatGPT
        </h2>

        <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] leading-relaxed mb-8">
          ChatGPT is a powerful general-purpose AI. But when it comes to studying,
          retaining knowledge, and preparing for exams, purpose-built tools have
          significant advantages.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Summa AI Column */}
          <div className="p-6 rounded-2xl bg-[#003F3F] text-[#F5F3EC] border border-[#005A57]">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="size-5 text-[#B8FF4D]" />
              <h3 className="font-bold text-[#B8FF4D]">Summa AI</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><Check className="size-4 text-[#B8FF4D] mt-0.5 shrink-0" /> Persistent memory across sessions</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#B8FF4D] mt-0.5 shrink-0" /> Knowledge graph tracking</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#B8FF4D] mt-0.5 shrink-0" /> Auto-generated quizzes & flashcards</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#B8FF4D] mt-0.5 shrink-0" /> Spaced repetition scheduling</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#B8FF4D] mt-0.5 shrink-0" /> Knowledge gap analysis</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#B8FF4D] mt-0.5 shrink-0" /> Personalized study plans</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#B8FF4D] mt-0.5 shrink-0" /> Grounded answers with citations</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#B8FF4D] mt-0.5 shrink-0" /> Purpose-built for learning</li>
            </ul>
          </div>

          {/* ChatGPT Column */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#1C2323] border border-[#E7EFE7] dark:border-[#2A3838]">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="size-5 text-[#6D7E78]" />
              <h3 className="font-bold text-[#102B2B] dark:text-[#F5F3EC]">ChatGPT</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><X className="size-4 text-[#E9B8A7] mt-0.5 shrink-0" /> Resets context between chats</li>
              <li className="flex items-start gap-2"><X className="size-4 text-[#E9B8A7] mt-0.5 shrink-0" /> No knowledge tracking</li>
              <li className="flex items-start gap-2"><X className="size-4 text-[#E9B8A7] mt-0.5 shrink-0" /> No auto-generated study materials</li>
              <li className="flex items-start gap-2"><X className="size-4 text-[#E9B8A7] mt-0.5 shrink-0" /> No spaced repetition</li>
              <li className="flex items-start gap-2"><X className="size-4 text-[#E9B8A7] mt-0.5 shrink-0" /> No gap analysis</li>
              <li className="flex items-start gap-2"><X className="size-4 text-[#E9B8A7] mt-0.5 shrink-0" /> No study planning</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#005A57] mt-0.5 shrink-0" /> General-purpose knowledge</li>
              <li className="flex items-start gap-2"><Check className="size-4 text-[#005A57] mt-0.5 shrink-0" /> Broad capability</li>
            </ul>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-[#E7EFE7] dark:border-[#2A3838] rounded-xl overflow-hidden">
            <thead className="bg-[#F5F3EC] dark:bg-[#232D2D]">
              <tr>
                <th className="p-4 text-left font-bold text-[#102B2B] dark:text-[#F5F3EC]">Feature</th>
                <th className="p-4 text-center font-bold text-[#005A57]">Summa AI</th>
                <th className="p-4 text-center font-bold text-[#6D7E78]">ChatGPT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EFE7] dark:divide-[#2A3838]">
              <tr className="bg-white dark:bg-[#1C2323]">
                <td className="p-4 text-[#102B2B] dark:text-[#F5F3EC]">Persistent memory</td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
                <td className="p-4 text-center"><X className="size-4 text-[#E9B8A7] mx-auto" /></td>
              </tr>
              <tr className="bg-[#F5F3EC] dark:bg-[#232D2D]">
                <td className="p-4 text-[#102B2B] dark:text-[#F5F3EC]">Knowledge graph</td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
                <td className="p-4 text-center"><X className="size-4 text-[#E9B8A7] mx-auto" /></td>
              </tr>
              <tr className="bg-white dark:bg-[#1C2323]">
                <td className="p-4 text-[#102B2B] dark:text-[#F5F3EC]">Auto-generated quizzes</td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
                <td className="p-4 text-center"><X className="size-4 text-[#E9B8A7] mx-auto" /></td>
              </tr>
              <tr className="bg-[#F5F3EC] dark:bg-[#232D2D]">
                <td className="p-4 text-[#102B2B] dark:text-[#F5F3EC]">Flashcards with spaced repetition</td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
                <td className="p-4 text-center"><X className="size-4 text-[#E9B8A7] mx-auto" /></td>
              </tr>
              <tr className="bg-white dark:bg-[#1C2323]">
                <td className="p-4 text-[#102B2B] dark:text-[#F5F3EC]">Knowledge gap analysis</td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
                <td className="p-4 text-center"><X className="size-4 text-[#E9B8A7] mx-auto" /></td>
              </tr>
              <tr className="bg-[#F5F3EC] dark:bg-[#232D2D]">
                <td className="p-4 text-[#102B2B] dark:text-[#F5F3EC]">Study planner</td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
                <td className="p-4 text-center"><X className="size-4 text-[#E9B8A7] mx-auto" /></td>
              </tr>
              <tr className="bg-white dark:bg-[#1C2323]">
                <td className="p-4 text-[#102B2B] dark:text-[#F5F3EC]">Source citations</td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
              </tr>
              <tr className="bg-[#F5F3EC] dark:bg-[#232D2D]">
                <td className="p-4 text-[#102B2B] dark:text-[#F5F3EC]">General-purpose chat</td>
                <td className="p-4 text-center"><X className="size-4 text-[#E9B8A7] mx-auto" /></td>
                <td className="p-4 text-center"><Check className="size-4 text-[#005A57] mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-[#F5F3EC] dark:bg-[#232D2D] border border-[#E7EFE7] dark:border-[#2A3838]">
          <h3 className="font-bold text-[#102B2B] dark:text-[#F5F3EC] mb-2">Bottom line</h3>
          <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] leading-relaxed">
            ChatGPT is excellent for general questions and brainstorming. But if
            you need to <strong>retain knowledge</strong>, <strong>track mastery</strong>,
            <strong> practice with quizzes</strong>, and <strong>prepare for exams</strong>,
            a purpose-built AI study assistant like Summa AI is significantly more
            effective.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 md:px-0 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-serif font-normal text-[#102B2B] dark:text-[#F5F3EC] mb-4">
          Try Summa AI free
        </h2>
        <p className="text-sm text-[#6D7E78] dark:text-[#8FA29B] mb-8 max-w-lg mx-auto">
          See the difference a purpose-built study assistant makes.
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
