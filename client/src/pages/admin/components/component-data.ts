import React from "react";
import { ArrowRight } from "lucide-react";

export interface ComponentMeta {
  id: string;
  title: string;
  category: string;
  desc: string;
  badgeBg: string;
  icon: React.ReactNode;
  preview: React.ReactNode;
  whatIsIt?: string;
  whySummaUsesIt?: string;
  techniques?: string[];
  whenSummaUsesIt?: string[];
  example?: string;
  whatHappensAfter?: { step: string; detail: string }[];
  usedWith?: string[];
  decisionSignals?: string[];
}

export const components: ComponentMeta[] = [
    // --- CORE LEARNING ---
    {
      id: "multiple_choice",
      title: "1. Multiple Choice",
      category: "Core Learning",
      desc: "Question + options + instant feedback. Pick the best answer to test baseline comprehension.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center space-y-1.5">
          <p className="text-[11px] font-semibold text-ink dark:text-cream-soft leading-tight">
            What is the main function of mitochondria?
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-grey-green dark:text-[#8FA29B]">
              <div className="size-2.5 rounded-full border border-slate-300" />
              <span>Protein synthesis</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-ink dark:text-cream-soft bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 font-medium">
              <div className="size-2.5 rounded-full border-2 border-teal-dark dark:border-accent-lime flex items-center justify-center">
                <div className="size-1 rounded-full bg-teal-dark/10 dark:bg-accent-lime" />
              </div>
              <span>Energy production (ATP)</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-0.5 rounded-lg text-[10px] text-grey-green dark:text-[#8FA29B]">
              <div className="size-2.5 rounded-full border border-slate-300" />
              <span>Cellular division</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "A question with several answer options where the learner selects the best fit. Provides immediate correctness feedback.",
      whySummaUsesIt: "Summa uses multiple choice when it needs to quickly assess baseline comprehension of a concept. It is efficient for covering breadth and identifying specific misconceptions through distractor analysis.",
      techniques: ["Assessment", "Recall", "Misconception Detection"],
      whenSummaUsesIt: ["New concept was just introduced", "Summa needs to verify understanding before moving on", "Multiple related concepts need quick differentiation", "Exam preparation requires breadth coverage"],
      example: "You are studying cellular biology. Summa introduces mitochondria and immediately asks a multiple choice question to verify you grasped the core function before moving to ATP synthesis.",
      whatHappensAfter: [{ step: "Student selects answer", detail: "Response captured and evaluated" }, { step: "Feedback delivered", detail: "Correct: reinforcement. Incorrect: targeted explanation" }, { step: "Learner Model updated", detail: "Comprehension level recorded for this concept" }, { step: "Next Best Action calculated", detail: "Advance, review, or deepen based on result" }],
      usedWith: ["Short Answer", "Confidence Check", "Spaced Review"],
      decisionSignals: ["Concept newly introduced", "Breadth check needed", "Distractor analysis valuable"],
    },
    {
      id: "short_answer",
      title: "2. Short Answer",
      desc: "Student writes an open explanation → Summa evaluates key ideas and offers precise feedback.",
      category: "Core Learning",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-ink dark:text-cream-soft leading-tight">
            Explain the difference between stack and heap memory.
          </p>
          <div className="relative mt-1.5">
            <div className="w-full h-14 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-xl p-2 text-[10px] text-grey-green dark:text-[#8FA29B] font-sans leading-tight">
              Stack holds static local frames; heap allocates dynamic objects...
            </div>
            <button className="absolute right-1.5 bottom-1.5 size-5 rounded-full bg-teal-dark/10 dark:bg-accent-lime/100 text-white flex items-center justify-center shadow-xs">
              <ArrowRight size={10} />
            </button>
          </div>
        </div>
      ),
      whatIsIt: "An open-ended question where the student writes a free-text response. Summa evaluates key ideas and provides precise feedback.",
      whySummaUsesIt: "Summa uses short answer when it needs to evaluate understanding beyond recognition, when the learner must actively construct an explanation. This reveals depth that multiple choice cannot.",
      techniques: ["Active Recall", "Elaborative Learning", "Assessment"],
      whenSummaUsesIt: ["Student has learned a concept and needs to demonstrate understanding", "Summa wants to check if the student can articulate, not just recognize", "The concept has multiple key ideas that need coverage", "Before marking a concept as understood"],
      example: "After explaining stack vs heap memory, Summa asks you to write a short explanation of the difference. Your response is evaluated for completeness and accuracy.",
      whatHappensAfter: [{ step: "Student writes response", detail: "Free text captured" }, { step: "Summa evaluates key ideas", detail: "Checks for required concepts and accuracy" }, { step: "Feedback delivered", detail: "What was correct, what was missing, what was wrong" }, { step: "Mastery estimate updated", detail: "Depth of understanding recorded" }],
      usedWith: ["Explanation Card", "Worked Example", "Mastery Card"],
      decisionSignals: ["Depth check needed", "Articulation reveals true understanding", "Concept has nuance"],
    },
    {
      id: "true_false",
      title: "3. True / False",
      desc: "Simple, rapid-fire statement validation to quickly clear misconceptions.",
      category: "Core Learning",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase tracking-wide">Rapid Check</span>
            <p className="text-[11px] font-semibold text-ink dark:text-cream-soft leading-tight">
              Java interfaces can contain private helper methods in Java 9+.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="py-2 bg-teal-dark/10 dark:bg-accent-lime/10 border border-emerald-300 rounded-lg text-center font-bold text-xs text-teal-dark dark:text-accent-lime">
              TRUE ✓
            </div>
            <div className="py-2 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-center font-bold text-xs text-grey-green dark:text-[#8FA29B] opacity-60">
              FALSE
            </div>
          </div>
        </div>
      ),
      whatIsIt: "A statement that the learner judges as true or false. Rapid-fire validation to clear misconceptions quickly.",
      whySummaUsesIt: "Summa uses true/false for quick, low-friction checks that keep the learning pace moving. Especially useful for testing factual recall and exposing common misunderstandings.",
      techniques: ["Rapid Recall", "Misconception Detection", "Factual Validation"],
      whenSummaUsesIt: ["Multiple factual claims need quick validation", "A common misconception needs direct confrontation", "Pace needs to stay fast during review sessions", "The concept has clear binary boundaries"],
      example: "Summa states: Java interfaces can contain private helper methods in Java 9+. You evaluate, this tests whether you know the Java 9+ interface enhancement.",
      whatHappensAfter: [{ step: "Student judges True/False", detail: "Response captured" }, { step: "Instant feedback", detail: "Explanation of why the statement is true or false" }, { step: "Misconception flagged", detail: "If incorrect, the specific misunderstanding is logged" }, { step: "Recall strength updated", detail: "Contributes to retention estimate" }],
      usedWith: ["Multiple Choice", "Rapid Recall", "Confidence Check"],
      decisionSignals: ["Factual claim needs validation", "Quick pace required", "Binary concept boundaries"],
    },
    {
      id: "fill_blank",
      title: "4. Fill in the Blank",
      desc: "Excellent for locking in essential technical terminology, syntax, and exact formulas.",
      category: "Core Learning",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center space-y-3">
          <p className="text-[11px] text-ink dark:text-cream-soft leading-relaxed">
            In OOP, <span className="inline-block px-2 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 text-teal-dark dark:text-accent-lime font-bold rounded">polymorphism</span> allows dynamic method dispatch at runtime.
          </p>
          <div className="flex items-center gap-1 text-[10px] text-grey-green dark:text-[#8FA29B]">
            <span className="font-semibold text-teal-dark dark:text-accent-lime">Hint:</span> Means "many forms"
          </div>
        </div>
      ),
      whatIsIt: "A sentence or formula with a missing term that the learner must complete. Excellent for terminology and exact formulas.",
      whySummaUsesIt: "Summa uses fill-in-the-blank when precise terminology or exact formulas must be memorized. It forces active recall of specific terms rather than recognition.",
      techniques: ["Active Recall", "Terminology Mastery", "Precision Training"],
      whenSummaUsesIt: ["Key terminology must be remembered exactly", "Formulas or syntax require precise recall", "The student tends to approximate rather than recall precisely", "Exam requires exact terms"],
      example: "In OOP, _____ allows dynamic method dispatch at runtime. You must recall the exact term: polymorphism.",
      whatHappensAfter: [{ step: "Student fills in the blank", detail: "Response compared against correct answer" }, { step: "Precision evaluated", detail: "Exact match, close match, or incorrect" }, { step: "Feedback delivered", detail: "Confirmation or correction with context" }, { step: "Terminology mastery tracked", detail: "Recorded for spaced review scheduling" }],
      usedWith: ["Recall Prompt", "Spaced Review", "Memory Check"],
      decisionSignals: ["Exact term recall needed", "Formula precision required", "Student approximates terms"],
    },
    {
      id: "matching",
      title: "5. Matching",
      category: "Core Learning",
      desc: "Match concepts ↔ definitions to build strong structural associations.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      preview: (
        <div className="relative w-full h-[140px] bg-white rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex items-center justify-between">
          <div className="space-y-2 z-10">
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-[9px] font-medium text-ink dark:text-cream-soft">
              Photosynthesis
            </div>
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-[9px] font-medium text-ink dark:text-cream-soft">
              Mitochondria
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-current" viewBox="0 0 200 120">
            <path d="M 80 40 C 120 40, 110 80, 140 80" stroke="currentColor" className="text-teal-dark dark:text-accent-lime" strokeWidth="1.5" fill="none" />
            <path d="M 80 75 C 110 75, 110 38, 140 38" stroke="currentColor" className="text-teal-dark dark:text-accent-lime" strokeWidth="1.5" fill="none" />
          </svg>
          <div className="space-y-2 z-10 text-right">
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-[9px] font-medium text-ink dark:text-cream-soft">
              ATP energy production
            </div>
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg text-[9px] font-medium text-ink dark:text-cream-soft">
              Light into glucose
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Match concepts to their definitions, properties, or related items. Builds structural associations between related ideas.",
      whySummaUsesIt: "Summa uses matching when it needs to build or verify structural associations between concepts. Particularly effective for vocabulary, terminology networks, and concept mapping.",
      techniques: ["Association Building", "Structural Learning", "Concept Mapping"],
      whenSummaUsesIt: ["Multiple related concepts need to be connected", "Vocabulary or terminology network is being built", "The student confuses similar concepts", "Review of related concept pairs"],
      example: "Match: Photosynthesis to Light into glucose. Mitochondria to ATP energy production. This reinforces the relationship between organelles and their functions.",
      whatHappensAfter: [{ step: "Student matches pairs", detail: "All pairings captured" }, { step: "Correct matches confirmed", detail: "Correct associations reinforced" }, { step: "Incorrect matches corrected", detail: "Wrong associations explicitly corrected" }, { step: "Association strength updated", detail: "Concept pair relationships recorded" }],
      usedWith: ["Categorization", "Compare & Contrast", "Retrieval Grid"],
      decisionSignals: ["Concept pairs need reinforcement", "Vocabulary network building", "Confusion between similar items"],
    },
    {
      id: "ordering",
      title: "6. Ordering",
      category: "Core Learning",
      desc: "Arrange events, execution steps or multi-stage algorithms into the correct sequence.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs space-y-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 px-2.5 py-1 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded-lg">
            <span className="size-3.5 rounded-full bg-teal-dark dark:bg-accent-lime text-white font-bold text-[8px] flex items-center justify-center">1</span>
            <span className="text-[9px] font-semibold text-ink dark:text-cream-soft">Compile Source Code</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg">
            <span className="size-3.5 rounded-full bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] font-bold text-[8px] flex items-center justify-center">2</span>
            <span className="text-[9px] font-medium text-ink dark:text-cream-soft">Generate Bytecode</span>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg">
            <span className="size-3.5 rounded-full bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] font-bold text-[8px] flex items-center justify-center">3</span>
            <span className="text-[9px] font-medium text-ink dark:text-cream-soft">Load via JVM ClassLoader</span>
          </div>
        </div>
      ),
      whatIsIt: "Arrange events, steps, or processes into the correct sequence. Tests understanding of procedural and chronological knowledge.",
      whySummaUsesIt: "Summa uses ordering when the sequence of events or steps is critical to understanding. It reveals whether the learner understands not just what happens, but in what order and why.",
      techniques: ["Procedural Knowledge", "Sequential Reasoning", "Process Understanding"],
      whenSummaUsesIt: ["A process has critical sequential dependencies", "Algorithm steps need to be understood in order", "Historical events require chronological knowledge", "The student understands components but not the flow"],
      example: "Put in order: Compile Source Code, Generate Bytecode, Load via JVM ClassLoader. This tests understanding of the Java compilation pipeline.",
      whatHappensAfter: [{ step: "Student orders items", detail: "Sequence captured" }, { step: "Sequence validated", detail: "Correct order confirmed or corrected" }, { step: "Procedural understanding assessed", detail: "Whether student grasps dependencies" }, { step: "Next action determined", detail: "Advance or review based on accuracy" }],
      usedWith: ["Categorization", "Concept Breakdown", "Worked Example"],
      decisionSignals: ["Sequence matters", "Process understanding needed", "Steps have dependencies"],
    },
    {
      id: "categorization",
      title: "7. Categorization",
      category: "Core Learning",
      desc: "Drag or sort concepts into appropriate categories or taxonomy buckets.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs grid grid-cols-2 gap-2">
          <div className="bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded-lg p-2 space-y-1">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft block">Linear Data</span>
            <div className="bg-white dark:bg-[#1C2323] border border-teal-dark/30 dark:border-accent-lime/30 rounded px-1.5 py-0.5 text-[8px] font-medium text-ink dark:text-cream-soft">Arrays</div>
            <div className="bg-white dark:bg-[#1C2323] border border-teal-dark/30 dark:border-accent-lime/30 rounded px-1.5 py-0.5 text-[8px] font-medium text-ink dark:text-cream-soft">Linked Lists</div>
          </div>
          <div className="bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] rounded-lg p-2 space-y-1">
            <span className="text-[9px] font-bold text-grey-green dark:text-[#8FA29B] block">Non-Linear</span>
            <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded px-1.5 py-0.5 text-[8px] font-medium text-ink dark:text-cream-soft">Trees</div>
            <div className="bg-white dark:bg-[#1C2323] border border-mist-green dark:border-[#2A3838] rounded px-1.5 py-0.5 text-[8px] font-medium text-ink dark:text-cream-soft">Graphs</div>
          </div>
        </div>
      ),
      whatIsIt: "Sort or drag concepts into appropriate categories or taxonomy buckets. Tests classification and conceptual boundaries.",
      whySummaUsesIt: "Summa uses categorization when it needs to verify that the learner can classify concepts correctly. This reveals whether the student understands the boundaries and properties that define categories.",
      techniques: ["Classification", "Conceptual Boundaries", "Taxonomy Building"],
      whenSummaUsesIt: ["Concepts belong to distinct categories", "The student needs to understand what makes something belong to a group", "Classification rules need to be learned", "Multiple categories with overlapping features"],
      example: "Sort into Linear vs Non-Linear: Arrays goes to Linear. Linked Lists goes to Linear. Trees goes to Non-Linear. Graphs goes to Non-Linear.",
      whatHappensAfter: [{ step: "Student categorizes items", detail: "All placements captured" }, { step: "Categories validated", detail: "Correct classifications confirmed" }, { step: "Boundary understanding assessed", detail: "Whether student grasps category definitions" }, { step: "Concept map updated", detail: "Taxonomy relationships recorded" }],
      usedWith: ["Matching", "Compare & Contrast", "Concept Breakdown"],
      decisionSignals: ["Classification needed", "Category boundaries unclear", "Taxonomy learning in progress"],
    },
    {
      id: "teach_back",
      title: "8. Teach-Back",
      category: "Core Learning",
      desc: "'Explain this like you're teaching someone.' Forces Feynman-style active articulation.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-teal-dark dark:text-accent-lime font-bold text-[10px]">
            <span>🎓 Feynman Method</span>
          </div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-medium leading-tight">
            How would you explain recursion to a 10-year-old without using technical jargon?
          </p>
          <div className="w-full h-8 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded-lg p-1.5 text-[9px] text-ink dark:text-cream-soft italic">
            "It's like a Russian nesting doll..."
          </div>
        </div>
      ),
      whatIsIt: "Explain this like you are teaching someone. Forces Feynman-style active articulation of understanding.",
      whySummaUsesIt: "Summa uses teach-back when it needs the deepest possible assessment of understanding. If you can teach it, you know it. This reveals gaps that recognition-based methods miss entirely.",
      techniques: ["Retrieval Practice", "Elaborative Learning", "Metacognition"],
      whenSummaUsesIt: ["A concept has been learned and needs deep verification", "The student thinks they understand but may not", "The concept is important enough to warrant thorough checking", "Pre-exam or pre-assessment verification"],
      example: "How would you explain recursion to a 10-year-old without using technical jargon? Your response reveals whether you truly understand the core idea.",
      whatHappensAfter: [{ step: "Student writes explanation", detail: "Free-form teaching response captured" }, { step: "Summa evaluates explanation", detail: "Checks for clarity, accuracy, completeness" }, { step: "Gaps identified", detail: "What the student missed or got wrong" }, { step: "Mastery confirmed or deepened", detail: "If gaps found, targeted follow-up deployed" }],
      usedWith: ["Explanation Card", "Confidence Check", "Mastery Card"],
      decisionSignals: ["Deep verification needed", "Student may have surface understanding", "Concept is high-stakes"],
    },
    {
      id: "confidence_check",
      title: "9. Confidence Check",
      category: "Core Learning",
      desc: "Rate how confident you feel (1–5) and pair it directly with actual test performance.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <p className="text-[11px] font-semibold text-ink dark:text-cream-soft leading-tight">
            How confident do you feel about Big-O time complexity analysis?
          </p>
          <div className="flex items-center justify-between gap-1 py-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                className={`size-7 rounded-lg font-bold text-xs flex items-center justify-center ${
                  level === 4
                    ? "bg-teal-dark/10 dark:bg-accent-lime text-white shadow-xs"
                    : "bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] hover:bg-mist-green/50 dark:hover:bg-[#2A3838]"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-grey-green dark:text-[#8FA29B] text-center font-medium">1 = Unsure · 5 = Mastered</div>
        </div>
      ),
      whatIsIt: "Rate how confident you feel (1 to 5) and pair it directly with actual test performance. Surfaces overconfidence and underconfidence.",
      whySummaUsesIt: "Summa uses confidence checks to calibrate the learner's self-awareness. Knowing what you don't know is as important as knowing what you do. This pairing reveals calibration gaps.",
      techniques: ["Metacognition", "Self-Assessment Calibration", "Learning Awareness"],
      whenSummaUsesIt: ["After a quiz or practice session", "The student may be overconfident or underconfident", "Calibration of self-assessment is needed", "Before recommending next steps"],
      example: "How confident do you feel about Big-O time complexity analysis? You rate 4 out of 5. Then you score 60% on a quiz, revealing overconfidence.",
      whatHappensAfter: [{ step: "Student rates confidence", detail: "Self-assessment captured (1-5)" }, { step: "Performance compared", detail: "Confidence vs actual score analyzed" }, { step: "Calibration gap flagged", detail: "Over or under-confidence identified" }, { step: "Next action adjusted", detail: "If overconfident: more practice. If underconfident: encouragement plus proof" }],
      usedWith: ["Multiple Choice", "Short Answer", "Mastery Card"],
      decisionSignals: ["Self-awareness check needed", "After assessment", "Calibration matters"],
    },
    {
      id: "scenario",
      title: "10. Scenario / Case Study",
      category: "Core Learning",
      desc: "Give a realistic engineering/academic situation for the student to apply knowledge.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex gap-2 items-center">
          <div className="w-16 h-20 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded-lg p-1.5 flex flex-col justify-between shrink-0">
            <span className="text-[8px] font-bold text-teal-dark dark:text-accent-lime uppercase">CASE #104</span>
            <div className="size-4 rounded bg-teal-dark/10 dark:bg-accent-lime/100 text-white font-bold text-[8px] flex items-center justify-center">⚙</div>
          </div>
          <div className="flex-1 space-y-1.5">
            <p className="text-[10px] text-ink dark:text-cream-soft font-medium leading-snug">
              A high-traffic web server drops requests during peak hours. Which caching pattern resolves this?
            </p>
            <div className="flex justify-end">
              <button className="px-2 py-0.5 rounded bg-teal-dark/10 dark:bg-accent-lime/100 text-white text-[9px] font-bold">Solve</button>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Give a realistic engineering or academic situation for the student to apply knowledge in context.",
      whySummaUsesIt: "Summa uses scenarios when it needs to verify that the learner can apply knowledge to real-world situations. This bridges the gap between theoretical understanding and practical application.",
      techniques: ["Applied Learning", "Contextual Reasoning", "Problem Solving"],
      whenSummaUsesIt: ["Concepts need to be applied in realistic contexts", "The student knows the theory but has not applied it", "Exam questions use scenario-based formats", "Engineering or professional context requires application"],
      example: "A high-traffic web server drops requests during peak hours. Which caching pattern resolves this? You must apply caching knowledge to a realistic problem.",
      whatHappensAfter: [{ step: "Student analyzes scenario", detail: "Problem-solving approach captured" }, { step: "Solution evaluated", detail: "Correct approach and reasoning checked" }, { step: "Application skill assessed", detail: "Whether student can transfer knowledge" }, { step: "Contextual understanding recorded", detail: "Real-world application ability tracked" }],
      usedWith: ["Worked Example", "Short Answer", "Common Mistake Card"],
      decisionSignals: ["Application needed", "Theory-to-practice gap", "Exam uses scenarios"],
    },

    // --- TEACHING COMPONENTS ---
    {
      id: "explanation_card",
      title: "11. Explanation Card",
      category: "Teaching Components",
      desc: "Structured, high-clarity explanation with progressive disclosure of key insights.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">Core Principle</span>
            <h4 className="text-[11px] font-bold text-ink dark:text-cream-soft">Dynamic Method Dispatch</h4>
          </div>
          <p className="text-[10px] text-grey-green dark:text-[#8FA29B] leading-snug">
            At runtime, Java checks the actual object type (e.g. <code className="text-teal-dark dark:text-accent-lime font-mono">Dog</code>) rather than reference variable type.
          </p>
          <div className="text-[9px] text-teal-dark dark:text-accent-lime font-semibold cursor-pointer">▶ Tap to expand deep-dive</div>
        </div>
      ),
      whatIsIt: "Structured, high-clarity explanation with progressive disclosure of key insights.",
      whySummaUsesIt: "Summa uses explanation cards when a concept needs clear, structured teaching. Progressive disclosure prevents cognitive overload by revealing complexity gradually.",
      techniques: ["Scaffolding", "Progressive Disclosure", "Cognitive Load Management"],
      whenSummaUsesIt: ["A new concept needs to be taught clearly", "The concept has layers that should be revealed progressively", "The student benefits from structured presentation", "Building foundation before complexity"],
      example: "Summa explains Dynamic Method Dispatch: starts with the core principle, then reveals how Java checks actual object type at runtime rather than reference type.",
      whatHappensAfter: [{ step: "Explanation delivered", detail: "Structured content presented with progressive disclosure" }, { step: "Comprehension checked", detail: "Follow-up question to verify understanding" }, { step: "Depth adjusted", detail: "More examples if needed, or advance if understood" }, { step: "Concept marked as taught", detail: "Ready for practice and recall" }],
      usedWith: ["Worked Example", "Teach-Back", "Hint Ladder"],
      decisionSignals: ["New concept introduction", "Student needs structured teaching", "Progressive complexity appropriate"],
    },
    {
      id: "worked_example",
      title: "12. Worked Example",
      category: "Teaching Components",
      desc: "Problem → step-by-step breakdown → explicit reasoning → verified final answer.",
      badgeBg: "bg-cream-light dark:bg-[#232D2D] text-ink dark:text-cream-soft",
      icon: (
        <svg className="w-5 h-5 text-ink dark:text-cream-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-ink dark:text-cream-soft">Problem: Integrate ∫ 2x dx</div>
          <div className="pl-2 border-l-2 border-teal-dark dark:border-accent-lime text-[9px] text-grey-green dark:text-[#8FA29B] space-y-0.5">
            <div>Step 1: Apply power rule ∫ x^n dx = x^(n+1)/(n+1)</div>
            <div>Step 2: 2 * (x^2 / 2) = x^2</div>
          </div>
          <div className="px-2 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-mono text-[9px] font-bold rounded">
            Result: x² + C
          </div>
        </div>
      ),
      whatIsIt: "Problem, step-by-step breakdown, explicit reasoning, verified final answer.",
      whySummaUsesIt: "Summa uses worked examples when the student needs to see expert problem-solving in action. This reduces cognitive load by providing a model before independent practice.",
      techniques: ["Worked Examples", "Scaffolding", "Cognitive Load Management"],
      whenSummaUsesIt: ["The student has not yet solved this type of problem", "The problem type has specific steps that need demonstration", "Before asking the student to solve independently", "The concept involves multi-step reasoning"],
      example: "Problem: Integrate 2x dx. Step 1: Apply power rule. Step 2: 2 times x squared over 2. Result: x squared plus C.",
      whatHappensAfter: [{ step: "Worked example shown", detail: "Expert solution with reasoning displayed" }, { step: "Student attempts similar problem", detail: "Independent practice with new parameters" }, { step: "Performance evaluated", detail: "Comparison against expert model" }, { step: "Scaffolding adjusted", detail: "More examples or independent practice based on result" }],
      usedWith: ["Hint Ladder", "Short Answer", "Scenario"],
      decisionSignals: ["First exposure to problem type", "Multi-step reasoning needed", "Student needs expert model"],
    },
    {
      id: "hint_ladder",
      title: "13. Hint Ladder",
      category: "Teaching Components",
      desc: "Progressive hints (Hint 1 → Hint 2 → Guided Clue) without immediately giving away the answer.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-ink dark:text-cream-soft">Stuck on recursion base case?</div>
          <div className="space-y-1">
            <div className="px-2 py-1 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 text-ink dark:text-cream-soft text-[9px] rounded font-medium">
              💡 Hint 1: What condition causes n to stop decrementing?
            </div>
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] border border-mist-green dark:border-[#2A3838] text-grey-green dark:text-[#8FA29B] text-[9px] rounded opacity-60">
              🔒 Hint 2 (Locked)
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Progressive hints (Hint 1, Hint 2, stronger hint, solution) without immediately giving away the answer.",
      whySummaUsesIt: "Summa uses hint ladders when a student is struggling but still has enough understanding to reach the answer independently. Instead of giving away the solution, Summa progressively increases support.",
      techniques: ["Scaffolding", "Guided Practice", "Active Recall", "Error Correction"],
      whenSummaUsesIt: ["Student is stuck but not completely lost", "The problem is solvable with the right nudge", "Giving the answer would skip important learning", "The student has partial understanding"],
      example: "Stuck on recursion base case? Hint 1: What condition causes n to stop decrementing? Hint 2: Think about when n equals 0 or 1.",
      whatHappensAfter: [{ step: "Hint 1 delivered", detail: "Gentle nudge toward the answer" }, { step: "Student responds", detail: "If correct: advance. If wrong: Hint 2" }, { step: "Progressive support", detail: "Each hint provides more specific guidance" }, { step: "Resolution", detail: "Student reaches answer with or without final reveal" }],
      usedWith: ["Worked Example", "Short Answer", "Confidence Check"],
      decisionSignals: ["Student is stuck", "Partial understanding exists", "Answer reveal would skip learning"],
    },
    {
      id: "concept_breakdown",
      title: "14. Concept Breakdown",
      category: "Teaching Components",
      desc: "Deconstructs complex subjects into digestable, modular sub-concepts.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[10px] font-bold text-ink dark:text-cream-soft">Database Indexing</div>
          <div className="grid grid-cols-2 gap-1 text-[9px]">
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-ink dark:text-cream-soft font-medium">B-Trees</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-ink dark:text-cream-soft font-medium">Hash Tables</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-ink dark:text-cream-soft font-medium">Scan Overhead</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-ink dark:text-cream-soft font-medium">Write Cost</div>
          </div>
        </div>
      ),
      whatIsIt: "Deconstructs complex subjects into digestible, modular sub-concepts.",
      whySummaUsesIt: "Summa uses concept breakdown when a topic is too complex to absorb at once. Breaking it into modules makes each piece learnable and trackable.",
      techniques: ["Decomposition", "Modular Learning", "Complexity Management"],
      whenSummaUsesIt: ["A concept has multiple interrelated parts", "The student is overwhelmed by complexity", "The topic spans several sub-topics", "Each sub-concept needs individual mastery tracking"],
      example: "Database Indexing breaks down into: B-Trees, Hash Tables, Scan Overhead, Write Cost. Each module is taught and tracked separately.",
      whatHappensAfter: [{ step: "Concept decomposed", detail: "Sub-concepts identified and ordered" }, { step: "Each module taught", detail: "Individual sub-concepts explained" }, { step: "Module mastery tracked", detail: "Each piece assessed independently" }, { step: "Assembly verified", detail: "Student demonstrates understanding of the whole" }],
      usedWith: ["Explanation Card", "Learning Path", "Mastery Card"],
      decisionSignals: ["Topic too complex for single pass", "Multiple sub-concepts exist", "Student overwhelmed"],
    },
    {
      id: "compare_contrast",
      title: "15. Compare & Contrast",
      category: "Teaching Components",
      desc: "Side-by-side distinction matrix highlight key differences between A vs B.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2 shadow-2xs flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-1 text-center text-[9px] font-bold pb-1 border-b">
            <span className="text-teal-dark dark:text-accent-lime">Process</span>
            <span className="text-teal-dark dark:text-accent-lime">Thread</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[8px] pt-1 text-grey-green dark:text-[#8FA29B]">
            <div>Isolated memory space</div>
            <div>Shared process memory</div>
            <div>Heavy creation cost</div>
            <div>Lightweight execution</div>
          </div>
        </div>
      ),
      whatIsIt: "Side-by-side distinction matrix highlighting key differences between two concepts.",
      whySummaUsesIt: "Summa uses compare and contrast when two concepts are easily confused or when understanding the differences is critical to proper application.",
      techniques: ["Comparative Learning", "Distinction Making", "Conceptual Clarity"],
      whenSummaUsesIt: ["Two concepts are frequently confused", "Understanding differences is critical", "The student mixes up similar items", "Exam tests distinctions between related topics"],
      example: "Process vs Thread: Process has isolated memory space, heavy creation cost. Thread has shared process memory, lightweight execution.",
      whatHappensAfter: [{ step: "Comparison presented", detail: "Side-by-side distinction matrix shown" }, { step: "Student identifies differences", detail: "Understanding of distinctions tested" }, { step: "Confusion resolved", detail: "Specific confusions clarified" }, { step: "Distinction knowledge recorded", detail: "Comparison mastery tracked" }],
      usedWith: ["Matching", "Categorization", "Common Mistake Card"],
      decisionSignals: ["Two concepts容易混淆", "Distinction is critical", "Student mixes up items"],
    },
    {
      id: "analogy_card",
      title: "16. Analogy Card",
      category: "Teaching Components",
      desc: "Explains abstract technical ideas using relatable real-world mental models.",
      badgeBg: "bg-destructive/10 dark:bg-[#be747e]/10 text-destructive dark:text-[#be747e]",
      icon: (
        <svg className="w-5 h-5 text-destructive dark:text-[#be747e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-destructive dark:text-[#be747e] uppercase">Analogy</span>
          <p className="text-[10px] text-ink dark:text-cream-soft leading-tight">
            <strong>RAM vs Hard Drive:</strong> Like your office desk space vs a filing cabinet in the basement.
          </p>
          <div className="text-[9px] text-grey-green dark:text-[#8FA29B] italic">Quick memory access vs permanent storage</div>
        </div>
      ),
      whatIsIt: "Explains abstract technical ideas using relatable real-world mental models.",
      whySummaUsesIt: "Summa uses analogies when a concept is too abstract to grasp directly. Mapping to a familiar domain creates a mental anchor that makes the abstract concrete.",
      techniques: ["Analogical Reasoning", "Mental Model Building", "Abstract-to-Concrete Mapping"],
      whenSummaUsesIt: ["The concept is highly abstract", "The student lacks the background for direct explanation", "A familiar domain maps well to the concept", "The student needs a mental anchor"],
      example: "RAM vs Hard Drive: Like your office desk space vs a filing cabinet in the basement. Quick memory access vs permanent storage.",
      whatHappensAfter: [{ step: "Analogy presented", detail: "Familiar domain mapped to concept" }, { step: "Connection verified", detail: "Student confirms the mapping makes sense" }, { step: "Concept grasped", detail: "Abstract idea now has concrete anchor" }, { step: "Analogy retired", detail: "Direct understanding replaces the analogy over time" }],
      usedWith: ["Explanation Card", "Teach-Back", "Why It Works"],
      decisionSignals: ["Concept is abstract", "Familiar domain available", "Direct explanation insufficient"],
    },
    {
      id: "common_mistake",
      title: "17. Common Mistake Card",
      category: "Teaching Components",
      desc: "Highlights frequent cognitive traps and provides explicit corrections.",
      badgeBg: "bg-destructive/10 dark:bg-[#be747e]/10 text-destructive dark:text-[#be747e]",
      icon: (
        <svg className="w-5 h-5 text-destructive dark:text-[#be747e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs space-y-1.5 flex flex-col justify-center">
          <div className="text-[9px] font-bold text-destructive dark:text-[#be747e] flex items-center gap-1">
            <span>⚠️ Common Misconception</span>
          </div>
          <p className="text-[9px] text-ink dark:text-cream-soft bg-destructive/10 dark:bg-[#be747e]/10 p-1.5 rounded border border-destructive/30 dark:border-[#be747e]/30 line-through">
            "Overloading happens at runtime."
          </p>
          <p className="text-[9px] text-emerald-900 bg-teal-dark/10 dark:bg-accent-lime/10 p-1.5 rounded border border-teal-dark/30 dark:border-accent-lime/30">
            ✓ Correction: Overloading is resolved at <strong>compile-time</strong>.
          </p>
        </div>
      ),
      whatIsIt: "Highlights frequent cognitive traps and provides explicit corrections.",
      whySummaUsesIt: "Summa uses common mistake cards when a misconception is widespread or particularly sticky. Explicitly naming and correcting the mistake is more effective than hoping the student avoids it.",
      techniques: ["Misconception Correction", "Error Prevention", "Cognitive Trap Identification"],
      whenSummaUsesIt: ["A misconception is common among students", "The mistake has serious consequences", "The student is likely to make this error", "Correcting the mistake prevents future problems"],
      example: "Misconception: Overloading happens at runtime. Correction: Overloading is resolved at compile-time, not runtime.",
      whatHappensAfter: [{ step: "Misconception named", detail: "Common mistake explicitly stated" }, { step: "Correction provided", detail: "Correct understanding explained" }, { step: "Student verifies", detail: "Confirms they did not hold the misconception" }, { step: "Mistake tracked", detail: "If student had the misconception, extra practice assigned" }],
      usedWith: ["Compare & Contrast", "Multiple Choice", "Confidence Check"],
      decisionSignals: ["Common misconception identified", "Mistake has high consequences", "Student likely to err"],
    },
    {
      id: "why_it_works",
      title: "18. Why It Works",
      category: "Teaching Components",
      desc: "Focuses on first-principles underlying mechanics rather than shallow rote memorization.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">First Principles</span>
          <p className="text-[10px] text-ink dark:text-cream-soft font-semibold leading-tight">
            Why Binary Search is O(log n)
          </p>
          <p className="text-[9px] text-grey-green dark:text-[#8FA29B] leading-tight">
            Each step cuts the remaining dataset in half (n/2, n/4, n/8...), making division logarithmic.
          </p>
        </div>
      ),
      whatIsIt: "Focuses on first-principles underlying mechanics rather than shallow rote memorization.",
      whySummaUsesIt: "Summa uses why-it-works when the student needs to understand the reasoning behind a concept, not just the fact. This builds transferable understanding.",
      techniques: ["First-Principles Thinking", "Deep Understanding", "Transfer Learning"],
      whenSummaUsesIt: ["The student is memorizing without understanding", "The concept has deeper mechanics worth exploring", "Transfer to new situations is needed", "The why is as important as the what"],
      example: "Why Binary Search is O(log n): Each step cuts the remaining dataset in half (n/2, n/4, n/8), making division logarithmic.",
      whatHappensAfter: [{ step: "Underlying principle explained", detail: "First-principles reasoning presented" }, { step: "Student grasps the why", detail: "Understanding goes beyond memorization" }, { step: "Transfer tested", detail: "Student applies reasoning to new situation" }, { step: "Deep understanding recorded", detail: "Conceptual depth tracked" }],
      usedWith: ["Explanation Card", "Analogy Card", "Teach-Back"],
      decisionSignals: ["Student memorizing without understanding", "Deeper mechanics valuable", "Transfer needed"],
    },

    // --- ACTIVE-RECALL / RETENTION ---
    {
      id: "recall_prompt",
      title: "19. Recall Prompt",
      category: "Active-Recall / Retention",
      desc: "'Without looking, explain...' Active memory retrieval prompt before showing hints.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">Closed-Book Recall</div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-medium leading-tight">
            Without looking at your notes, state the 3 ACID properties in database transactions.
          </p>
          <button className="py-1 bg-teal-dark/10 dark:bg-accent-lime text-white text-[9px] font-bold rounded-lg shadow-xs">Reveal Answer</button>
        </div>
      ),
      whatIsIt: "Without looking, explain... Active memory retrieval prompt before showing hints.",
      whySummaUsesIt: "Summa uses recall prompts to force active retrieval from memory. The effort of recalling strengthens the memory trace more than re-reading or re-explanation.",
      techniques: ["Retrieval Practice", "Active Recall", "Memory Strengthening"],
      whenSummaUsesIt: ["A concept was previously learned and needs recall testing", "The student has not retrieved this information recently", "Active effort will strengthen the memory", "Before showing any hints or answers"],
      example: "Without looking at your notes, state the 3 ACID properties in database transactions.",
      whatHappensAfter: [{ step: "Student attempts recall", detail: "Memory retrieval effort captured" }, { step: "Success or struggle noted", detail: "Recall strength assessed" }, { step: "Feedback delivered", detail: "Correct answers confirmed or gaps filled" }, { step: "Recall strength updated", detail: "Retention estimate adjusted" }],
      usedWith: ["Flashcard Stack", "Spaced Review", "Confidence Check"],
      decisionSignals: ["Concept previously learned", "Recall effort strengthens memory", "No hints needed yet"],
    },
    {
      id: "spaced_review",
      title: "20. Spaced Review Card",
      category: "Active-Recall / Retention",
      desc: "Resurfaces previously learned concepts at optimal decay intervals (SM-2 decay algorithm).",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[9px]">
            <span className="font-bold text-teal-dark dark:text-accent-lime">DUE FOR REVIEW</span>
            <span className="text-grey-green dark:text-[#8FA29B] font-mono">Decay: 3 days</span>
          </div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-semibold">
            SQL Group By vs Having clauses
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[9px] text-grey-green dark:text-[#8FA29B]">Interval: 6 days</span>
            <span className="px-2 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime font-bold text-[9px] rounded">Review</span>
          </div>
        </div>
      ),
      whatIsIt: "Previously learned concept resurfacing at optimal decay intervals using SM-2 algorithm.",
      whySummaUsesIt: "Summa uses spaced review when a concept is approaching its review window. Resurfacing material at the right moment prevents forgetting while minimizing study time.",
      techniques: ["Spaced Repetition", "Retrieval Practice", "Forgetting Curve Optimization"],
      whenSummaUsesIt: ["A concept was previously learned and recall is declining", "The review interval has arrived", "The concept is important for retention", "The student has not reviewed it recently"],
      example: "You learned SQL Group By vs Having 6 days ago. Summa resurfaces it now because your recall strength is declining and the optimal review window has arrived.",
      whatHappensAfter: [{ step: "Review card presented", detail: "Concept resurfaced for review" }, { step: "Student attempts recall", detail: "Active retrieval before hints" }, { step: "Interval adjusted", detail: "If correct: longer interval. If wrong: shorter interval" }, { step: "Retention estimate updated", detail: "Next review scheduled" }],
      usedWith: ["Recall Prompt", "Flashcard Stack", "Memory Check"],
      decisionSignals: ["Review interval arrived", "Recall strength declining", "Concept important for retention"],
    },
    {
      id: "rapid_recall",
      title: "21. Rapid Recall",
      category: "Active-Recall / Retention",
      desc: "Sequence of short, timed questions to build instant recognition speed.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2.5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime">⚡ SPEED ROUND</span>
            <span className="text-[9px] font-mono font-bold text-teal-dark dark:text-accent-lime">0:14s</span>
          </div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-semibold">
            What is the default value of a boolean in Java?
          </p>
          <div className="grid grid-cols-2 gap-1">
            <div className="p-1 bg-teal-dark/10 dark:bg-accent-lime/10 text-ink dark:text-cream-soft text-[9px] font-bold rounded text-center">false</div>
            <div className="p-1 bg-cream-light dark:bg-[#232D2D] text-grey-green dark:text-[#8FA29B] text-[9px] font-bold rounded text-center">true</div>
          </div>
        </div>
      ),
      whatIsIt: "Sequence of short, timed questions to build instant recognition speed.",
      whySummaUsesIt: "Summa uses rapid recall when the student needs to build automaticity. Speed of recall is itself a measure of mastery, not just correctness.",
      techniques: ["Speed Training", "Automaticity Building", "Fluency Development"],
      whenSummaUsesIt: ["The student knows the material but needs faster recall", "Automaticity is the learning goal", "The student is preparing for timed assessments", "Quick-fire review session is appropriate"],
      example: "What is the default value of a boolean in Java? You have 14 seconds. Answer: false.",
      whatHappensAfter: [{ step: "Timed question presented", detail: "Question with countdown" }, { step: "Response captured", detail: "Answer and time recorded" }, { step: "Speed assessed", detail: "Correctness plus speed evaluated" }, { step: "Automaticity tracked", detail: "Recall speed trend monitored" }],
      usedWith: ["Rapid Recall", "Confidence Check", "Spaced Review"],
      decisionSignals: ["Speed matters", "Automaticity needed", "Timed assessment prep"],
    },
    {
      id: "retrieval_grid",
      title: "22. Retrieval Grid",
      category: "Active-Recall / Retention",
      desc: "Multi-concept matrix prompting recall across connected course topics.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-2 shadow-2xs space-y-1">
          <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime block">Matrix Memory Check</span>
          <div className="grid grid-cols-2 gap-1 text-[8px]">
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded font-medium text-ink dark:text-cream-soft">Encapsulation</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded font-medium text-ink dark:text-cream-soft">Inheritance</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded font-medium text-ink dark:text-cream-soft">Polymorphism</div>
            <div className="p-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded font-medium text-ink dark:text-cream-soft">Abstraction</div>
          </div>
        </div>
      ),
      whatIsIt: "Multi-concept matrix prompting recall across connected course topics.",
      whySummaUsesIt: "Summa uses retrieval grids when multiple related concepts need simultaneous recall. This builds the connections between ideas and strengthens the network of knowledge.",
      techniques: ["Interleaved Practice", "Network Strengthening", "Cross-Topic Retrieval"],
      whenSummaUsesIt: ["Multiple related concepts need review", "Connections between topics matter", "Interleaved practice is appropriate", "The student needs to see the big picture"],
      example: "Matrix Memory Check: Encapsulation, Inheritance, Polymorphism, Abstraction. Recall all four OOP pillars in context.",
      whatHappensAfter: [{ step: "Grid presented", detail: "Multiple concepts shown simultaneously" }, { step: "Student recalls each", detail: "Individual concept recall assessed" }, { step: "Connections mapped", detail: "Which concepts link together" }, { step: "Network strength updated", detail: "Cross-concept associations recorded" }],
      usedWith: ["Retrieval Grid", "Matching", "Categorization"],
      decisionSignals: ["Multiple concepts need review", "Connections matter", "Interleaved practice appropriate"],
    },
    {
      id: "memory_check",
      title: "23. Memory Check",
      category: "Active-Recall / Retention",
      desc: "'What do you remember from yesterday?' Daily recap to solidify long-term retention.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1 text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">
            <span>📅 YESTERDAY'S RECAP</span>
          </div>
          <p className="text-[10px] text-ink dark:text-cream-soft font-semibold leading-tight">
            Summarize 2 takeaways from yesterday's lesson on Object-Oriented Design.
          </p>
          <div className="w-full py-1 bg-teal-dark/10 dark:bg-accent-lime/10 border border-teal-dark/30 dark:border-accent-lime/30 rounded text-center text-[9px] font-bold text-teal-dark dark:text-accent-lime">
            Start Recap
          </div>
        </div>
      ),
      whatIsIt: "What do you remember from yesterday? Daily recap to solidify long-term retention.",
      whySummaUsesIt: "Summa uses memory checks to verify that yesterday's learning actually stuck. Daily recap prevents the forgetting curve from erasing recent gains.",
      techniques: ["Daily Review", "Retention Verification", "Forgetting Prevention"],
      whenSummaUsesIt: ["A new study session begins", "Yesterday's material needs retention check", "The student tends to forget recent learning", "Long-term retention is the goal"],
      example: "Summarize 2 takeaways from yesterday's lesson on Object-Oriented Design.",
      whatHappensAfter: [{ step: "Recall prompt delivered", detail: "Yesterday's material referenced" }, { step: "Student recalls", detail: "What stuck and what was forgotten" }, { step: "Gaps identified", detail: "Forgotten material flagged for review" }, { step: "Retention schedule adjusted", detail: "Forgotten items resurfaced sooner" }],
      usedWith: ["Recall Prompt", "Spaced Review", "Session Summary"],
      decisionSignals: ["New session starting", "Yesterday needs verification", "Forgetting prevention matters"],
    },
    // --- UTILITY & DASHBOARD ---
    {
      id: "flashcard_card",
      title: "Flashcard Stack",
      category: "Interactive Cards",
      desc: "Quick, focused cards to help you recall and remember key concepts with spaced repetition.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path strokeLinecap="round" d="M9 9h6M9 13h4" />
        </svg>
      ),
      preview: (
        <div className="relative w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl flex items-center justify-center p-2">
          <div className="absolute w-[82%] h-[90px] bg-gradient-to-r from-teal-dark/10 to-accent-lime/10 rounded-2xl border border-teal-dark/30 dark:border-accent-lime/30 translate-y-3 blur-[0.5px]" />
          <div className="absolute w-[87%] h-[95px] bg-teal-dark/10 dark:bg-accent-lime/10 rounded-2xl border border-teal-dark/30 dark:border-accent-lime/30 translate-y-1.5" />
          <div className="relative z-10 w-[92%] h-[100px] bg-white dark:bg-[#1C2323] rounded-2xl border border-mist-green dark:border-[#2A3838]/90 shadow-sm flex flex-col items-center justify-center p-4 text-center">
            <p className="text-xs font-semibold text-ink dark:text-cream-soft tracking-tight">What is photosynthesis?</p>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-grey-green dark:text-[#8FA29B] hover:text-grey-green dark:text-[#8FA29B] transition cursor-pointer">
              <span>Flip</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Quick, focused cards to help recall and remember key concepts with spaced repetition.",
      whySummaUsesIt: "Summa uses flashcards for efficient retrieval practice. Each card tests one concept, and spaced repetition ensures optimal review timing.",
      techniques: ["Active Recall", "Spaced Repetition", "Retrieval Practice"],
      whenSummaUsesIt: ["A concept needs retrieval practice", "Quick, focused recall is appropriate", "Spaced repetition scheduling is active", "The concept fits a flashcard format"],
      example: "What is photosynthesis? Flip to reveal answer. Rate your recall strength to schedule next review.",
      whatHappensAfter: [{ step: "Card presented", detail: "Concept shown for recall" }, { step: "Student attempts recall", detail: "Answer formulated mentally" }, { step: "Answer revealed", detail: "Correct answer shown" }, { step: "Recall rated", detail: "Student rates difficulty, interval adjusted" }],
      usedWith: ["Spaced Review", "Recall Prompt", "Confidence Check"],
      decisionSignals: ["Quick recall practice needed", "Single concept focus", "Spaced repetition active"],
    },
    {
      id: "progress_card",
      title: "Stats & Mastery Card",
      category: "Analytics & Progress",
      desc: "Track your progress, see your strengths and weaknesses, and stay motivated.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex items-center justify-around">
          <div className="relative size-16 flex items-center justify-center">
            <svg className="size-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-mist-green dark:text-[#2A3838] stroke-current" strokeWidth="4" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-teal-dark dark:text-accent-lime stroke-current" strokeDasharray="72, 100" strokeWidth="4" strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute flex flex-col items-center leading-none">
              <span className="text-xs font-bold text-ink dark:text-cream-soft">72%</span>
            </div>
          </div>
          <div className="space-y-1 text-[9px]">
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-teal-dark dark:bg-accent-lime" />
              <span className="font-semibold text-ink dark:text-cream-soft">Strong (4)</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-mist-green dark:bg-[#2A3838]" />
              <span className="font-semibold text-ink dark:text-cream-soft">Developing (3)</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Track your progress, see strengths and weaknesses, and stay motivated by evidence.",
      whySummaUsesIt: "Summa uses progress cards to give transparent visibility into learning health. The student sees their overall mastery, strong areas, and developing areas at a glance.",
      techniques: ["Progress Visualization", "Mastery Tracking", "Motivation Through Evidence"],
      whenSummaUsesIt: ["The student wants to see overall progress", "Strengths and weaknesses need visibility", "Motivation from evidence is needed", "Learning health should be transparent"],
      example: "Overall Mastery: 72%. Strong areas: 4. Developing areas: 3. See your progress over time.",
      whatHappensAfter: [{ step: "Progress displayed", detail: "Overall mastery and breakdown shown" }, { step: "Student reviews", detail: "Strengths and weaknesses identified" }, { step: "Motivation maintained", detail: "Evidence-based progress keeps momentum" }, { step: "Focus adjusted", detail: "Student directs effort to developing areas" }],
      usedWith: ["Mastery Card", "Weak Area Card", "Session Summary"],
      decisionSignals: ["Progress visibility needed", "Motivation from evidence", "Strengths and weaknesses matter"],
    },

    // --- PROGRESS / GUIDANCE ---
    {
      id: "learning_path",
      title: "24. Learning Path",
      category: "Progress / Guidance",
      desc: "Visual topic progression showing completed, current, and upcoming concepts.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center">
          <div className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase mb-2">Data Structures</div>
          <div className="space-y-1.5 pl-3 border-l-2 border-teal-dark/30 dark:border-accent-lime/30">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime -ml-[11px] border-2 border-white dark:border-[#1C2323]" />
              <span className="text-[9px] text-grey-green dark:text-[#8FA29B] line-through">Arrays ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime -ml-[11px] border-2 border-white dark:border-[#1C2323]" />
              <span className="text-[9px] text-grey-green dark:text-[#8FA29B] line-through">Linked Lists ✓</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-teal-dark dark:bg-accent-lime -ml-[11px] border-2 border-white dark:border-[#1C2323] ring-2 ring-teal-dark/30 dark:ring-accent-lime/30" />
              <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Binary Trees ←</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-cream-light dark:bg-[#232D2D] -ml-[11px] border-2 border-white dark:border-[#1C2323]" />
              <span className="text-[9px] text-grey-green dark:text-[#8FA29B] opacity-50">Graphs</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Visual topic progression showing completed, current, and upcoming concepts in a structured path.",
      whySummaUsesIt: "Summa uses learning paths to give students a clear roadmap. Seeing progress and what comes next reduces anxiety and maintains motivation.",
      techniques: ["Progress Visualization", "Roadmap Learning", "Goal Setting"],
      whenSummaUsesIt: ["A topic has multiple sequential concepts", "The student needs to see their progress", "Motivation from visible advancement is needed", "The learning journey has a clear structure"],
      example: "Data Structures path: Arrays (done), Linked Lists (done), Binary Trees (current), Graphs (upcoming).",
      whatHappensAfter: [{ step: "Path displayed", detail: "Current position in learning journey shown" }, { step: "Student completes concept", detail: "Progress updated on path" }, { step: "Next concept highlighted", detail: "Clear next step identified" }, { step: "Path adjusted", detail: "If struggling, path may redirect or add practice" }],
      usedWith: ["Session Plan", "Milestone Card", "Next Action Card"],
      decisionSignals: ["Sequential learning in progress", "Student needs roadmap", "Progress visibility helps"],
    },
    {
      id: "milestone_card",
      title: "25. Milestone Card",
      category: "Progress / Guidance",
      desc: "Meaningful achievement based on demonstrated evidence, not points or streaks.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center space-y-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-teal-dark/10 dark:bg-accent-lime/10 flex items-center justify-center text-teal-dark dark:text-accent-lime text-sm">🏆</div>
            <div>
              <div className="text-[10px] font-bold text-ink dark:text-cream-soft">Mastery Achieved</div>
              <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">Binary Search Trees</div>
            </div>
          </div>
          <div className="text-[9px] text-grey-green dark:text-[#8FA29B] leading-snug">
            Scored 92% across 3 quizzes with consistent recall after 7-day interval.
          </div>
          <div className="flex items-center gap-1">
            <span className="px-1.5 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded text-[7px] font-bold text-teal-dark dark:text-accent-lime">Evidence-based</span>
          </div>
        </div>
      ),
      whatIsIt: "Meaningful achievement based on demonstrated evidence, not points or streaks.",
      whySummaUsesIt: "Summa uses milestones to mark genuine learning achievements. Unlike gamified rewards, milestones are evidence-based and tied to actual mastery.",
      techniques: ["Achievement Recognition", "Evidence-Based Progress", "Motivation"],
      whenSummaUsesIt: ["A concept has been mastered with evidence", "The student has demonstrated sustained understanding", "A meaningful learning goal was achieved", "Recognition reinforces continued effort"],
      example: "Mastery Achieved: Binary Search Trees. Scored 92% across 3 quizzes with consistent recall after 7-day interval.",
      whatHappensAfter: [{ step: "Milestone earned", detail: "Evidence-based achievement recorded" }, { step: "Student notified", detail: "Recognition delivered" }, { step: "Path updated", detail: "Next concept unlocked" }, { step: "Confidence boosted", detail: "Self-efficacy enhanced through evidence" }],
      usedWith: ["Mastery Card", "Learning Path", "Session Summary"],
      decisionSignals: ["Evidence-based mastery confirmed", "Sustained understanding proven", "Achievement worthy of recognition"],
    },
    {
      id: "mastery_card",
      title: "26. Mastery Card",
      category: "Progress / Guidance",
      desc: "Shows concept strength with concrete evidence and decay timeline.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Polymorphism</span>
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime">88%</span>
          </div>
          <div className="w-full h-1.5 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
            <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "88%" }} />
          </div>
          <div className="flex items-center justify-between text-[8px] text-grey-green dark:text-[#8FA29B]">
            <span>3 quizzes passed</span>
            <span>Decay in 5 days</span>
          </div>
        </div>
      ),
      whatIsIt: "Shows concept strength with concrete evidence and decay timeline.",
      whySummaUsesIt: "Summa uses mastery cards to give students transparent visibility into how well they know something and when they need to review.",
      techniques: ["Mastery Tracking", "Decay Monitoring", "Transparent Assessment"],
      whenSummaUsesIt: ["The student wants to know how well they know something", "Decay timeline needs to be communicated", "Mastery evidence should be visible", "The student is tracking their own progress"],
      example: "Polymorphism: 88% mastery. 3 quizzes passed. Decay in 5 days.",
      whatHappensAfter: [{ step: "Mastery displayed", detail: "Current strength shown with evidence" }, { step: "Decay predicted", detail: "When review will be needed" }, { step: "Student decides", detail: "Review now or wait until decay approaches" }, { step: "Mastery tracked over time", detail: "Trend monitored for learning health" }],
      usedWith: ["Confidence Check", "Spaced Review", "Readiness Card"],
      decisionSignals: ["Student wants visibility", "Decay timeline relevant", "Evidence of mastery available"],
    },
    {
      id: "readiness_card",
      title: "27. Readiness Card",
      category: "Progress / Guidance",
      desc: "Shows exam or topic readiness percentage based on coverage and mastery.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-center space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">CSC 201 Final Exam</span>
            <span className="text-[9px] font-mono font-bold text-teal-dark dark:text-accent-lime">74%</span>
          </div>
          <div className="w-full h-2 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
            <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "74%" }} />
          </div>
          <div className="grid grid-cols-3 gap-1 text-[8px]">
            <div className="text-center"><span className="font-bold text-teal-dark dark:text-accent-lime">18</span><br/><span className="text-grey-green dark:text-[#8FA29B]">Covered</span></div>
            <div className="text-center"><span className="font-bold text-ink dark:text-cream-soft">4</span><br/><span className="text-grey-green dark:text-[#8FA29B]">Partial</span></div>
            <div className="text-center"><span className="font-bold text-destructive dark:text-[#be747e]">2</span><br/><span className="text-grey-green dark:text-[#8FA29B]">Missing</span></div>
          </div>
        </div>
      ),
      whatIsIt: "Exam or topic readiness percentage based on coverage and mastery across all relevant concepts.",
      whySummaUsesIt: "Summa uses readiness cards to give a single, honest number that reflects how prepared the student is. No sugar-coating, just evidence-based readiness.",
      techniques: ["Readiness Assessment", "Coverage Analysis", "Preparation Planning"],
      whenSummaUsesIt: ["An exam or assessment is approaching", "The student wants to know if they are ready", "Coverage and mastery need to be combined into one signal", "Study planning needs a readiness baseline"],
      example: "CSC 201 Final Exam: 74% ready. 18 topics covered, 4 partial, 2 missing.",
      whatHappensAfter: [{ step: "Readiness calculated", detail: "Coverage plus mastery combined" }, { step: "Gaps identified", detail: "Specific weak areas highlighted" }, { step: "Study plan adjusted", detail: "Focus shifts to gaps" }, { step: "Readiness tracked", detail: "Progress toward exam readiness monitored" }],
      usedWith: ["Exam Countdown", "Weak Area Card", "Next Action Card"],
      decisionSignals: ["Exam approaching", "Readiness assessment needed", "Coverage plus mastery matters"],
    },
    {
      id: "weak_area",
      title: "28. Weak Area Card",
      category: "Progress / Guidance",
      desc: "Surfaces concepts that need focused attention based on performance data.",
      badgeBg: "bg-destructive/10 dark:bg-[#be747e]/10 text-destructive dark:text-[#be747e]",
      icon: (
        <svg className="w-5 h-5 text-destructive dark:text-[#be747e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-destructive dark:text-[#be747e] uppercase">Needs Attention</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-2 py-1 bg-destructive/10 dark:bg-[#be747e]/10 rounded-lg">
              <span className="text-[9px] font-medium text-ink dark:text-cream-soft">Graph Traversal</span>
              <span className="text-[8px] font-bold text-destructive dark:text-[#be747e]">38%</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-destructive/10 dark:bg-[#be747e]/10 rounded-lg">
              <span className="text-[9px] font-medium text-ink dark:text-cream-soft">Hash Collisions</span>
              <span className="text-[8px] font-bold text-destructive dark:text-[#be747e]">42%</span>
            </div>
            <div className="flex items-center justify-between px-2 py-1 bg-destructive/10 dark:bg-[#be747e]/10 rounded-lg">
              <span className="text-[9px] font-medium text-ink dark:text-cream-soft">B-Tree Insertion</span>
              <span className="text-[8px] font-bold text-destructive dark:text-[#be747e]">45%</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Surfaces concepts that need focused attention based on performance data.",
      whySummaUsesIt: "Summa uses weak area cards to be honest about what needs work. Instead of hiding weaknesses, it surfaces them explicitly so the student can focus energy where it matters most.",
      techniques: ["Weakness Identification", "Focused Practice", "Performance Analysis"],
      whenSummaUsesIt: ["Performance data reveals specific weak areas", "The student needs to know what to focus on", "Weaknesses are preventing progress", "Study time should be directed efficiently"],
      example: "Needs Attention: Graph Traversal (38%), Hash Collisions (42%), B-Tree Insertion (45%).",
      whatHappensAfter: [{ step: "Weak areas surfaced", detail: "Specific concepts with low mastery identified" }, { step: "Priority ordered", detail: "Weakest areas ranked by importance" }, { step: "Practice assigned", detail: "Targeted exercises for each weak area" }, { step: "Progress tracked", detail: "Mastery improvement monitored" }],
      usedWith: ["Next Action Card", "Readiness Card", "Worked Example"],
      decisionSignals: ["Performance data available", "Specific weaknesses identified", "Focused practice needed"],
    },
    {
      id: "next_action",
      title: "29. Next Action Card",
      category: "Progress / Guidance",
      desc: "Recommends the single best next step based on current learning state.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">Best Next Step</div>
          <div>
            <p className="text-[10px] font-semibold text-ink dark:text-cream-soft leading-snug">
              Practice applying Kirchhoff's laws to solve a 3-loop circuit problem.
            </p>
            <p className="text-[8px] text-grey-green dark:text-[#8FA29B] mt-1">Based on: Weak in circuit analysis (52% mastery)</p>
          </div>
          <button className="w-full py-1.5 bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-[9px] font-bold rounded-lg">Start Practice</button>
        </div>
      ),
      whatIsIt: "Recommends the single best next step based on current learning state.",
      whySummaUsesIt: "Summa uses next action cards to eliminate decision fatigue. Instead of the student wondering what to study next, Summa recommends the highest-impact action.",
      techniques: ["Decision Support", "Optimal Sequencing", "Learning Optimization"],
      whenSummaUsesIt: ["The student finishes a study session", "The student is unsure what to do next", "Multiple paths are available", "The highest-impact action needs identification"],
      example: "Best Next Step: Practice applying Kirchhoff's laws to solve a 3-loop circuit problem. Based on: Weak in circuit analysis (52% mastery).",
      whatHappensAfter: [{ step: "Action recommended", detail: "Single best next step identified" }, { step: "Student accepts or modifies", detail: "Action taken or adjusted" }, { step: "Learning state updated", detail: "Progress from action recorded" }, { step: "Next action recalculated", detail: "New recommendation generated" }],
      usedWith: ["Session Plan", "Weak Area Card", "Learning Path"],
      decisionSignals: ["Decision fatigue possible", "Multiple paths available", "Highest-impact action matters"],
    },

    // --- SESSION COMPONENTS ---
    {
      id: "session_plan",
      title: "30. Session Plan",
      category: "Session Components",
      desc: "Structured session outline showing review, learning, practice, and assessment.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-teal-dark dark:text-accent-lime uppercase">Today's Session</div>
          <div className="space-y-1 font-mono text-[8px]">
            <div className="flex items-center gap-1.5 text-ink dark:text-cream-soft">
              <span className="text-grey-green dark:text-[#8FA29B]">├──</span>
              <span className="text-teal-dark dark:text-accent-lime">✓</span> Review: Linked Lists, Stacks
            </div>
            <div className="flex items-center gap-1.5 text-ink dark:text-cream-soft">
              <span className="text-grey-green dark:text-[#8FA29B]">├──</span>
              <span className="text-teal-dark dark:text-accent-lime">→</span> Learn: Binary Trees
            </div>
            <div className="flex items-center gap-1.5 text-ink dark:text-cream-soft">
              <span className="text-grey-green dark:text-[#8FA29B]">├──</span>
              <span className="text-grey-green dark:text-[#8FA29B]">○</span> Practice: 5 problems
            </div>
            <div className="flex items-center gap-1.5 text-ink dark:text-cream-soft">
              <span className="text-grey-green dark:text-[#8FA29B]">└──</span>
              <span className="text-grey-green dark:text-[#8FA29B]">○</span> 5-question check
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Structured session outline showing review, learning, practice, and assessment.",
      whySummaUsesIt: "Summa uses session plans to give structure to study time. A clear plan reduces cognitive load and ensures balanced coverage of review, learning, and practice.",
      techniques: ["Session Structuring", "Balanced Learning", "Time Management"],
      whenSummaUsesIt: ["A new study session begins", "The student needs a clear plan for the session", "Review, learning, and practice need balance", "Time should be used efficiently"],
      example: "Today's Session: Review 2 concepts, Learn Binary Trees, Practice 5 problems, 5-question check.",
      whatHappensAfter: [{ step: "Plan presented", detail: "Session structure shown" }, { step: "Student follows plan", detail: "Each activity completed in order" }, { step: "Progress tracked", detail: "Completion of each activity recorded" }, { step: "Plan adjusted", detail: "If stuck, plan may reorder or extend" }],
      usedWith: ["Session Progress", "Session Summary", "Resume Learning"],
      decisionSignals: ["Session starting", "Structure needed", "Balanced coverage matters"],
    },
    {
      id: "session_progress",
      title: "31. Session Progress",
      category: "Session Components",
      desc: "Tracks actual learning progress during a session — not gamified points.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Session: 32 min</div>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between text-[8px] mb-0.5">
                <span className="text-grey-green dark:text-[#8FA29B]">Concepts Covered</span>
                <span className="font-bold text-ink dark:text-cream-soft">3 / 4</span>
              </div>
              <div className="w-full h-1 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "75%" }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[8px] mb-0.5">
                <span className="text-grey-green dark:text-[#8FA29B]">Quiz Accuracy</span>
                <span className="font-bold text-teal-dark dark:text-accent-lime">80%</span>
              </div>
              <div className="w-full h-1 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "80%" }} />
              </div>
            </div>
          </div>
          <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">2 concepts need review before next session</div>
        </div>
      ),
      whatIsIt: "Tracks actual learning progress during a session, not gamified points.",
      whySummaUsesIt: "Summa uses session progress to show genuine learning advancement. No points, no streaks, just honest tracking of what was learned and what still needs work.",
      techniques: ["Progress Tracking", "Honest Assessment", "Session Monitoring"],
      whenSummaUsesIt: ["A study session is in progress", "The student wants to see their current progress", "Honest tracking matters more than gamification", "Session effectiveness needs monitoring"],
      example: "Session: 32 min. Concepts Covered: 3 of 4. Quiz Accuracy: 80%. 2 concepts need review.",
      whatHappensAfter: [{ step: "Progress displayed", detail: "Current session metrics shown" }, { step: "Student continues", detail: "Progress updates in real-time" }, { step: "Session concludes", detail: "Final progress captured" }, { step: "Summary generated", detail: "Session summary created from progress data" }],
      usedWith: ["Session Plan", "Session Summary", "Mastery Card"],
      decisionSignals: ["Session in progress", "Real-time tracking needed", "Honest progress matters"],
    },
    {
      id: "session_summary",
      title: "32. Session Summary",
      category: "Session Components",
      desc: "What was learned, what remains weak, and what happens next.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Session Summary</div>
          <div className="space-y-1">
            <div className="text-[8px]"><span className="font-bold text-teal-dark dark:text-accent-lime">Learned:</span> <span className="text-grey-green dark:text-[#8FA29B]">Binary Tree traversal (inorder, preorder)</span></div>
            <div className="text-[8px]"><span className="font-bold text-destructive dark:text-[#be747e]">Weak:</span> <span className="text-grey-green dark:text-[#8FA29B]">Postorder recursion still shaky</span></div>
            <div className="text-[8px]"><span className="font-bold text-ink dark:text-cream-soft">Next:</span> <span className="text-grey-green dark:text-[#8FA29B]">Practice 3 postorder problems</span></div>
          </div>
        </div>
      ),
      whatIsIt: "What was learned, what remains weak, and what happens next. Post-session intelligence.",
      whySummaUsesIt: "Summa uses session summaries to close the loop on each study session. The student leaves knowing exactly what they accomplished and what comes next.",
      techniques: ["Session Closure", "Intelligence Summary", "Next Step Planning"],
      whenSummaUsesIt: ["A study session is ending", "The student needs to know what they accomplished", "Weak areas need to be identified for next session", "The next study session needs to be planned"],
      example: "Learned: Binary Tree traversal (inorder, preorder). Weak: Postorder recursion still shaky. Next: Practice 3 postorder problems.",
      whatHappensAfter: [{ step: "Summary delivered", detail: "Learned, weak, and next steps presented" }, { step: "Student reviews", detail: "Confirms understanding of progress" }, { step: "Weak areas queued", detail: "Weaknesses scheduled for next session" }, { step: "Next session planned", detail: "Recommended activities for next session generated" }],
      usedWith: ["Session Progress", "Weak Area Card", "Resume Learning"],
      decisionSignals: ["Session ending", "Closure needed", "Next session planning matters"],
    },
    {
      id: "resume_learning",
      title: "33. Resume Learning",
      category: "Session Components",
      desc: "Continue where you stopped — picks up at the exact concept and step.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Resume Where You Stopped</div>
          <div className="p-2 bg-cream-light dark:bg-[#232D2D] rounded-lg space-y-1">
            <div className="text-[9px] font-semibold text-ink dark:text-cream-soft">Binary Trees — Postorder Traversal</div>
            <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">Step 2 of 4: Writing recursive case</div>
            <div className="w-full h-1 bg-mist-green dark:bg-[#2A3838] rounded-full overflow-hidden">
              <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "50%" }} />
            </div>
          </div>
          <button className="w-full py-1.5 bg-teal-dark dark:bg-accent-lime text-white dark:text-ink text-[9px] font-bold rounded-lg">Continue</button>
        </div>
      ),
      whatIsIt: "Continue where you stopped, picking up at the exact concept and step.",
      whySummaUsesIt: "Summa uses resume learning to eliminate the friction of starting a new session. The student picks up exactly where they left off, with zero re-orientation needed.",
      techniques: ["Session Continuity", "Friction Reduction", "Context Preservation"],
      whenSummaUsesIt: ["The student returns after a break", "The previous session was incomplete", "Continuity matters for learning momentum", "Re-orientation time should be minimized"],
      example: "Resume Where You Stopped: Binary Trees, Postorder Traversal. Step 2 of 4: Writing recursive case.",
      whatHappensAfter: [{ step: "Context restored", detail: "Previous session state loaded" }, { step: "Student resumes", detail: "Picks up at exact stopping point" }, { step: "Session continues", detail: "Learning flows without interruption" }, { step: "Progress accumulated", detail: "New progress added to previous session" }],
      usedWith: ["Session Plan", "Session Progress", "Learning Path"],
      decisionSignals: ["Returning student", "Previous session incomplete", "Continuity matters"],
    },

    // --- EXAM COMPONENTS ---
    {
      id: "exam_countdown",
      title: "34. Exam Countdown",
      category: "Exam Components",
      desc: "Shows days remaining with readiness status and recommended focus areas.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">CSC 201 Final</div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-teal-dark dark:text-accent-lime font-mono">12</div>
            <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">days remaining</div>
          </div>
          <div className="text-[8px] text-grey-green dark:text-[#8FA29B] text-center">Focus: Graph algorithms (38% mastery)</div>
        </div>
      ),
      whatIsIt: "Shows days remaining with readiness status and recommended focus areas.",
      whySummaUsesIt: "Summa uses exam countdowns to create urgency and focus. Knowing exactly how many days remain helps the student allocate effort to the highest-impact areas.",
      techniques: ["Urgency Creation", "Focus Allocation", "Time Management"],
      whenSummaUsesIt: ["An exam date is known and approaching", "The student needs motivation from time pressure", "Focus areas need to be prioritized by deadline", "Study time should be allocated efficiently"],
      example: "CSC 201 Final: 12 days remaining. Focus: Graph algorithms (38% mastery).",
      whatHappensAfter: [{ step: "Countdown displayed", detail: "Days remaining and focus areas shown" }, { step: "Student adjusts plan", detail: "Study plan prioritizes weak areas" }, { step: "Focus narrows", detail: "Effort concentrated on high-impact topics" }, { step: "Readiness tracked", detail: "Daily readiness improvement monitored" }],
      usedWith: ["Exam Readiness", "Weak Area Card", "Next Action Card"],
      decisionSignals: ["Exam date known", "Time pressure helps", "Focus allocation matters"],
    },
    {
      id: "exam_readiness",
      title: "35. Exam Readiness",
      category: "Exam Components",
      desc: "Overall readiness percentage with topic breakdown and risk areas.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Exam Readiness</span>
            <span className="text-lg font-extrabold text-teal-dark dark:text-accent-lime font-mono">68%</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[8px]">
              <span className="size-1.5 rounded-full bg-teal-dark dark:bg-accent-lime" />
              <span className="text-grey-green dark:text-[#8FA29B]">Strong: OOP, Memory Mgmt</span>
            </div>
            <div className="flex items-center gap-2 text-[8px]">
              <span className="size-1.5 rounded-full bg-mist-green dark:bg-[#2A3838]" />
              <span className="text-grey-green dark:text-[#8FA29B]">Partial: Graphs, Trees</span>
            </div>
            <div className="flex items-center gap-2 text-[8px]">
              <span className="size-1.5 rounded-full bg-destructive dark:bg-[#be747e]" />
              <span className="text-grey-green dark:text-[#8FA29B]">Weak: B-Trees, Hashing</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Overall readiness percentage with topic breakdown and risk areas.",
      whySummaUsesIt: "Summa uses exam readiness to give an honest, evidence-based assessment of preparation. No false confidence, just data.",
      techniques: ["Readiness Assessment", "Risk Analysis", "Preparation Planning"],
      whenSummaUsesIt: ["An exam is approaching and readiness needs assessment", "The student wants an honest readiness number", "Topic-level breakdown is needed", "Risk areas must be identified"],
      example: "Exam Readiness: 68%. Strong: OOP, Memory Mgmt. Partial: Graphs, Trees. Weak: B-Trees, Hashing.",
      whatHappensAfter: [{ step: "Readiness calculated", detail: "Overall percentage computed" }, { step: "Topics broken down", detail: "Strong, partial, and weak areas listed" }, { step: "Risk areas flagged", detail: "High-risk topics highlighted" }, { step: "Study plan adjusted", detail: "Focus shifts to weak areas" }],
      usedWith: ["Exam Countdown", "Topic Coverage", "Weak Area Card"],
      decisionSignals: ["Exam approaching", "Honest assessment needed", "Topic-level breakdown matters"],
    },
    {
      id: "topic_coverage",
      title: "36. Topic Coverage",
      category: "Exam Components",
      desc: "Shows which syllabus topics are covered, partially covered, or missing.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs space-y-1.5">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Syllabus Coverage</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "85%" }} />
              </div>
              <span className="text-[8px] font-bold text-teal-dark dark:text-accent-lime w-8 text-right">85%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-mist-green dark:bg-[#2A3838] rounded-full" style={{ width: "60%" }} />
              </div>
              <span className="text-[8px] font-bold text-grey-green dark:text-[#8FA29B] w-8 text-right">60%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
                <div className="h-full bg-destructive dark:bg-[#be747e] rounded-full" style={{ width: "25%" }} />
              </div>
              <span className="text-[8px] font-bold text-destructive dark:text-[#be747e] w-8 text-right">25%</span>
            </div>
          </div>
          <div className="text-[7px] text-grey-green dark:text-[#8FA29B]">18 covered · 4 partial · 2 missing</div>
        </div>
      ),
      whatIsIt: "Shows which syllabus topics are covered, partially covered, or missing.",
      whySummaUsesIt: "Summa uses topic coverage to give visibility into syllabus completion. The student sees exactly what has been learned and what gaps remain.",
      techniques: ["Coverage Analysis", "Gap Identification", "Syllabus Tracking"],
      whenSummaUsesIt: ["The syllabus needs to be tracked", "Coverage gaps need to be visible", "The student wants to see what is missing", "Exam preparation requires full coverage"],
      example: "Syllabus Coverage: 85% strong, 60% partial, 25% missing. 18 covered, 4 partial, 2 missing.",
      whatHappensAfter: [{ step: "Coverage displayed", detail: "Topic-level completion shown" }, { step: "Gaps identified", detail: "Missing and partial topics highlighted" }, { step: "Study plan updated", detail: "Gaps prioritized for study" }, { step: "Coverage tracked", detail: "Progress toward full coverage monitored" }],
      usedWith: ["Exam Readiness", "Learning Path", "Weak Area Card"],
      decisionSignals: ["Syllabus tracking needed", "Coverage gaps visible", "Full coverage required"],
    },
    {
      id: "past_question",
      title: "37. Past Question Analysis",
      category: "Exam Components",
      desc: "Analyzes past exam patterns to identify frequently tested topics.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Past Questions (5 years)</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-grey-green dark:text-[#8FA29B]">Trees & Graphs</span>
              <span className="font-bold text-ink dark:text-cream-soft">Every year</span>
            </div>
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-grey-green dark:text-[#8FA29B]">Memory Management</span>
              <span className="font-bold text-ink dark:text-cream-soft">4/5 years</span>
            </div>
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-grey-green dark:text-[#8FA29B]">B-Trees</span>
              <span className="font-bold text-ink dark:text-cream-soft">3/5 years</span>
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Analyzes past exam patterns to identify frequently tested topics.",
      whySummaUsesIt: "Summa uses past question analysis to focus study on what is most likely to appear on the exam. Pattern analysis reveals what the examiner actually tests.",
      techniques: ["Pattern Analysis", "Exam Prediction", "Strategic Study"],
      whenSummaUsesIt: ["Past exam papers are available", "The student wants to know what to focus on", "Exam patterns can be identified", "Strategic preparation is valuable"],
      example: "Past Questions (5 years): Trees and Graphs every year. Memory Management 4 of 5 years. B-Trees 3 of 5 years.",
      whatHappensAfter: [{ step: "Patterns analyzed", detail: "Frequently tested topics identified" }, { step: "Focus areas recommended", detail: "Study prioritized by exam frequency" }, { step: "Practice aligned", detail: "Practice questions matched to exam patterns" }, { step: "Confidence built", detail: "Student knows what to expect" }],
      usedWith: ["Predicted Practice", "Exam Readiness", "Topic Coverage"],
      decisionSignals: ["Past papers available", "Pattern analysis valuable", "Strategic study helps"],
    },
    {
      id: "predicted_practice",
      title: "38. Predicted Practice",
      category: "Exam Components",
      desc: "Generated practice questions based on patterns — clearly labeled as AI-generated.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Predicted Questions</span>
            <span className="px-1.5 py-0.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded text-[7px] font-bold text-teal-dark dark:text-accent-lime">AI-Generated</span>
          </div>
          <div className="space-y-1">
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              Explain BFS vs DFS with a real-world use case.
            </div>
            <div className="px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              Write pseudocode for inserting into a BST.
            </div>
          </div>
          <div className="text-[7px] text-grey-green dark:text-[#8FA29B] italic">Based on 5-year exam pattern analysis</div>
        </div>
      ),
      whatIsIt: "Generated practice questions based on patterns, clearly labeled as AI-generated.",
      whySummaUsesIt: "Summa uses predicted practice to provide exam-like practice that mirrors likely question patterns. Always labeled as generated to maintain trust and transparency.",
      techniques: ["Pattern-Based Practice", "Exam Simulation", "Transparent Generation"],
      whenSummaUsesIt: ["Exam patterns suggest likely topics", "Practice questions aligned with exam style are needed", "The student wants realistic exam preparation", "Transparency about generation source matters"],
      example: "Predicted Questions (AI-Generated): Explain BFS vs DFS with a real-world use case. Write pseudocode for inserting into a BST.",
      whatHappensAfter: [{ step: "Questions generated", detail: "Pattern-aligned practice created" }, { step: "Student attempts", detail: "Practice completed with exam conditions" }, { step: "Performance assessed", detail: "Readiness updated based on results" }, { step: "Next questions generated", detail: "Adaptive practice continues" }],
      usedWith: ["Past Question Analysis", "Exam Simulation", "Exam Readiness"],
      decisionSignals: ["Patterns available", "Realistic practice needed", "Transparency matters"],
    },
    {
      id: "exam_simulation",
      title: "39. Exam Simulation",
      category: "Exam Components",
      desc: "Timed realistic practice exam with conditions matching the actual test.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-ink dark:text-cream-soft">Exam Simulation</span>
            <span className="text-[9px] font-mono font-bold text-teal-dark dark:text-accent-lime">1:45:00</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[8px]">
              <span className="text-grey-green dark:text-[#8FA29B]">Questions</span>
              <span className="font-bold text-ink dark:text-cream-soft">30 of 40</span>
            </div>
            <div className="w-full h-1 bg-cream-light dark:bg-[#232D2D] rounded-full overflow-hidden">
              <div className="h-full bg-teal-dark dark:bg-accent-lime rounded-full" style={{ width: "75%" }} />
            </div>
          </div>
          <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">No hints · No lookup · Timed</div>
        </div>
      ),
      whatIsIt: "Timed realistic practice exam with conditions matching the actual test.",
      whySummaUsesIt: "Summa uses exam simulations to give the student authentic test experience. No hints, no lookup, timed conditions build exam readiness.",
      techniques: ["Exam Simulation", "Timed Practice", "Authentic Conditions"],
      whenSummaUsesIt: ["The exam is approaching and realistic practice is needed", "The student needs to experience timed conditions", "Full-length practice under exam rules", "Stamina and pacing need practice"],
      example: "Exam Simulation: 1 hour 45 minutes. 30 of 40 questions completed. No hints, no lookup, timed.",
      whatHappensAfter: [{ step: "Simulation starts", detail: "Timed exam conditions activated" }, { step: "Student completes exam", detail: "All responses captured under time pressure" }, { step: "Results evaluated", detail: "Score, time per question, and weak areas analyzed" }, { step: "Readiness recalculated", detail: "Exam readiness updated based on performance" }],
      usedWith: ["Exam Readiness", "Post-Exam Reflection", "Predicted Practice"],
      decisionSignals: ["Realistic practice needed", "Timed conditions important", "Exam stamina matters"],
    },
    {
      id: "post_exam_reflection",
      title: "40. Post-Exam Reflection",
      category: "Exam Components",
      desc: "Guided reflection on what felt difficult and where gaps remain.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Post-Exam Reflection</div>
          <div className="space-y-1.5">
            <div className="px-2 py-1.5 bg-cream-light dark:bg-[#232D2D] rounded-lg text-[8px] text-grey-green dark:text-[#8FA29B] italic">
              "Graph traversal questions felt unclear..."
            </div>
            <div className="px-2 py-1.5 bg-teal-dark/10 dark:bg-accent-lime/10 rounded-lg text-[8px] text-ink dark:text-cream-soft font-medium">
              → Focus area: BFS/DFS implementation
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Guided reflection on what felt difficult and where gaps remain.",
      whySummaUsesIt: "Summa uses post-exam reflection to help students process their performance. Reflection turns exam experience into learning insight.",
      techniques: ["Reflective Learning", "Metacognition", "Performance Processing"],
      whenSummaUsesIt: ["An exam or practice exam was completed", "The student needs to process what happened", "Gaps need to be identified through reflection", "Emotional processing of performance matters"],
      example: "Post-Exam Reflection: What felt difficult? Graph traversal questions felt unclear. Focus area: BFS/DFS implementation.",
      whatHappensAfter: [{ step: "Reflection prompts delivered", detail: "Guided questions about the exam experience" }, { step: "Student reflects", detail: "Difficult areas and feelings captured" }, { step: "Gaps identified", detail: "Specific weaknesses surfaced through reflection" }, { step: "Study plan updated", detail: "Reflected insights incorporated into next steps" }],
      usedWith: ["Exam Simulation", "Weak Area Card", "Next Action Card"],
      decisionSignals: ["Exam completed", "Reflection valuable", "Emotional processing needed"],
    },

    // --- RESOURCE COMPONENTS ---
    {
      id: "resource_card",
      title: "41. Resource Card",
      category: "Resource Components",
      desc: "Relevant learning material surfaced during teaching — textbook, video, or article.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex gap-2.5">
          <div className="w-10 h-14 bg-teal-dark/10 dark:bg-accent-lime/10 rounded-lg flex items-center justify-center text-teal-dark dark:text-accent-lime text-lg shrink-0">📘</div>
          <div className="flex-1 space-y-1">
            <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Introduction to Algorithms</div>
            <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">CLRS · Chapter 12: BSTs</div>
            <div className="text-[7px] text-teal-dark dark:text-accent-lime font-semibold">Relevant to: Binary Trees</div>
          </div>
        </div>
      ),
      whatIsIt: "Relevant learning material surfaced during teaching, textbook, video, or article.",
      whySummaUsesIt: "Summa uses resource cards to connect students with authoritative materials. When a concept needs deeper study, the right resource is surfaced automatically.",
      techniques: ["Resource Curation", "Supplementary Learning", "Authority Linking"],
      whenSummaUsesIt: ["A concept needs deeper study", "Authoritative material exists that would help", "The student benefits from external resources", "The teaching needs supplementary material"],
      example: "Introduction to Algorithms, CLRS Chapter 12: BSTs. Relevant to: Binary Trees.",
      whatHappensAfter: [{ step: "Resource surfaced", detail: "Relevant material presented" }, { step: "Student accesses", detail: "External resource studied" }, { step: "Understanding deepened", detail: "Concept mastery improves" }, { step: "Resource effectiveness tracked", detail: "Whether the resource helped is recorded" }],
      usedWith: ["Resource Section", "Recommended Resource", "Citation Drawer"],
      decisionSignals: ["Deeper study needed", "Authoritative material available", "Supplementary resource helpful"],
    },
    {
      id: "source_card",
      title: "42. Source / Provenance Card",
      category: "Resource Components",
      desc: "Shows where Summa's teaching content originates — uploaded material or web source.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Source</div>
          <div className="p-2 bg-cream-light dark:bg-[#232D2D] rounded-lg space-y-1">
            <div className="text-[8px] font-semibold text-ink dark:text-cream-soft">CSC 201 Lecture Notes — Week 8</div>
            <div className="text-[7px] text-grey-green dark:text-[#8FA29B]">Uploaded by: Prof. Adebayo</div>
            <div className="text-[7px] text-teal-dark dark:text-accent-lime">Page 14-16 · Binary Tree Properties</div>
          </div>
          <div className="text-[7px] text-grey-green dark:text-[#8FA29B] italic">Verified from uploaded material</div>
        </div>
      ),
      whatIsIt: "Shows where Summa's teaching content originates, uploaded material or web source.",
      whySummaUsesIt: "Summa uses source cards to maintain transparency about where information comes from. Students deserve to know the provenance of what they are learning.",
      techniques: ["Source Transparency", "Provenance Tracking", "Trust Building"],
      whenSummaUsesIt: ["Summa is teaching from uploaded materials", "The source of information matters", "Transparency builds trust", "The student wants to verify or explore further"],
      example: "Source: CSC 201 Lecture Notes, Week 8. Uploaded by: Prof. Adebayo. Page 14-16: Binary Tree Properties.",
      whatHappensAfter: [{ step: "Source displayed", detail: "Origin of teaching content shown" }, { step: "Student verifies", detail: "Can check the original material" }, { step: "Trust maintained", detail: "Transparency reinforces credibility" }, { step: "Source accessed", detail: "Student can explore the original material" }],
      usedWith: ["Citation Drawer", "Resource Card", "Recommended Resource"],
      decisionSignals: ["Source matters", "Transparency needed", "Student wants to verify"],
    },
    {
      id: "recommended_resource",
      title: "43. Recommended Resource",
      category: "Resource Components",
      desc: "Suggested external resource based on current topic and learning gaps.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-bold text-teal-dark dark:text-accent-lime">★ Recommended</span>
          </div>
          <div className="space-y-1">
            <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Visualgo — BST Operations</div>
            <div className="text-[8px] text-grey-green dark:text-[#8FA29B]">Interactive visualization of tree algorithms</div>
          </div>
          <div className="text-[7px] text-teal-dark dark:text-accent-lime font-semibold">Why: You scored 45% on BST insertion</div>
        </div>
      ),
      whatIsIt: "Suggested external resource based on current topic and learning gaps.",
      whySummaUsesIt: "Summa uses recommended resources to connect struggling students with materials that specifically address their gaps. Not generic, targeted.",
      techniques: ["Gap-Targeted Resources", "Personalized Recommendation", "Learning Support"],
      whenSummaUsesIt: ["A specific learning gap is identified", "An external resource would address the gap", "The student needs targeted support", "Generic resources would not be as effective"],
      example: "Recommended: Visualgo, BST Operations. Why: You scored 45% on BST insertion. Interactive visualization helps.",
      whatHappensAfter: [{ step: "Resource recommended", detail: "Gap-specific resource presented" }, { step: "Student engages", detail: "External resource studied" }, { step: "Gap addressed", detail: "Weakness improves" }, { step: "Recommendation effectiveness tracked", detail: "Whether the recommendation helped is recorded" }],
      usedWith: ["Resource Card", "Weak Area Card", "Next Action Card"],
      decisionSignals: ["Specific gap identified", "Targeted resource available", "Generic help insufficient"],
    },
    {
      id: "resource_section",
      title: "44. Resource Section",
      category: "Resource Components",
      desc: "Grouped collection of relevant materials surfaced during a topic or session.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Resources for Binary Trees</div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              <span>📘</span> CLRS Ch. 12
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              <span>🎥</span> MIT OCW Lecture 5
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-cream-light dark:bg-[#232D2D] rounded text-[8px] text-ink dark:text-cream-soft">
              <span>📝</span> Your lecture notes (p.14-16)
            </div>
          </div>
        </div>
      ),
      whatIsIt: "Grouped collection of relevant materials surfaced during a topic or session.",
      whySummaUsesIt: "Summa uses resource sections to organize multiple related materials into a coherent collection. One place to find everything relevant to a topic.",
      techniques: ["Resource Organization", "Topic-Based Collection", "Study Material Aggregation"],
      whenSummaUsesIt: ["Multiple resources are relevant to a topic", "The student needs organized access to materials", "A topic spans multiple resource types", "Study sessions benefit from centralized resources"],
      example: "Resources for Binary Trees: CLRS Ch. 12, MIT OCW Lecture 5, Your lecture notes (p.14-16).",
      whatHappensAfter: [{ step: "Resources organized", detail: "Topic-relevant materials grouped" }, { step: "Student accesses", detail: "Materials studied in organized order" }, { step: "Understanding deepens", detail: "Multiple sources reinforce learning" }, { step: "Resource usage tracked", detail: "Which resources are most valuable is recorded" }],
      usedWith: ["Resource Card", "Source Card", "Citation Drawer"],
      decisionSignals: ["Multiple resources relevant", "Organization helps", "Topic-based access valuable"],
    },
    {
      id: "citation_drawer",
      title: "45. Citation / Source Drawer",
      category: "Resource Components",
      desc: "Expandable drawer showing exact sources when Summa teaches from uploaded materials.",
      badgeBg: "bg-teal-dark/10 dark:bg-accent-lime/10 text-teal-dark dark:text-accent-lime",
      icon: (
        <svg className="w-5 h-5 text-teal-dark dark:text-accent-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      preview: (
        <div className="w-full h-[140px] bg-white dark:bg-[#1C2323] rounded-xl border border-mist-green dark:border-[#2A3838]/80 p-3 shadow-2xs flex flex-col justify-between">
          <div className="text-[9px] font-bold text-ink dark:text-cream-soft">Citation Source</div>
          <div className="p-2 bg-cream-light dark:bg-[#232D2D] rounded-lg space-y-1">
            <div className="text-[8px] font-semibold text-ink dark:text-cream-soft">"A BST is a binary tree where..."</div>
            <div className="text-[7px] text-grey-green dark:text-[#8FA29B]">— CSC 201 Notes, p.14, Prof. Adebayo</div>
            <div className="text-[7px] text-teal-dark dark:text-accent-lime">View full source →</div>
          </div>
        </div>
      ),
      whatIsIt: "Expandable drawer showing exact sources when Summa teaches from uploaded materials.",
      whySummaUsesIt: "Summa uses citation drawers to provide exact source references. When teaching from uploaded materials, the student can verify and explore the original source.",
      techniques: ["Citation Management", "Source Verification", "Academic Integrity"],
      whenSummaUsesIt: ["Summa teaches from uploaded materials", "The student needs exact source references", "Academic integrity requires citation", "The student wants to verify the teaching"],
      example: "Citation: 'A BST is a binary tree where...' CSC 201 Notes, p.14, Prof. Adebayo. View full source.",
      whatHappensAfter: [{ step: "Citation displayed", detail: "Exact source reference shown" }, { step: "Student verifies", detail: "Original source can be checked" }, { step: "Trust reinforced", detail: "Transparency builds confidence" }, { step: "Source explored", detail: "Student can dive deeper into original material" }],
      usedWith: ["Source Card", "Resource Card", "Resource Section"],
      decisionSignals: ["Teaching from uploads", "Citation needed", "Verification matters"],
    },
  ];
