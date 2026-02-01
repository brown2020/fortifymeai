/**
 * Supplement category types
 */
export type SupplementCategory =
  | "vitamin"
  | "mineral"
  | "amino_acid"
  | "herb"
  | "probiotic"
  | "omega"
  | "enzyme"
  | "antioxidant"
  | "hormone"
  | "other";

/**
 * Common supplement forms
 */
export type SupplementForm =
  | "tablet"
  | "capsule"
  | "softgel"
  | "powder"
  | "liquid"
  | "gummy"
  | "lozenge"
  | "spray"
  | "patch"
  | "injection";

/**
 * Canonical supplement information from database
 */
export interface SupplementInfo {
  id: string;
  canonicalName: string;
  aliases: string[]; // Alternative names for search
  category: SupplementCategory;

  // Common forms this supplement comes in
  forms: SupplementForm[];

  // Typical dosage information
  typicalDosage: {
    min: number;
    max: number;
    unit: string;
    frequency: string;
  };

  // Upper limit if known
  upperLimit?: {
    amount: number;
    unit: string;
    notes?: string;
  };

  // Brief description
  description: string;

  // Primary benefits/uses
  benefits: string[];

  // Best time to take
  bestTimeToTake?: string;

  // Take with food?
  withFood?: "with" | "without" | "either";

  // Common brand examples (not endorsements)
  popularBrands?: string[];
}

/**
 * Supplement category labels and icons
 */
export const SUPPLEMENT_CATEGORIES: Record<
  SupplementCategory,
  { label: string; icon: string; color: string }
> = {
  vitamin: { label: "Vitamin", icon: "Sun", color: "yellow" },
  mineral: { label: "Mineral", icon: "Gem", color: "slate" },
  amino_acid: { label: "Amino Acid", icon: "Dna", color: "purple" },
  herb: { label: "Herb", icon: "Leaf", color: "green" },
  probiotic: { label: "Probiotic", icon: "Bug", color: "teal" },
  omega: { label: "Omega/Fatty Acid", icon: "Fish", color: "blue" },
  enzyme: { label: "Enzyme", icon: "FlaskConical", color: "orange" },
  antioxidant: { label: "Antioxidant", icon: "Shield", color: "red" },
  hormone: { label: "Hormone", icon: "Activity", color: "pink" },
  other: { label: "Other", icon: "Pill", color: "gray" },
};

/**
 * Supplement form labels
 */
export const SUPPLEMENT_FORMS: Record<SupplementForm, string> = {
  tablet: "Tablet",
  capsule: "Capsule",
  softgel: "Softgel",
  powder: "Powder",
  liquid: "Liquid",
  gummy: "Gummy",
  lozenge: "Lozenge",
  spray: "Spray",
  patch: "Patch",
  injection: "Injection",
};

/**
 * Common supplements database
 * This provides autocomplete and default values
 */
