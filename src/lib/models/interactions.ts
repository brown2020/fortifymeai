/**
 * Interaction severity levels
 */
export type InteractionSeverity = "major" | "moderate" | "minor";

/**
 * Interaction type
 */
export type InteractionType =
  | "supplement-supplement"
  | "supplement-drug"
  | "supplement-food"
  | "supplement-condition";

/**
 * Known interaction between supplements or with drugs
 */
export interface Interaction {
  id: string;
  type: InteractionType;

  // Interacting substances (at least 2)
  substances: {
    name: string;
    type: "supplement" | "drug" | "food" | "condition";
  }[];

  severity: InteractionSeverity;

  // Description of the interaction
  description: string;

  // What to do about it
  recommendation: string;

  // Mechanism of action if known
  mechanism?: string;

  // Source references
  sources?: string[];
}

/**
 * Interaction check result for user's supplements
 */
export interface InteractionCheckResult {
  hasInteractions: boolean;
  interactions: {
    interaction: Interaction;
    userSupplementIds: string[];
    userSupplementNames: string[];
  }[];
  checkedAt: Date;
}

/**
 * Common supplement interactions database
 * This is a simplified local database - could be expanded or moved to Firestore
 */
export const KNOWN_INTERACTIONS: Omit<Interaction, "id">[] = [
  {
    type: "supplement-supplement",
    substances: [
      { name: "Calcium", type: "supplement" },
      { name: "Iron", type: "supplement" },
    ],
    severity: "moderate",
    description:
      "Calcium can significantly reduce iron absorption when taken together.",
    recommendation:
      "Take calcium and iron supplements at least 2 hours apart for optimal absorption.",
    mechanism:
      "Calcium competes with iron for absorption in the intestinal tract.",
  },
  {
    type: "supplement-supplement",
    substances: [
      { name: "Calcium", type: "supplement" },
      { name: "Zinc", type: "supplement" },
    ],
    severity: "minor",
    description: "High doses of calcium may reduce zinc absorption.",
    recommendation:
      "If taking high-dose calcium, consider separating from zinc by 2 hours.",
    mechanism: "Competition for absorption pathways.",
  },
  {
    type: "supplement-supplement",
    substances: [
      { name: "Vitamin E", type: "supplement" },
      { name: "Vitamin K", type: "supplement" },
    ],
    severity: "moderate",
    description:
      "High doses of Vitamin E may interfere with Vitamin K activity.",
    recommendation:
      "Monitor if taking blood thinners. Consult healthcare provider if on anticoagulant therapy.",
    mechanism:
      "Vitamin E may inhibit Vitamin K-dependent clotting factors at high doses.",
  },
  {
    type: "supplement-supplement",
    substances: [
      { name: "Magnesium", type: "supplement" },
      { name: "Calcium", type: "supplement" },
    ],
    severity: "minor",
    description:
      "Very high doses of either mineral may compete for absorption.",
    recommendation:
      "A 2:1 calcium to magnesium ratio is generally well-absorbed together. Consider spacing if taking high doses.",
  },
  {
    type: "supplement-supplement",
    substances: [
      { name: "Zinc", type: "supplement" },
      { name: "Copper", type: "supplement" },
    ],
    severity: "moderate",
    description:
      "Long-term high-dose zinc supplementation can cause copper deficiency.",
    recommendation:
      "If taking zinc long-term (>50mg/day), consider adding copper supplementation or choose a zinc supplement that includes copper.",
    mechanism:
      "Zinc induces metallothionein which binds copper and prevents absorption.",
  },
  {
    type: "supplement-supplement",
    substances: [
      { name: "Iron", type: "supplement" },
      { name: "Vitamin C", type: "supplement" },
    ],
    severity: "minor",
    description:
      "This is a BENEFICIAL interaction - Vitamin C enhances iron absorption.",
    recommendation:
      "Take iron with Vitamin C to improve absorption, especially for non-heme iron.",
    mechanism: "Vitamin C reduces ferric iron to ferrous form for better absorption.",
  },
  {
    type: "supplement-supplement",
    substances: [
      { name: "Vitamin D", type: "supplement" },
      { name: "Vitamin K2", type: "supplement" },
    ],
    severity: "minor",
    description:
      "This is a BENEFICIAL interaction - K2 helps direct calcium mobilized by D3.",
    recommendation:
      "Consider taking D3 with K2 to support proper calcium metabolism and bone health.",
    mechanism:
      "Vitamin D increases calcium absorption; K2 activates proteins that direct calcium to bones.",
  },
  {
    type: "supplement-drug",
    substances: [
      { name: "St. John's Wort", type: "supplement" },
      { name: "Antidepressants", type: "drug" },
    ],
    severity: "major",
    description:
      "St. John's Wort can cause serious interactions with many antidepressants, potentially causing serotonin syndrome.",
    recommendation:
      "Do NOT combine without medical supervision. Consult your doctor before taking St. John's Wort if on any antidepressant.",
    mechanism:
      "St. John's Wort affects serotonin levels and induces liver enzymes that metabolize many drugs.",
  },
  {
    type: "supplement-drug",
    substances: [
      { name: "Fish Oil", type: "supplement" },
      { name: "Blood Thinners", type: "drug" },
    ],
    severity: "moderate",
    description:
      "Fish oil has mild blood-thinning effects that may add to anticoagulant medications.",
    recommendation:
      "Inform your doctor if taking fish oil with blood thinners. Monitor for increased bruising or bleeding.",
    mechanism: "Omega-3 fatty acids can inhibit platelet aggregation.",
  },
  {
    type: "supplement-drug",
    substances: [
      { name: "Vitamin K", type: "supplement" },
      { name: "Warfarin", type: "drug" },
    ],
    severity: "major",
    description:
      "Vitamin K directly counteracts the effect of warfarin (Coumadin).",
    recommendation:
      "Keep vitamin K intake consistent if on warfarin. Do not start or stop K supplements without consulting your doctor.",
    mechanism:
      "Warfarin works by inhibiting Vitamin K-dependent clotting factors.",
  },
  {
    type: "supplement-supplement",
    substances: [
      { name: "Melatonin", type: "supplement" },
      { name: "5-HTP", type: "supplement" },
    ],
    severity: "minor",
    description:
      "Both affect sleep and serotonin pathways. Combined effect may be stronger than expected.",
    recommendation:
      "Start with lower doses of each if combining. May cause excessive drowsiness.",
  },
  {
    type: "supplement-supplement",
    substances: [
      { name: "Ashwagandha", type: "supplement" },
      { name: "Thyroid Medications", type: "drug" },
    ],
    severity: "moderate",
    description:
      "Ashwagandha may increase thyroid hormone levels.",
    recommendation:
      "Monitor thyroid levels if taking ashwagandha with thyroid medications. Consult your doctor.",
    mechanism: "Ashwagandha may stimulate thyroid function.",
  },
];

/**
 * Get severity color for UI display
 */
export function getInteractionSeverityColor(severity: InteractionSeverity): string {
  switch (severity) {
    case "major":
      return "red";
    case "moderate":
      return "yellow";
    case "minor":
      return "blue";
    default:
      return "gray";
  }
}

/**
 * Get severity label for display
 */
export function getInteractionSeverityLabel(severity: InteractionSeverity): string {
  switch (severity) {
    case "major":
      return "Major Interaction";
    case "moderate":
      return "Moderate Interaction";
    case "minor":
      return "Minor Interaction";
    default:
      return "Unknown";
  }
}
