import { Link } from "wouter";
import { SummaLogo } from "@/components/SummaLogo";
import { SEO } from "./SEO";
import { OrganizationJsonLd, WebSiteJsonLd } from "./JsonLd";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";

interface SEOPageLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  noindex?: boolean;
  keywords?: string[];
}

export function SEOPageLayout({
  children,
  title,
  description,
  canonical,
  ogImage,
  noindex,
  keywords,
}: SEOPageLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FBFAF6] text-[#102B2B] antialiased">
      <SEO
        title={title}
        description={description}
        canonical={canonical}
        ogImage={ogImage}
        noindex={noindex}
        keywords={keywords}
      />
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      {/* Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-[#B8FF4D] focus:text-[#003F3F] focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8FF4D]"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#003F3F]/95 backdrop-blur-md border-b border-[#005A57]">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-3">
            <SummaLogo inverse />
          </Link>

          <nav
            className="hidden md:flex items-center gap-8 text-xs font-medium text-[#DDE8DF]"
            aria-label="Main navigation"
          >
            <Link
              href="/features"
              className="hover:text-[#B8FF4D] transition-colors"
            >
              Features
            </Link>
            <Link
              href="/use-cases"
              className="hover:text-[#B8FF4D] transition-colors"
            >
              Use Cases
            </Link>
            <Link
              href="/compare"
              className="hover:text-[#B8FF4D] transition-colors"
            >
              Compare
            </Link>
            <Link
              href="/blog"
              className="hover:text-[#B8FF4D] transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className="hover:text-[#B8FF4D] transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="/about"
              className="hover:text-[#B8FF4D] transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-xs font-semibold text-[#DDE8DF] hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold shadow-md transition-all hover:scale-[1.02]"
            >
              Get started free
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#DDE8DF] hover:bg-[#005A57]/60 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#005A57] bg-[#003F3F] p-5 space-y-4">
            <nav className="flex flex-col space-y-3 text-sm font-medium text-[#DDE8DF]">
              <Link
                href="/features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B8FF4D] py-1"
              >
                Features
              </Link>
              <Link
                href="/use-cases"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B8FF4D] py-1"
              >
                Use Cases
              </Link>
              <Link
                href="/compare"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B8FF4D] py-1"
              >
                Compare
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B8FF4D] py-1"
              >
                Blog
              </Link>
              <Link
                href="/faq"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B8FF4D] py-1"
              >
                FAQ
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#B8FF4D] py-1"
              >
                About
              </Link>
            </nav>
            <div className="pt-3 border-t border-[#005A57] flex flex-col gap-2.5">
              <Link
                href="/sign-up"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-full bg-[#B8FF4D] text-[#003F3F] text-xs font-bold text-center"
              >
                Get started free
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <footer
        className="pt-20 pb-12 px-6 bg-[#003F3F] text-[#F5F3EC] border-t border-[#005A57]"
        role="contentinfo"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-left mb-16">
            {/* Brand */}
            <div className="md:col-span-4 space-y-4">
              <SummaLogo inverse />
              <p className="text-xs text-[#DDE8DF] leading-relaxed max-w-sm">
                The AI study assistant that never forgets. Personalized
                learning, persistent memory, and smart study tools.
              </p>
            </div>

            {/* Links */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] text-[#B8FF4D]">
                  Product
                </h5>
                <ul className="space-y-3 text-[#DDE8DF]">
                  <li>
                    <Link
                      href="/features"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features/ai-study-assistant"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      AI Study Assistant
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features/ai-flashcards"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      AI Flashcards
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features/ai-quiz-generator"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      AI Quiz Generator
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/features/study-planner"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      Study Planner
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] text-[#B8FF4D]">
                  Use Cases
                </h5>
                <ul className="space-y-3 text-[#DDE8DF]">
                  <li>
                    <Link
                      href="/use-cases/university-students"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      University Students
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/use-cases/college-students"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      College Students
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/use-cases/exam-preparation"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      Exam Preparation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/use-cases/self-learners"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      Self-Learners
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] text-[#B8FF4D]">
                  Resources
                </h5>
                <ul className="space-y-3 text-[#DDE8DF]">
                  <li>
                    <Link
                      href="/blog"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/compare"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      Comparisons
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] text-[#B8FF4D]">
                  Company
                </h5>
                <ul className="space-y-3 text-[#DDE8DF]">
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <a
                      href="mailto:hello@summastudy.com.ng"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/sign-up"
                      className="hover:text-[#B8FF4D] transition-colors"
                    >
                      Get Started
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#005A57] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6D7E78] font-mono">
            <div>&copy; {new Date().getFullYear()} Summa AI. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <Link
                href="/about"
                className="hover:text-[#DDE8DF] transition-colors"
              >
                Terms
              </Link>
              <span aria-hidden="true">&middot;</span>
              <Link
                href="/about"
                className="hover:text-[#DDE8DF] transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