export const SUPPLEMENT_DATABASE: Omit<SupplementInfo, "id">[] = [
  // Vitamins
  {
    canonicalName: "Vitamin D3",
    aliases: ["Vitamin D", "Cholecalciferol", "D3", "Vit D"],
    category: "vitamin",
    forms: ["softgel", "tablet", "liquid", "gummy"],
    typicalDosage: { min: 1000, max: 5000, unit: "IU", frequency: "daily" },
    upperLimit: { amount: 10000, unit: "IU", notes: "Consult doctor for higher doses" },
    description: "Essential for bone health, immune function, and mood regulation.",
    benefits: ["Bone health", "Immune support", "Mood", "Calcium absorption"],
    bestTimeToTake: "Morning with breakfast",
    withFood: "with",
  },
  {
    canonicalName: "Vitamin C",
    aliases: ["Ascorbic Acid", "Vit C", "Ester-C"],
    category: "vitamin",
    forms: ["tablet", "capsule", "powder", "gummy", "liquid"],
    typicalDosage: { min: 500, max: 2000, unit: "mg", frequency: "daily" },
    upperLimit: { amount: 2000, unit: "mg", notes: "Higher doses may cause GI upset" },
    description: "Powerful antioxidant supporting immune function and collagen production.",
    benefits: ["Immune support", "Antioxidant", "Skin health", "Iron absorption"],
    bestTimeToTake: "Any time, can split doses",
    withFood: "either",
  },
  {
    canonicalName: "Vitamin B12",
    aliases: ["B12", "Cobalamin", "Methylcobalamin", "Cyanocobalamin"],
    category: "vitamin",
    forms: ["tablet", "capsule", "liquid", "lozenge", "spray", "injection"],
    typicalDosage: { min: 500, max: 2500, unit: "mcg", frequency: "daily" },
    description: "Essential for energy, nerve function, and red blood cell formation.",
    benefits: ["Energy", "Nerve health", "Red blood cells", "Brain function"],
    bestTimeToTake: "Morning",
    withFood: "either",
  },
  {
    canonicalName: "Vitamin B Complex",
    aliases: ["B Complex", "B Vitamins", "Vitamin B"],
    category: "vitamin",
    forms: ["tablet", "capsule", "liquid"],
    typicalDosage: { min: 1, max: 1, unit: "serving", frequency: "daily" },
    description: "Combination of B vitamins supporting energy and metabolism.",
    benefits: ["Energy", "Metabolism", "Nervous system", "Stress support"],
    bestTimeToTake: "Morning with food",
    withFood: "with",
  },

  // Minerals
  {
    canonicalName: "Magnesium",
    aliases: ["Mag", "Magnesium Glycinate", "Magnesium Citrate", "Magnesium Oxide"],
    category: "mineral",
    forms: ["tablet", "capsule", "powder", "liquid"],
    typicalDosage: { min: 200, max: 400, unit: "mg", frequency: "daily" },
    upperLimit: { amount: 400, unit: "mg", notes: "From supplements; food sources additional" },
    description: "Critical mineral for muscle function, sleep, and over 300 enzyme reactions.",
    benefits: ["Sleep", "Muscle relaxation", "Stress relief", "Bone health"],
    bestTimeToTake: "Evening, 30 minutes before bed",
    withFood: "either",
  },
  {
    canonicalName: "Zinc",
    aliases: ["Zinc Picolinate", "Zinc Gluconate", "Zinc Citrate"],
    category: "mineral",
    forms: ["tablet", "capsule", "lozenge", "liquid"],
    typicalDosage: { min: 15, max: 30, unit: "mg", frequency: "daily" },
    upperLimit: { amount: 40, unit: "mg", notes: "Long-term high doses may affect copper levels" },
    description: "Essential for immune function, wound healing, and protein synthesis.",
    benefits: ["Immune support", "Wound healing", "Skin health", "Taste/smell"],
    bestTimeToTake: "With a meal to reduce nausea",
    withFood: "with",
  },
  {
    canonicalName: "Iron",
    aliases: ["Ferrous Sulfate", "Iron Bisglycinate", "Ferrous Gluconate"],
    category: "mineral",
    forms: ["tablet", "capsule", "liquid"],
    typicalDosage: { min: 18, max: 45, unit: "mg", frequency: "daily" },
    upperLimit: { amount: 45, unit: "mg", notes: "Only supplement if deficient" },
    description: "Essential for oxygen transport and energy production.",
    benefits: ["Energy", "Oxygen transport", "Cognitive function"],
    bestTimeToTake: "On empty stomach with Vitamin C for best absorption",
    withFood: "without",
  },
  {
    canonicalName: "Calcium",
    aliases: ["Calcium Carbonate", "Calcium Citrate", "Cal"],
    category: "mineral",
    forms: ["tablet", "capsule", "powder", "gummy"],
    typicalDosage: { min: 500, max: 1200, unit: "mg", frequency: "daily" },
    upperLimit: { amount: 2500, unit: "mg", notes: "Include dietary sources in total" },
    description: "Essential for bone health, muscle function, and nerve signaling.",
    benefits: ["Bone health", "Muscle function", "Nerve signaling"],
    bestTimeToTake: "Split doses throughout day, with food",
    withFood: "with",
  },

  // Omega fatty acids
  {
    canonicalName: "Fish Oil",
    aliases: ["Omega-3", "EPA/DHA", "Omega 3 Fish Oil", "Fish Oil Omega 3"],
    category: "omega",
    forms: ["softgel", "liquid"],
    typicalDosage: { min: 1000, max: 3000, unit: "mg", frequency: "daily" },
    description: "Source of EPA and DHA omega-3 fatty acids for heart and brain health.",
    benefits: ["Heart health", "Brain function", "Joint health", "Mood support"],
    bestTimeToTake: "With meals to reduce fish burps",
    withFood: "with",
  },

  // Herbs
  {
    canonicalName: "Ashwagandha",
    aliases: ["Withania somnifera", "Indian Ginseng", "KSM-66"],
    category: "herb",
    forms: ["capsule", "powder", "liquid"],
    typicalDosage: { min: 300, max: 600, unit: "mg", frequency: "daily" },
    description: "Adaptogenic herb supporting stress resilience and energy.",
    benefits: ["Stress relief", "Energy", "Sleep", "Cognitive function"],
    bestTimeToTake: "Morning or evening, consistency matters",
    withFood: "either",
  },
  {
    canonicalName: "Turmeric/Curcumin",
    aliases: ["Turmeric", "Curcumin", "Curcuma longa"],
    category: "herb",
    forms: ["capsule", "powder", "liquid"],
    typicalDosage: { min: 500, max: 1500, unit: "mg", frequency: "daily" },
    description: "Anti-inflammatory herb with curcumin as the active compound.",
    benefits: ["Anti-inflammatory", "Joint health", "Antioxidant", "Brain health"],
    bestTimeToTake: "With meals, especially with black pepper for absorption",
    withFood: "with",
  },

  // Amino acids
  {
    canonicalName: "L-Theanine",
    aliases: ["Theanine", "L Theanine"],
    category: "amino_acid",
    forms: ["capsule", "tablet", "powder"],
    typicalDosage: { min: 100, max: 400, unit: "mg", frequency: "daily" },
    description: "Amino acid from tea that promotes calm focus without drowsiness.",
    benefits: ["Calm focus", "Stress relief", "Sleep support", "Pairs well with caffeine"],
    bestTimeToTake: "Morning for focus, evening for relaxation",
    withFood: "either",
  },
  {
    canonicalName: "Creatine",
    aliases: ["Creatine Monohydrate", "Creatine HCL"],
    category: "amino_acid",
    forms: ["powder", "capsule"],
    typicalDosage: { min: 3, max: 5, unit: "g", frequency: "daily" },
    description: "Supports muscle energy, strength, and cognitive function.",
    benefits: ["Muscle strength", "Exercise performance", "Brain energy"],
    bestTimeToTake: "Any time, consistency matters most",
    withFood: "either",
  },

  // Probiotics
  {
    canonicalName: "Probiotic",
    aliases: ["Probiotics", "Lactobacillus", "Bifidobacterium", "Gut Health"],
    category: "probiotic",
    forms: ["capsule", "powder", "liquid"],
    typicalDosage: { min: 1, max: 50, unit: "billion CFU", frequency: "daily" },
    description: "Beneficial bacteria supporting gut health and immune function.",
    benefits: ["Gut health", "Digestion", "Immune support", "Mood"],
    bestTimeToTake: "Morning on empty stomach or with light meal",
    withFood: "without",
  },

  // Other
  {
    canonicalName: "Melatonin",
    aliases: ["Sleep Aid", "Mel"],
    category: "hormone",
    forms: ["tablet", "capsule", "gummy", "liquid", "lozenge"],
    typicalDosage: { min: 0.5, max: 5, unit: "mg", frequency: "as needed" },
    description: "Hormone that regulates sleep-wake cycles.",
    benefits: ["Sleep onset", "Jet lag", "Sleep quality"],
    bestTimeToTake: "30-60 minutes before bedtime",
    withFood: "either",
  },
  {
    canonicalName: "Collagen",
    aliases: ["Collagen Peptides", "Hydrolyzed Collagen", "Marine Collagen"],
    category: "other",
    forms: ["powder", "capsule", "liquid"],
    typicalDosage: { min: 5, max: 15, unit: "g", frequency: "daily" },
    description: "Protein supporting skin, hair, nails, and joint health.",
    benefits: ["Skin health", "Hair & nails", "Joint support", "Gut health"],
    bestTimeToTake: "Any time, often added to morning coffee/smoothie",
    withFood: "either",
  },
  {
    canonicalName: "CoQ10",
    aliases: ["Coenzyme Q10", "Ubiquinol", "Ubiquinone"],
    category: "antioxidant",
    forms: ["softgel", "capsule"],
    typicalDosage: { min: 100, max: 300, unit: "mg", frequency: "daily" },
    description: "Antioxidant supporting cellular energy and heart health.",
    benefits: ["Heart health", "Energy", "Antioxidant", "Statin support"],
    bestTimeToTake: "With meals containing fat for absorption",
    withFood: "with",
  },
];

/**
 * Search supplements by name or alias
 */
export function searchSupplements(query: string): Omit<SupplementInfo, "id">[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];

  return SUPPLEMENT_DATABASE.filter((supplement) => {
    const nameMatch = supplement.canonicalName.toLowerCase().includes(lowerQuery);
    const aliasMatch = supplement.aliases.some((alias) =>
      alias.toLowerCase().includes(lowerQuery)
    );
    return nameMatch || aliasMatch;
  });
}
