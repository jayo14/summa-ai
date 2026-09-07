import React, { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import { components, ComponentMeta } from "./component-data";

export function ComponentsView() {
  const [search, setSearch] = useState("");
  const [, params] = useRoute("/admin/components/:id");
  const selectedId = params?.id;

  const selectedComponent = selectedId
    ? components.find((c) => c.id === selectedId) || null
    : null;

  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Core Learning",
    "Teaching Components",
    "Active-Recall / Retention",
    "Progress / Guidance",
    "Session Components",
    "Exam Components",
    "Resource Components",
    "Interactive Cards",
    "Analytics & Progress",
  ];

  const filteredComponents = components.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || c.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  if (selectedComponent) {
    return <ComponentDetail component={selectedComponent} />;
  }

  return (
    <div className="space-y-8">
      {/* Title Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-mist-green dark:border-[#2A3838] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-mono text-[10px] font-bold tracking-wider uppercase">
              Summa AI Visual System
            </span>
            <span className="text-xs text-grey-green dark:text-[#8FA29B]">• {components.length} Instruments</span>
          </div>
          <h2 className="text-3xl font-extrabold text-ink dark:text-cream-soft tracking-tight">
            Learning Component Library
          </h2>
          <p className="text-sm text-grey-green dark:text-[#8FA29B] max-w-2xl leading-relaxed">
            Cohesive, soft-premium pedagogical instruments deployed dynamically by Summa&apos;s Learning Orchestrator.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search learning components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl text-xs text-ink dark:text-cream-soft placeholder:text-grey-green dark:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime shadow-2xs transition-all"
          />
          <svg className="absolute left-3 top-3 size-4 text-grey-green dark:text-[#8FA29B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? "bg-ink dark:bg-accent-lime text-cream-soft dark:text-ink shadow-xs"
                : "bg-cream-light text-grey-green dark:text-[#8FA29B] hover:bg-mist-green/50 dark:hover:bg-[#2A3838]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive Grid of Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredComponents.map((item) => (
          <Link key={item.id} href={`/admin/components/${item.id}`}>
            <div className="group relative bg-white dark:bg-[#1C2323] rounded-3xl border border-mist-green dark:border-[#2A3838] p-5 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer overflow-hidden">
              <div className="space-y-3.5 relative z-10">
                {/* Header: Badge Icon & Category */}
                <div className="flex items-center justify-between">
                  <div className={`size-11 rounded-2xl ${item.badgeBg} flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-grey-green dark:text-[#8FA29B] uppercase tracking-wider font-mono">
                    {item.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-ink dark:text-cream-soft group-hover:text-teal-dark group-hover:dark:text-accent-lime transition-colors flex items-center gap-1.5">
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-[11px] text-grey-green dark:text-[#8FA29B] leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>

                {/* Interactive Component Preview */}
                <div className="pt-1">
                  {item.preview}
                </div>
              </div>

              {/* Footer Action */}
              <div className="pt-2 border-t border-mist-green dark:border-[#2A3838]/50 flex items-center justify-between text-xs font-semibold text-grey-green dark:text-[#8FA29B] group-hover:text-teal-dark group-hover:dark:text-accent-lime transition-colors relative z-10">
                <span>View Playground</span>
                <div className="size-7 rounded-full bg-cream-light dark:bg-[#2A3838] group-hover:bg-teal-dark group-hover:dark:bg-accent-lime group-hover:text-white flex items-center justify-center transition-all shadow-2xs">
                  <ArrowRight size={13} />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ComponentDetail({ component }: { component: ComponentMeta }) {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/admin/components" className="inline-flex items-center gap-1.5 text-xs font-semibold text-grey-green dark:text-[#8FA29B] hover:text-teal-dark hover:dark:text-accent-lime transition">
        <span>←</span> Back to Component Library
      </Link>

      <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">

          {/* 1. HEADER */}
          <div className="flex items-start justify-between border-b border-mist-green dark:border-[#2A3838] pb-5">
            <div className="flex items-center gap-4">
              <div className={`size-14 rounded-2xl ${component.badgeBg} flex items-center justify-center shadow-xs`}>
                {component.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-grey-green dark:text-[#8FA29B] uppercase">
                    {component.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-ink dark:text-cream-soft">
                  {component.title}
                </h3>
                <p className="text-xs text-grey-green dark:text-[#8FA29B] mt-1">{component.desc}</p>
              </div>
            </div>
          </div>

          {/* 2. WHAT IS IT? */}
          {component.whatIsIt && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">What is it?</h4>
              <p className="text-sm text-grey-green dark:text-[#8FA29B] leading-relaxed">{component.whatIsIt}</p>
            </div>
          )}

          {/* 3. WHY SUMMA USES IT */}
          {component.whySummaUsesIt && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">Why Summa uses it</h4>
              <p className="text-sm text-grey-green dark:text-[#8FA29B] leading-relaxed">{component.whySummaUsesIt}</p>
            </div>
          )}

          {/* 4. LEARNING TECHNIQUES */}
          {component.techniques && component.techniques.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">Learning techniques</h4>
              <div className="flex flex-wrap gap-2">
                {component.techniques.map((t: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime text-xs font-semibold rounded-full border border-teal-dark/20 dark:border-accent-lime/20">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 5. WHEN SUMMA USES IT */}
          {component.whenSummaUsesIt && component.whenSummaUsesIt.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">When Summa might choose this</h4>
              <div className="p-4 bg-cream-light dark:bg-[#232D2D] rounded-xl border border-mist-green dark:border-[#2A3838]">
                <ul className="space-y-2">
                  {component.whenSummaUsesIt.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-grey-green dark:text-[#8FA29B]">
                      <span className="text-teal-dark dark:text-accent-lime mt-0.5 shrink-0">&#x2022;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 6. INTERACTIVE PLAYGROUND */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">Try the component</h4>
            <div className="p-4 bg-cream-light dark:bg-[#232D2D] rounded-2xl border border-mist-green dark:border-[#2A3838]">
              {component.preview}
            </div>
          </div>

          {/* 7. EXAMPLE IN SUMMA */}
          {component.example && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">Example in Summa</h4>
              <div className="p-4 bg-cream-light dark:bg-[#232D2D] rounded-xl border border-mist-green dark:border-[#2A3838]">
                <p className="text-sm text-grey-green dark:text-[#8FA29B] leading-relaxed italic">{component.example}</p>
              </div>
            </div>
          )}

          {/* 8. WHAT HAPPENS AFTER */}
          {component.whatHappensAfter && component.whatHappensAfter.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">What happens after</h4>
              <div className="space-y-0">
                {component.whatHappensAfter.map((item: { step: string; detail: string }, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-6 rounded-full bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </div>
                      {i < component.whatHappensAfter.length - 1 && (
                        <div className="w-px h-6 bg-teal-dark/30 dark:bg-accent-lime/30" />
                      )}
                    </div>
                    <div className="pb-4">
                      <div className="text-sm font-semibold text-ink dark:text-cream-soft">{item.step}</div>
                      <div className="text-xs text-grey-green dark:text-[#8FA29B]">{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. USED WITH + DECISION SIGNALS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {component.usedWith && component.usedWith.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">Often combined with</h4>
                <div className="flex flex-wrap gap-2">
                  {component.usedWith.map((item: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft text-xs font-medium rounded-full border border-mist-green dark:border-[#2A3838]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {component.decisionSignals && component.decisionSignals.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-ink dark:text-cream-soft uppercase tracking-wider font-mono">How Summa decides to use this</h4>
                <div className="flex flex-wrap gap-2">
                  {component.decisionSignals.map((item: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime text-xs font-semibold rounded-full border border-teal-dark/20 dark:border-accent-lime/20">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
