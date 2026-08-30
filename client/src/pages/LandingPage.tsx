import React, { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { SummaLogo } from "@/components/SummaLogo";
import {
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  Heart,
  BookOpen,
  MessageSquare,
  Shield,
  Layers,
  Star,
  Users,
  CheckCircle2,
  HelpCircle,
  Sliders,
  Cpu,
  Bookmark,
  Mail,
  Play,
  FolderOpen,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [isWaitlistLoading, setIsWaitlistLoading] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Smoothly interpolate scroll progress from 0 (at top) to 1 (scrolled 60px)
      const currentScroll = window.scrollY;
      const progress = Math.min(Math.max(currentScroll / 60, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail) return;

    setIsWaitlistLoading(true);
    // Simulate waitlist API registration delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsWaitlistLoading(false);
    setWaitlistSubmitted(true);
  };

  // Interpolate dynamic styles based on continuous scroll progress (on desktop)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const headerWidth = isMobile ? 94 : (100 - scrollProgress * 20); // Responsive width bound
  const headerMarginTop = scrollProgress * 12; // 0px -> 12px
  const headerBorderRadius = scrollProgress * 9999; // 0px -> 9999px
  const headerHeight = 72 - scrollProgress * 12; // 72px -> 60px
  const headerPx = 24 - scrollProgress * 8; // 24px -> 16px

  return (
    <div className="min-h-screen w-full bg-[#FBFAF6] text-[#102B2B] font-sans selection:bg-[#B8FF4D] selection:text-[#003F3F] relative antialiased overflow-x-hidden">
      
      {/* 1. FLOATING STICKY NAVIGATION HEADER WITH RESPONSIVE INTERPOLATION */}
      <div className="sticky top-0 z-50 w-full pointer-events-none flex justify-center pt-2">
        <header
          style={{
            width: `${headerWidth}%`,
            marginTop: `${headerMarginTop}px`,
            borderRadius: `${headerBorderRadius}px`,
          }}
          className={`pointer-events-auto bg-[#003F3F] text-[#F5F3EC] bg-grain-dark transition-all duration-300 ease-out ${
            scrollProgress > 0.1
              ? "border border-[#005A57] shadow-2xl backdrop-blur-xl bg-opacity-95"
              : "border-b border-[#005A57]/60 shadow-md"
          }`}
        >
          <div
            style={{
              height: `${headerHeight}px`,
              paddingLeft: `${headerPx}px`,
              paddingRight: `${headerPx}px`,
            }}
            className="mx-auto flex items-center justify-between max-w-7xl"
          >
            <div className="flex items-center gap-3">
              <SummaLogo />
            </div>

            <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide text-[#DDE8DF]">
              <a href="#features" className="hover:text-[#B8FF4D] transition-colors">Features</a>
              <a href="#pricing" className="hover:text-[#B8FF4D] transition-colors">Pricing</a>
              <a href="#testimonial" className="hover:text-[#B8FF4D] transition-colors">Testimonials</a>
              <a href="#waitlist" className="hover:text-[#B8FF4D] transition-colors">Waitlist</a>
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
                className="px-5 py-2.5 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Mobile Hamburger Menu Toggle Button */}
            <div className="flex md:hidden items-center gap-2">
              <Link
                href="/sign-in"
                className="text-xs font-semibold text-[#DDE8DF] hover:text-white px-2 py-1"
              >
                Sign In
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-[#005A57]/60 text-[#FBFAF6] hover:bg-[#005A57] transition-colors border border-[#6D7E78]/30"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-[#005A57] p-5 space-y-4 bg-[#003F3F] rounded-b-2xl animate-in slide-in-from-top-2 duration-200">
              <nav className="flex flex-col space-y-3 text-sm font-medium text-[#DDE8DF]">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#B8FF4D] py-1 transition-colors"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#B8FF4D] py-1 transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#testimonial"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#B8FF4D] py-1 transition-colors"
                >
                  Testimonials
                </a>
                <a
                  href="#waitlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#B8FF4D] py-1 transition-colors"
                >
                  Waitlist
                </a>
              </nav>
              <div className="pt-3 border-t border-[#005A57] flex flex-col gap-2.5">
                <Link
                  href="/sign-up"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold text-center shadow-md transition-all"
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </header>
      </div>

      {/* MAIN CONTENT AREA */}
      <main>

        {/* 2. HERO SECTION - DEEP EMERALD SHELL WITH GRAIN */}
        <section id="hero" className="relative bg-[#003F3F] text-[#F5F3EC] pt-20 pb-24 md:pt-28 md:pb-36 px-6 text-center bg-grain-dark border-b border-[#005A57]">
          <div className="max-w-5xl mx-auto">
            {/* Branded Signal Tagline Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#005A57]/60 border border-[#6D7E78]/30 text-[#DDE8DF] text-xs font-medium mb-8 backdrop-blur-md">
              <span className="size-2 rounded-full bg-[#B8FF4D] animate-pulse" />
              <span>Summa AI 2.0 • Effortless Exam Preparation</span>
              <ArrowRight className="size-3 text-[#B8FF4D]" />
            </div>

            {/* Instrument Serif Hero Display Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal text-[#FBFAF6] tracking-tight leading-[1.08] mb-8">
              Study <em className="italic font-serif font-normal text-[#B8FF4D]">2x Faster,</em> <br className="hidden sm:inline" />
              Remember 10x More
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[#DDE8DF]/90 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
              Say goodbye to cramming. Turn your lectures, PDFs, and syllabus into instant AI flashcards, active recall quizzes, and 24/7 tutor support.
            </p>

            {/* Student Social Proof Pill */}
            <div className="inline-flex items-center gap-2 text-xs text-[#DDE8DF] font-mono mb-8 bg-[#003F3F]/60 px-4 py-1.5 rounded-full border border-[#005A57]">
              <span className="text-[#B8FF4D] font-bold">★ 4.9/5</span>
              <span className="text-[#6D7E78]">|</span>
              <span>Trusted by 15,000+ Students at Stanford, Berkeley & MIT</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-sm font-bold shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group"
              >
                <span>Start Free</span>
                <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#product"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#005A57]/60 hover:bg-[#005A57] border border-[#6D7E78]/40 text-sm font-medium text-[#F5F3EC] transition-all flex items-center justify-center gap-2.5 group"
              >
                <Play className="size-4 text-[#B8FF4D] fill-[#B8FF4D] group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </a>
            </div>

            {/* Hero Product Showcase Panel */}
            <div id="product" className="relative rounded-3xl bg-[#005A57]/30 border border-[#6D7E78]/30 p-4 sm:p-7 shadow-2xl backdrop-blur-xl max-w-5xl mx-auto text-left group transition-all hover:border-[#6D7E78]/50">
              {/* Decorative Glass Glows */}
              <div className="absolute -top-20 -right-20 size-64 rounded-full bg-[#B8FF4D]/10 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-[#005A57]/30 blur-3xl pointer-events-none" />

              {/* Product Chrome Top Bar */}
              <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border border-[#005A57] mb-6 bg-[#003F3F]/90 rounded-2xl shadow-inner backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-[#E9B8A7]/70" />
                  <div className="size-3 rounded-full bg-[#B8FF4D]/70" />
                  <div className="size-3 rounded-full bg-[#6D7E78]/50" />
                </div>
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#005A57]/60 border border-[#6D7E78]/40 text-[11px] font-mono text-[#DDE8DF] shadow-sm">
                  <Sparkles className="size-3.5 text-[#B8FF4D] animate-pulse" />
                  <span className="tracking-tight text-white font-medium">summa-ai.app/csc-201/active-recall</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#DDE8DF] font-mono bg-[#005A57]/40 px-3 py-1 rounded-full border border-[#005A57]">
                  <span className="inline-block size-2 rounded-full bg-[#B8FF4D] animate-ping" />
                  <span className="font-semibold text-white">Active Session</span>
                </div>
              </div>

              {/* Grid Content */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left Active Conversation */}
                <div className="md:col-span-7 bg-[#003F3F]/90 border border-[#005A57] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between text-xs border-b border-[#005A57] pb-3">
                    <div className="flex items-center gap-2 font-mono text-[#DDE8DF]">
                      <span className="size-2 rounded-full bg-[#B8FF4D]" />
                      <span className="font-bold text-white text-xs">CSC 201 — Data Structures</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#6D7E78] bg-[#005A57]/40 px-2.5 py-0.5 rounded-full border border-[#005A57]">
                      Context: 4 Lectures Loaded
                    </span>
                  </div>

                  {/* Student Prompt Bubble */}
                  <div className="bg-[#005A57] border border-[#6D7E78]/40 rounded-2xl rounded-tr-sm p-4 text-xs text-white max-w-[88%] ml-auto shadow-md leading-relaxed font-medium">
                    Can you explain how AVL tree self-balancing works before tomorrow's midterm?
                  </div>

                  {/* AI Response Card */}
                  <div className="bg-[#FBFAF6] text-[#102B2B] rounded-2xl p-5 text-xs space-y-3 max-w-[95%] shadow-2xl border border-[#DDE8DF] relative overflow-hidden">
                    <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#005A57]" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-[#003F3F]">
                        <Sparkles className="size-4 text-[#005A57]" />
                        <span className="text-xs uppercase tracking-wide font-mono">Summa Intelligent Recall</span>
                      </div>
                      <span className="text-[10px] font-mono text-[#005A57] bg-[#E7EFE7] px-2 py-0.5 rounded-full font-bold">100% Grounded</span>
                    </div>
                    <p className="leading-relaxed text-[#102B2B] text-xs">
                      AVL trees maintain height balance by checking the balance factor: <code className="font-mono bg-[#DDE8DF] px-2 py-0.5 rounded text-[#003F3F] font-bold">BF = height(Left) - height(Right)</code>. If <code className="font-mono bg-[#DDE8DF] px-1.5 py-0.5 rounded text-[#003F3F]">|BF| &gt; 1</code>, it executes a single or double rotation.
                    </p>
                    <div className="pt-2.5 flex items-center gap-2 text-[10px] text-[#6D7E78] border-t border-[#DDE8DF] font-mono">
                      <CheckCircle2 className="size-3.5 text-[#005A57]" />
                      <span className="font-medium text-[#102B2B]">Grounded in Lecture 7: Tree Rotations (Slide 14)</span>
                    </div>
                  </div>
                </div>

                {/* Right Context Cards */}
                <div className="md:col-span-5 space-y-4">
                  {/* Course Mastery Metric Card */}
                  <div className="p-5 rounded-2xl bg-[#003F3F]/90 border border-[#005A57] shadow-xl relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#DDE8DF]">Course Mastery Score</span>
                      <span className="text-xs font-mono font-bold text-[#B8FF4D] bg-[#005A57] px-2 py-0.5 rounded-full">+14% this week</span>
                    </div>
                    <div className="text-4xl font-serif font-normal text-white mb-3 tracking-tight">88%</div>
                    <div className="w-full bg-[#005A57] rounded-full h-2.5 overflow-hidden p-0.5 border border-[#6D7E78]/30">
                      <div className="bg-[#B8FF4D] h-full rounded-full w-[88%] transition-all duration-1000" />
                    </div>
                  </div>

                  {/* Active Recall Card Status */}
                  <div className="p-4 rounded-2xl bg-[#003F3F]/90 border border-[#005A57] flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-[#005A57] text-[#B8FF4D] flex items-center justify-center font-bold shadow-sm">
                        <Brain className="size-5" />
                      </div>
                      <div>
                        <strong className="block text-xs text-white font-semibold">Active Recall Cards</strong>
                        <span className="text-[11px] text-[#DDE8DF]/80 font-mono">14 new cards generated</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#B8FF4D] text-[#003F3F] text-[10px] font-mono font-bold shadow-sm">Ready</span>
                  </div>

                  {/* Connected Sources Status */}
                  <div className="p-4 rounded-2xl bg-[#003F3F]/90 border border-[#005A57] flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-[#005A57] text-[#B8FF4D] flex items-center justify-center font-bold shadow-sm">
                        <BookOpen className="size-5" />
                      </div>
                      <div>
                        <strong className="block text-xs text-white font-semibold">Connected Sources</strong>
                        <span className="text-[11px] text-[#DDE8DF]/80 font-mono">Syllabus + 12 PDFs</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#005A57] text-[#DDE8DF] text-[10px] font-mono font-bold border border-[#6D7E78]/40">Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. TRUSTED SCHOLARS BAR */}
        <section id="brand" className="py-12 bg-[#F5F3EC] border-b border-[#E7EFE7]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#6D7E78] mb-6 font-mono">
              TRUSTED BY STUDENTS AT TOP UNIVERSITIES
            </p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center text-[#003F3F]">
              <div className="text-sm font-serif font-normal">STANFORD UNIV</div>
              <div className="text-sm font-serif font-normal">MIT CAMPUS</div>
              <div className="text-sm font-serif font-normal">HARVARD SCHOLARS</div>
              <div className="text-sm font-serif font-normal">OXFORD ACADEMY</div>
              <div className="text-sm font-serif font-normal">CAMBRIDGE LABS</div>
              <div className="text-sm font-serif font-normal">UC BERKELEY</div>
            </div>
          </div>
        </section>

        {/* 4. FEATURES SECTION - HIGH CONVERSION STUDENT VALUE GRID */}
        <section id="features" className="py-28 px-6 bg-[#FBFAF6] text-[#102B2B]">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mb-16 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8DF] text-[#003F3F] text-[11px] font-mono font-semibold mb-4">
                FEATURES • ENGINEERED FOR ACADEMIC EXCELLENCE
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#102B2B] tracking-tight leading-[1.12]">
                Everything You Need to <br />
                <span className="italic text-[#005A57]">Master Any Course Faster</span>
              </h2>
              <p className="text-[#6D7E78] text-sm sm:text-base mt-4 max-w-2xl leading-relaxed">
                Turn overwhelming lectures, heavy textbooks, and dense slide decks into structured active recall decks and 24/7 exam prep tools.
              </p>
            </div>

            {/* Asymmetric Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card 1 */}
              <div className="md:col-span-7 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="size-12 rounded-2xl bg-[#003F3F] text-[#B8FF4D] flex items-center justify-center mb-6">
                    <MessageSquare className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Adaptive AI Tutoring</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed max-w-md">
                    Matches your course difficulty in real-time. Explains complex topics using analogies tailored to your learning pace and exam format.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#003F3F] font-mono">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Zap className="size-3.5 text-[#005A57]" />
                    <span>Real-Time Concept Breakdown</span>
                  </span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform text-[#005A57]" />
                </div>
              </div>

              {/* Card 2 */}
              <div className="md:col-span-5 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="size-12 rounded-2xl bg-[#005A57] text-[#F5F3EC] flex items-center justify-center mb-6">
                    <Layers className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">All-in-One Course Vault</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed">
                    Upload lecture PDFs, slides, and syllabus notes. Summa AI links every answer directly to your exact course citations.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#005A57] font-mono">
                  <span className="font-semibold flex items-center gap-1.5">
                    <FolderOpen className="size-3.5 text-[#005A57]" />
                    <span>PDFs • Slides • Syllabi</span>
                  </span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3 */}
              <div className="md:col-span-5 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="size-12 rounded-2xl bg-[#E9DED0] text-[#003F3F] flex items-center justify-center mb-6">
                    <Heart className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Stress-Free Study Coach</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed">
                    Goes beyond rigid Q&amp;A. Provides encouraging active-recall prompts, confidence scores, and step-by-step guidance when exam stress builds.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#003F3F] font-mono">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Heart className="size-3.5 text-[#005A57] fill-[#005A57]" />
                    <span>Personalized Encouragement</span>
                  </span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform text-[#005A57]" />
                </div>
              </div>

              {/* Card 4 */}
              <div className="md:col-span-7 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] p-8 flex flex-col justify-between hover:shadow-lg transition-all group">
                <div>
                  <div className="size-12 rounded-2xl bg-[#003F3F] text-[#B8FF4D] flex items-center justify-center mb-6">
                    <Cpu className="size-6" />
                  </div>
                  <h3 className="text-2xl font-serif font-normal text-[#102B2B] mb-3">Ground Truth Guarantee</h3>
                  <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed max-w-md">
                    Strict zero-hallucination guardrails ensure every AI flashcard, quiz question, and explanation is 100% verified against your syllabus.
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center justify-between text-xs text-[#003F3F] font-mono">
                  <span className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="size-3.5 text-[#005A57]" />
                    <span>Zero Hallucination Guardrails</span>
                  </span>
                  <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform text-[#005A57]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. BENEFIT SECTION - MIST GREEN CONTAINER */}
        <section id="benefit" className="py-28 px-6 bg-[#DDE8DF]/40 border-y border-[#DDE8DF]">
          <div className="max-w-7xl mx-auto text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003F3F] text-[#B8FF4D] text-[11px] font-mono font-semibold mb-4">
              BENEFITS
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-normal text-[#102B2B] tracking-tight leading-[1.1]">
              The Human Touch, Enhanced by <span className="italic text-[#005A57]">Intelligence</span>
            </h2>
            <p className="text-[#6D7E78] text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Experience an AI study companion that understands your academic goals, adapts to your schedule, and grows smarter with every exchange.
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF]">
              <div className="md:col-span-6 space-y-4 text-left">
                <span className="text-xs font-mono font-semibold text-[#005A57] uppercase tracking-wider">01 / HABITS</span>
                <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[#102B2B]">Build Meaningful Study Habits</h3>
                <p className="text-xs sm:text-sm text-[#6D7E78] leading-relaxed">
                  Summa AI turns overwhelming course syllabi into interactive daily recall sessions—turning dry reading into experiences that feel personal and motivating.
                </p>
                <Link href="/sign-up" className="inline-flex items-center gap-2 text-xs font-bold text-[#003F3F] hover:text-[#005A57] transition-colors pt-2">
                  <span>Start Building Habits</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
              <div className="md:col-span-6 bg-[#FBFAF6] rounded-2xl border border-[#DDE8DF] p-6">
                <div className="flex items-center justify-between mb-4 border-b border-[#DDE8DF] pb-3 text-xs text-[#6D7E78] font-mono">
                  <span>Habit Consistency Tracker</span>
                  <span className="text-[#005A57] font-bold">12 Day Streak 🔥</span>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-mono text-[#6D7E78]">
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">MON</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">TUE</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">WED</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">THU</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">FRI</div>
                  <div className="p-2 rounded-lg bg-[#DDE8DF] text-[#003F3F] font-bold">SAT</div>
                  <div className="p-2 rounded-lg bg-[#003F3F] text-[#B8FF4D] font-bold">SUN</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PRICING SECTION - DISCIPLINED CARDS */}
        <section id="pricing" className="py-28 px-6 max-w-7xl mx-auto text-[#102B2B]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8DF] text-[#003F3F] text-[11px] font-mono font-semibold mb-4">
              PRICING
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] tracking-tight mb-4">
              Choose the Plan That <span className="italic text-[#005A57]">Grows With You</span>
            </h2>
            <p className="text-[#6D7E78] text-sm sm:text-base mb-8">
              Scale your academic performance with flexible options designed for students and study groups.
            </p>

            <div className="inline-flex items-center p-1 rounded-full bg-[#E7EFE7]">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "monthly" ? "bg-[#003F3F] text-[#F5F3EC] shadow-sm" : "text-[#6D7E78] hover:text-[#102B2B]"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === "yearly" ? "bg-[#003F3F] text-[#F5F3EC] shadow-sm" : "text-[#6D7E78] hover:text-[#102B2B]"
                }`}
              >
                Yearly <span className="text-[10px] text-[#B8FF4D] font-mono ml-1 font-extrabold">SAVE 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-normal text-[#102B2B] mb-1">Starter</h3>
                <p className="text-xs text-[#6D7E78] mb-6">Essential AI study tools to get started.</p>
                <div className="mb-6">
                  <span className="text-5xl font-serif font-normal text-[#102B2B]">Free</span>
                  <span className="text-xs text-[#6D7E78] font-mono"> / forever</span>
                </div>
                <ul className="space-y-3 text-xs text-[#6D7E78] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>1,000+ AI tutor queries / month</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Basic active recall cards</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Core analytics dashboard</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-[#005A57] hover:bg-[#003F3F] text-xs font-bold text-[#F5F3EC] text-center transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Professional Plan (Deep Emerald Recommended Card) */}
            <div className="p-8 rounded-3xl bg-[#003F3F] text-[#F5F3EC] border-2 border-[#005A57] flex flex-col justify-between relative shadow-xl bg-grain-dark">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#B8FF4D] text-[10px] font-mono font-bold uppercase tracking-widest text-[#003F3F]">
                MOST POPULAR
              </div>
              <div>
                <h3 className="text-xl font-serif font-normal text-[#FBFAF6] mb-1">Professional Plan</h3>
                <p className="text-xs text-[#DDE8DF] mb-6">For scholars aiming for top GPA scores.</p>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-xl text-[#6D7E78] line-through font-mono">$59</span>
                  <span className="text-5xl font-serif font-normal text-white">
                    {billingCycle === "monthly" ? "$49" : "$39"}
                  </span>
                  <span className="text-xs text-[#DDE8DF] font-mono"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#DDE8DF] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Unlimited AI tutor queries</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Full syllabus &amp; PDF knowledge graph</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#B8FF4D] flex-shrink-0" />
                    <span>Predictive exam question generator</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-xs font-bold text-[#003F3F] text-center shadow-md transition-all hover:scale-[1.02]"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Campus Group */}
            <div className="p-8 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-serif font-normal text-[#102B2B] mb-1">Campus Group</h3>
                <p className="text-xs text-[#6D7E78] mb-6">Shared study workspace for project teams.</p>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-xl text-[#6D7E78] line-through font-mono">$109</span>
                  <span className="text-5xl font-serif font-normal text-[#102B2B]">
                    {billingCycle === "monthly" ? "$89" : "$69"}
                  </span>
                  <span className="text-xs text-[#6D7E78] font-mono"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-[#6D7E78] mb-8">
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Everything in Pro for 10 members</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Check className="size-4 text-[#005A57] flex-shrink-0" />
                    <span>Shared team course repositories</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/sign-up"
                className="w-full py-3.5 px-4 rounded-full bg-[#005A57] hover:bg-[#003F3F] text-xs font-bold text-[#F5F3EC] text-center transition-colors"
              >
                Create Study Group
              </Link>
            </div>
          </div>
        </section>

        {/* 7. TESTIMONIALS SECTION */}
        <section id="testimonial" className="py-28 px-6 bg-[#F5F3EC] border-t border-[#DDE8DF]">
          <div className="max-w-7xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003F3F] text-[#B8FF4D] text-[11px] font-mono font-semibold mb-4">
              TESTIMONIALS
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] tracking-tight">
              Loved by Students &amp; <span className="italic text-[#005A57]">Scholars</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  "Summa AI feels less like a software tool and more like a calm study partner. My midterm scores jumped from B- to A in two weeks."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Sarah L." />
                <div>
                  <strong className="block text-xs text-[#102B2B]">Sarah L.</strong>
                  <span className="text-[11px] text-[#6D7E78]">Computer Science • Stanford</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  "We replaced 3 different note apps with Summa. It not only saved hours of prep time but also made studying for finals feel effortless."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Daniel K." />
                <div>
                  <strong className="block text-xs text-[#102B2B]">Daniel K.</strong>
                  <span className="text-[11px] text-[#6D7E78]">Pre-Med Scholar • Harvard</span>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#FBFAF6] border border-[#DDE8DF] flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex gap-1 text-[#005A57]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-[#005A57]" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#102B2B] leading-relaxed">
                  "Summa understands lecture context better than any platform I've used. It's the first AI tutor that actually feels intelligent."
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-[#DDE8DF] flex items-center gap-3">
                <img className="size-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="Maya P." />
                <div>
                  <strong className="block text-xs text-[#102B2B]">Maya P.</strong>
                  <span className="text-[11px] text-[#6D7E78]">Biochemistry Senior • UC Berkeley</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. WAITLIST EARLY ACCESS SECTION */}
        <section id="waitlist" className="py-28 px-6 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDE8DF] text-[#003F3F] text-[11px] font-mono font-semibold mb-4">
            EARLY ACCESS
          </div>
          <h2 className="text-3xl sm:text-5xl font-serif font-normal text-[#102B2B] mb-4">
            Join the Summa AI Early Access Waitlist
          </h2>
          <p className="text-[#6D7E78] text-sm max-w-xl mx-auto mb-12 leading-relaxed">
            Reserve your spot for priority access to AI course memory indexing, active recall decks, and personalized semester study tools.
          </p>

          <div className="p-8 sm:p-10 rounded-3xl bg-[#F5F3EC] border border-[#DDE8DF] text-left shadow-md">
            {waitlistSubmitted ? (
              <div className="p-8 rounded-2xl bg-[#DDE8DF] border border-[#005A57]/20 text-[#003F3F] text-center space-y-3">
                <div className="inline-flex items-center justify-center size-12 rounded-full bg-[#003F3F] text-[#B8FF4D] mx-auto">
                  <CheckCircle2 className="size-6" />
                </div>
                <h3 className="text-xl font-serif font-normal text-[#003F3F]">You're on the waitlist!</h3>
                <p className="text-xs text-[#6D7E78] max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{waitlistName || "Scholar"}</strong>! We've reserved your priority access spot. We'll send invite code details to <strong>{waitlistEmail}</strong> soon.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#102B2B] mb-2">Full Name</label>
                    <input
                      type="text"
                      value={waitlistName}
                      onChange={(e) => setWaitlistName(e.target.value)}
                      placeholder="e.g. Alex Johnson"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] text-xs text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102B2B] mb-2">Student / Academic Email</label>
                    <input
                      type="email"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="alex@university.edu"
                      required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] text-xs text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#102B2B] mb-2">University / Institution</label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] text-xs text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102B2B] mb-2">Primary Major / Major Field</label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="e.g. Computer Science / Pre-Med"
                      className="w-full px-4 py-3.5 rounded-xl bg-[#FBFAF6] border border-[#DDE8DF] text-xs text-[#102B2B] placeholder:text-[#6D7E78] focus:outline-none focus:ring-2 focus:ring-[#005A57] transition-all shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isWaitlistLoading}
                  className="w-full py-4 rounded-full bg-[#B8FF4D] hover:bg-[#c7ff62] text-[#003F3F] text-xs font-bold shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isWaitlistLoading ? (
                    <span>Processing Reservation...</span>
                  ) : (
                    <>
                      <span>Join Early Access Waitlist</span>
                      <ArrowRight className="size-4 text-[#003F3F]" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* 9. PREMIUM DEEP EMERALD GRAINY FOOTER */}
        <footer className="pt-24 pb-16 px-6 bg-[#003F3F] text-[#F5F3EC] border-t border-[#005A57] bg-grain-dark relative overflow-hidden">
          {/* Subtle Radial Glows */}
          <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-[#005A57]/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 right-1/4 size-96 rounded-full bg-[#005A57]/20 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            {/* Main Footer Links & Brand Column */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 text-left mb-20">
              <div className="md:col-span-5 space-y-5">
                <SummaLogo inverse />
                <p className="text-xs text-[#DDE8DF] leading-relaxed max-w-sm">
                  Elevate Learning Experiences with Timeless Precision. Summa AI brings active recall, course grounding, and intelligent tutoring into one calm rhythm.
                </p>

                {/* Email Contact & System Status Pill */}
                <div className="pt-2 space-y-3">
                  <div className="text-xs font-mono text-[#DDE8DF] flex items-center gap-2">
                    <Mail className="size-3.5 text-[#B8FF4D]" />
                    <a href="mailto:hello@summastudy.com.ng" className="hover:text-[#B8FF4D] transition-colors">
                      hello@summastudy.com.ng
                    </a>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#005A57]/60 border border-[#6D7E78]/30 text-[10px] font-mono text-[#DDE8DF]">
                    <span className="size-1.5 rounded-full bg-[#B8FF4D]" />
                    <span>Systems Operational • 99.98% Uptime</span>
                  </div>
                </div>
              </div>

              {/* Navigation Columns */}
              <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
                <div>
                  <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] flex items-center gap-2">
                    <span className="size-1 rounded-full bg-[#B8FF4D]" />
                    Product
                  </h5>
                  <ul className="space-y-3 text-[#DDE8DF]">
                    <li><a href="#hero" className="hover:text-[#B8FF4D] transition-colors flex items-center gap-1.5">Workspace</a></li>
                    <li><a href="#features" className="hover:text-[#B8FF4D] transition-colors flex items-center gap-1.5">AI Memory Cards</a></li>
                    <li><a href="#pricing" className="hover:text-[#B8FF4D] transition-colors flex items-center gap-1.5">Student Plans</a></li>
                    <li><a href="#waitlist" className="hover:text-[#B8FF4D] transition-colors flex items-center gap-1.5">Early Access</a></li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] flex items-center gap-2">
                    <span className="size-1 rounded-full bg-[#B8FF4D]" />
                    Resources
                  </h5>
                  <ul className="space-y-3 text-[#DDE8DF]">
                    <li><a href="#testimonial" className="hover:text-[#B8FF4D] transition-colors">Testimonials</a></li>
                    <li><a href="#benefit" className="hover:text-[#B8FF4D] transition-colors">Learning Method</a></li>
                    <li><a href="#waitlist" className="hover:text-[#B8FF4D] transition-colors">Waitlist Invite</a></li>
                    <li><Link href="/sign-in" className="hover:text-[#B8FF4D] transition-colors">Student Login</Link></li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-white mb-4 uppercase font-mono tracking-wider text-[11px] flex items-center gap-2">
                    <span className="size-1 rounded-full bg-[#B8FF4D]" />
                    Connect
                  </h5>
                  <ul className="space-y-3 text-[#DDE8DF]">
                    <li>
                      <a href="#" className="hover:text-[#B8FF4D] transition-colors flex items-center gap-2">
                        <span>Twitter / X</span>
                        <ArrowRight className="size-3 text-[#6D7E78]" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-[#B8FF4D] transition-colors flex items-center gap-2">
                        <span>LinkedIn</span>
                        <ArrowRight className="size-3 text-[#6D7E78]" />
                      </a>
                    </li>
                    <li>
                      <a href="#" className="hover:text-[#B8FF4D] transition-colors flex items-center gap-2">
                        <span>Instagram</span>
                        <ArrowRight className="size-3 text-[#6D7E78]" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Footer Section with Watermark Display */}
            <div className="pt-8 border-t border-[#005A57] flex flex-col md:flex-row items-center justify-between gap-6 text-[11px] text-[#6D7E78] font-mono">
              <div className="flex items-center gap-6">
                <span>© 2026 Summa AI Inc. · All rights reserved.</span>
                <span className="hidden sm:inline">Privacy Policy</span>
                <span className="hidden sm:inline">Terms of Service</span>
              </div>

              {/* Large Display Watermark */}
              <div className="text-4xl sm:text-6xl font-serif font-normal text-[#005A57]/40 select-none tracking-widest leading-none">
                SUMMA AI
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
