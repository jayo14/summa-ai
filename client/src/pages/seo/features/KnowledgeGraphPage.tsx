import { Database, GitBranch, CheckCircle2, TrendingUp } from "lucide-react";
import { FeatureDetailPage } from "../FeatureDetailPage";
import { PAGES } from "@/data/seo/site";

export default function KnowledgeGraphPage() {
  return (
    <FeatureDetailPage
      title={PAGES["features-knowledge-graph"].title}
      description={PAGES["features-knowledge-graph"].description}
      canonical={PAGES["features-knowledge-graph"].path}
      keywords={[
        "knowledge graph",
        "learning map",
        "concept mapping",
        "knowledge visualization",
        "concept connections",
      ]}
      icon={<Database className="size-3" />}
      heroTag="KNOWLEDGE GRAPH"
      heroTitle="See how everything"
      heroHighlight="connects"
      heroDescription="Visual map of how concepts relate. Track mastery across topics and understand the relationships between ideas."
      whatItIs="A knowledge graph is a visual representation of how concepts in your study materials relate to each other. Summa AI builds this automatically from your content, showing you what you've mastered, what needs review, and how ideas connect."
      howItWorks={[
        {
          step: "Automatic graph construction",
          detail: "Summa AI analyzes your materials and conversations to build a concept map automatically.",
        },
        {
          step: "Mastery coloring",
          detail: "Each concept is colored by your mastery level — green for mastered, yellow for partial, red for gaps.",
        },
        {
          step: "Relationship mapping",
          detail: "See which concepts depend on others. Understanding prerequisites helps you study more effectively.",
        },
        {
          step: "Continuous updates",
          detail: "As you study, quiz, and review, your knowledge graph updates in real-time.",
        },
      ]}
      benefits={[
        "Automatic construction from your materials",
        "Visual mastery tracking",
        "Concept relationship mapping",
        "Identifies prerequisite knowledge",
        "Real-time updates as you study",
        "Multi-subject support",
        "Export and review",
        "Integration with quizzes and flashcards",
      ]}
      useCases={[
        {
          title: "Understanding complex subjects",
          description: "See how topics in calculus, ML, or chemistry build on each other.",
        },
        {
          title: "Identifying knowledge gaps",
          description: "Visually spot red areas that need attention before exams.",
        },
        {
          title: "Review and revision",
          description: "Use the graph to plan efficient review sessions focusing on weak connections.",
        },
      ]}
      ctaTitle="Build your knowledge graph"
      ctaDescription="Start studying. Your knowledge graph builds automatically."
    />
  );
}
