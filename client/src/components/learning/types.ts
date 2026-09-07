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

export interface ComponentDefinition {
  id: string;
  meta: ComponentMeta;
}
