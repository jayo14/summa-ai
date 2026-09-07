import React from "react";
import { ComponentMeta } from "@/components/learning/types";

// Import all learning components
import { multiple_choice } from "@/components/learning/core-learning/multiple-choice";
import { short_answer } from "@/components/learning/core-learning/short-answer";
import { true_false } from "@/components/learning/core-learning/true-false";
import { fill_blank } from "@/components/learning/core-learning/fill-blank";
import { matching } from "@/components/learning/core-learning/matching";
import { ordering } from "@/components/learning/core-learning/ordering";
import { categorization } from "@/components/learning/core-learning/categorization";
import { teach_back } from "@/components/learning/core-learning/teach-back";
import { confidence_check } from "@/components/learning/core-learning/confidence-check";
import { scenario } from "@/components/learning/core-learning/scenario";

import { explanation_card } from "@/components/learning/teaching/explanation-card";
import { worked_example } from "@/components/learning/teaching/worked-example";
import { hint_ladder } from "@/components/learning/teaching/hint-ladder";
import { concept_breakdown } from "@/components/learning/teaching/concept-breakdown";
import { compare_contrast } from "@/components/learning/teaching/compare-contrast";
import { analogy_card } from "@/components/learning/teaching/analogy-card";
import { common_mistake } from "@/components/learning/teaching/common-mistake";
import { why_it_works } from "@/components/learning/teaching/why-it-works";

import { recall_prompt } from "@/components/learning/active-recall/recall-prompt";
import { spaced_review } from "@/components/learning/active-recall/spaced-review";
import { rapid_recall } from "@/components/learning/active-recall/rapid-recall";
import { retrieval_grid } from "@/components/learning/active-recall/retrieval-grid";
import { memory_check } from "@/components/learning/active-recall/memory-check";

import { flashcard_card } from "@/components/learning/interactive/flashcard-card";
import { progress_card } from "@/components/learning/interactive/progress-card";

import { learning_path } from "@/components/learning/progress/learning-path";
import { milestone_card } from "@/components/learning/progress/milestone-card";
import { mastery_card } from "@/components/learning/progress/mastery-card";
import { readiness_card } from "@/components/learning/progress/readiness-card";
import { weak_area } from "@/components/learning/progress/weak-area";
import { next_action } from "@/components/learning/progress/next-action";

import { session_plan } from "@/components/learning/session/session-plan";
import { session_progress } from "@/components/learning/session/session-progress";
import { session_summary } from "@/components/learning/session/session-summary";
import { resume_learning } from "@/components/learning/session/resume-learning";

import { exam_countdown } from "@/components/learning/exam/exam-countdown";
import { exam_readiness } from "@/components/learning/exam/exam-readiness";
import { topic_coverage } from "@/components/learning/exam/topic-coverage";
import { past_question } from "@/components/learning/exam/past-question";
import { predicted_practice } from "@/components/learning/exam/predicted-practice";
import { exam_simulation } from "@/components/learning/exam/exam-simulation";
import { post_exam_reflection } from "@/components/learning/exam/post-exam-reflection";

import { resource_card } from "@/components/learning/resource/resource-card";
import { source_card } from "@/components/learning/resource/source-card";
import { recommended_resource } from "@/components/learning/resource/recommended-resource";
import { resource_section } from "@/components/learning/resource/resource-section";
import { citation_drawer } from "@/components/learning/resource/citation-drawer";

// Re-export ComponentMeta for convenience
export type { ComponentMeta } from "@/components/learning/types";

// All components array
export const components: ComponentMeta[] = [
  // Core Learning
  multiple_choice,
  short_answer,
  true_false,
  fill_blank,
  matching,
  ordering,
  categorization,
  teach_back,
  confidence_check,
  scenario,
  
  // Teaching Components
  explanation_card,
  worked_example,
  hint_ladder,
  concept_breakdown,
  compare_contrast,
  analogy_card,
  common_mistake,
  why_it_works,
  
  // Active-Recall / Retention
  recall_prompt,
  spaced_review,
  rapid_recall,
  retrieval_grid,
  memory_check,
  
  // Interactive Cards
  flashcard_card,
  progress_card,
  
  // Progress / Guidance
  learning_path,
  milestone_card,
  mastery_card,
  readiness_card,
  weak_area,
  next_action,
  
  // Session Components
  session_plan,
  session_progress,
  session_summary,
  resume_learning,
  
  // Exam Components
  exam_countdown,
  exam_readiness,
  topic_coverage,
  past_question,
  predicted_practice,
  exam_simulation,
  post_exam_reflection,
  
  // Resource Components
  resource_card,
  source_card,
  recommended_resource,
  resource_section,
  citation_drawer,
];

// Helper to get component by ID
export const getComponentById = (id: string): ComponentMeta | undefined => {
  return components.find(c => c.id === id);
};

// Get components by category
export const getComponentsByCategory = (category: string): ComponentMeta[] => {
  return components.filter(c => c.category === category);
};

// Get all unique categories
export const getCategories = (): string[] => {
  return Array.from(new Set(components.map(c => c.category)));
};
