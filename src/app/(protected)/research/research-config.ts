"use client";

import {
  Sparkles,
  FlaskConical,
  Timer,
  AlertTriangle,
  Layers,
  FileText,
} from "lucide-react";
import type { ResearchCategory } from "./actions";

export const RESEARCH_CATEGORIES: {
  id: ResearchCategory;
  label: string;
  icon: typeof Sparkles;
  description: string;
  color: string;
}[] = [
  {
    id: "general",
    label: "Overview",
    icon: Sparkles,
    description: "Comprehensive supplement information",
    color: "text-emerald-400",
  },
  {
    id: "benefits",
    label: "Benefits",
    icon: FlaskConical,
    description: "Therapeutic effects and health benefits",
    color: "text-violet-400",
  },
  {
    id: "dosing",
    label: "Dosing",
    icon: Timer,
    description: "Dosage, timing, and optimization",
    color: "text-cyan-400",
  },
  {
    id: "interactions",
    label: "Interactions",
    icon: AlertTriangle,
    description: "Drug and supplement interactions",
    color: "text-amber-400",
  },
  {
    id: "stacking",
    label: "Stacking",
    icon: Layers,
    description: "Combining supplements for synergy",
    color: "text-rose-400",
  },
  {
    id: "evidence",
    label: "Evidence",
    icon: FileText,
    description: "Scientific research analysis",
    color: "text-sky-400",
  },
];

export const QUICK_QUERIES: Record<ResearchCategory, string[]> = {
  general: [
    "What is Vitamin D3 and what are its main uses?",
    "Tell me about Magnesium Glycinate",
    "What should I know about Omega-3 fish oil?",
    "Overview of Ashwagandha supplement",
  ],
  benefits: [
    "What are the cognitive benefits of Lion's Mane mushroom?",
    "How does Creatine help with muscle building?",
    "Sleep benefits of Magnesium before bed",
    "Anti-inflammatory benefits of Turmeric/Curcumin",
  ],
  dosing: [
    "Optimal Vitamin D3 dosage for deficiency",
    "When should I take Magnesium for sleep?",
    "Loading phase for Creatine supplementation",
    "Best time to take B-complex vitamins",
  ],
  interactions: [
    "Does Vitamin K interact with blood thinners?",
    "Can I take Ashwagandha with antidepressants?",
    "Magnesium and medication interactions",
    "Fish oil and blood pressure medication",
  ],
  stacking: [
    "Best supplements to stack with Creatine for gains",
    "Sleep stack: Magnesium + L-Theanine + ?",
    "Nootropic stack for focus and memory",
    "Anti-aging supplement combinations",
  ],
  evidence: [
    "What does the research say about Vitamin D and immunity?",
    "Clinical trials on Ashwagandha for anxiety",
    "Meta-analyses on Omega-3 for heart health",
    "Evidence for NAC supplementation benefits",
  ],
};

export const POPULAR_SUPPLEMENTS = [
  "Vitamin D3",
  "Magnesium",
  "Omega-3",
  "Vitamin B12",
  "Ashwagandha",
  "Creatine",
  "Lion's Mane",
  "NAC",
];

export function getCategoryConfig(categoryId: ResearchCategory) {
  return (
    RESEARCH_CATEGORIES.find((c) => c.id === categoryId) ?? RESEARCH_CATEGORIES[0]
  );
}
