import React, { useState, useRef, useCallback } from "react";
import { ArrowRight } from "lucide-react";
import { Link, useRoute } from "wouter";
import { components, ComponentMeta } from "./component-data";

export function ComponentsView() {
  const [search, setSearch] = useState("");
  const [, params] = useRoute("/admin/components/:id");
  const selectedId = params?.id;
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    searchInputRef.current?.focus();
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch("");
    searchInputRef.current?.focus();
  }, []);

  return (
    <section aria-labelledby="components-heading" className="space-y-8">
      {/* Title Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-mist-green dark:border-[#2A3838] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-mono text-[10px] font-bold tracking-wider uppercase">
              Summa AI Visual System
            </span>
            <span className="text-xs text-grey-green dark:text-[#8FA29B]" aria-label={`${components.length} instruments available`}>
              {components.length} Instruments
            </span>
          </div>
          <h2
            id="components-heading"
            className="text-3xl font-extrabold text-ink dark:text-cream-soft tracking-tight"
          >
            Learning Component Library
          </h2>
          <p className="text-sm text-grey-green dark:text-[#8FA29B] max-w-2xl leading-relaxed">
            Cohesive, soft-premium pedagogical instruments deployed dynamically by Summa&apos;s Learning Orchestrator.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <label htmlFor="component-search" className="sr-only">
            Search learning components
          </label>
          <input
            ref={searchInputRef}
            id="component-search"
            type="search"
            placeholder="Search learning components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-describedby="search-results-count"
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded-2xl text-xs text-ink dark:text-cream-soft placeholder:text-grey-green dark:text-[#8FA29B] focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime shadow-2xs transition-all"
          />
          <svg
            className="absolute left-3 top-3 size-4 text-grey-green dark:text-[#8FA29B]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {search && (
            <button
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-3 text-grey-green dark:text-[#8FA29B] hover:text-ink dark:hover:text-cream-soft focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime rounded"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Live region for screen readers */}
      <div
        id="search-results-count"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {filteredComponents.length} component{filteredComponents.length !== 1 ? "s" : ""} found
      </div>

      {/* Category Pills Filter Bar */}
      <div
        role="group"
        aria-label="Filter by category"
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={isActive}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime focus:ring-offset-2 ${
                isActive
                  ? "bg-ink dark:bg-accent-lime text-cream-soft dark:text-ink shadow-xs"
                  : "bg-cream-light text-grey-green dark:text-[#8FA29B] hover:bg-mist-green/50 dark:hover:bg-[#2A3838]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Responsive Grid of Cards */}
      <ul
        role="list"
        aria-label="Learning components"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredComponents.map((item) => (
          <li key={item.id}>
            <Link
              href={`/admin/components/${item.id}`}
              aria-label={`${item.title} - ${item.desc}`}
            >
              <article className="group relative bg-white dark:bg-[#1C2323] rounded-3xl border border-mist-green dark:border-[#2A3838] p-5 shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 cursor-pointer overflow-hidden focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime focus:ring-offset-2">
                <div className="space-y-3.5 relative z-10">
                  {/* Header: Badge Icon & Category */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`size-11 rounded-2xl ${item.badgeBg} flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105`}
                      aria-hidden="true"
                    >
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
                  <div className="pt-1" aria-hidden="true">
                    {item.preview}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-mist-green dark:border-[#2A3838]/50 flex items-center justify-between text-xs font-semibold text-grey-green dark:text-[#8FA29B] group-hover:text-teal-dark group-hover:dark:text-accent-lime transition-colors relative z-10">
                  <span>View Playground</span>
                  <div
                    className="size-7 rounded-full bg-cream-light dark:bg-[#2A3838] group-hover:bg-teal-dark group-hover:dark:bg-accent-lime group-hover:text-white flex items-center justify-center transition-all shadow-2xs"
                    aria-hidden="true"
                  >
                    <ArrowRight size={13} />
                  </div>
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>

      {/* Empty state */}
      {filteredComponents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-grey-green dark:text-[#8FA29B]">
            No components found matching your search.
          </p>
          <button
            onClick={handleClearSearch}
            className="mt-4 text-sm font-semibold text-teal-dark dark:text-accent-lime hover:underline focus:outline-none focus:ring-2 focus:ring-teal-dark dark:focus:ring-accent-lime rounded"
          >
            Clear search
          </button>
        </div>
      )}
    </section>
  );
}
