import {
  KNOWN_INTERACTIONS,
  Interaction,
  InteractionCheckResult,
  InteractionSeverity,
} from "../models/interactions";
import { Supplement } from "../models/supplement";

/**
 * Normalize supplement name for matching
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Check if two names match (considering aliases)
 */
function namesMatch(name1: string, name2: string): boolean {
  const n1 = normalizeName(name1);
  const n2 = normalizeName(name2);

  // Direct match
  if (n1 === n2) return true;

  // Check if one contains the other
  if (n1.includes(n2) || n2.includes(n1)) return true;

  // Common variations
  const variations: Record<string, string[]> = {
    vitamind: ["vitamind3", "d3", "cholecalciferol"],
    vitaminc: ["ascorbicacid", "esterc"],
    vitaminb12: ["b12", "cobalamin", "methylcobalamin", "cyanocobalamin"],
    vitamine: ["etocopherol"],
    vitamink: ["k2", "mk7", "menaquinone"],
    fishoil: ["omega3", "epadha", "omegafattyacid"],
    magnesium: ["mag", "magnesiumglycinate", "magnesiumcitrate", "magnesiumoxide"],
    calcium: ["calciumcarbonate", "calciumcitrate", "cal"],
    zinc: ["zincpicolinate", "zincgluconate", "zinccitrate"],
    iron: ["ferroussulfate", "ironbisglycinate", "ferrousgluconate"],
    probiotics: ["probiotic", "lactobacillus", "bifidobacterium"],
    ashwagandha: ["withaniasomnifera", "indianginseng", "ksm66"],
    turmeric: ["curcumin", "curcumalonga"],
    melatonin: ["mel", "sleepaid"],
    coq10: ["coenzymeq10", "ubiquinol", "ubiquinone"],
    stjohnswort: ["stjohns", "hypericumperforatum"],
  };

  for (const [key, aliases] of Object.entries(variations)) {
    const allNames = [key, ...aliases];
    const match1 = allNames.some((a) => n1.includes(a) || a.includes(n1));
    const match2 = allNames.some((a) => n2.includes(a) || a.includes(n2));
    if (match1 && match2) return true;
  }

  return false;
}

/**
 * Check for interactions between user's supplements
 */
export function checkInteractions(
  supplements: Supplement[]
): InteractionCheckResult {
  const foundInteractions: InteractionCheckResult["interactions"] = [];

  // Check each known interaction
  KNOWN_INTERACTIONS.forEach((interaction, index) => {
    const matchingSupplements: { id: string; name: string }[] = [];

    // For each substance in the interaction, find matching user supplements
    interaction.substances.forEach((substance) => {
      if (substance.type === "supplement") {
        const matchingUserSupplements = supplements.filter((supp) =>
          namesMatch(supp.name, substance.name)
        );
        matchingUserSupplements.forEach((supp) => {
          if (!matchingSupplements.some((m) => m.id === supp.id)) {
            matchingSupplements.push({ id: supp.id, name: supp.name });
          }
        });
      }
    });

    // If we found at least 2 matching supplements (for supplement-supplement interactions)
    // or 1 matching supplement (for supplement-drug interactions where user may be on medication)
    if (interaction.type === "supplement-supplement" && matchingSupplements.length >= 2) {
      foundInteractions.push({
        interaction: { ...interaction, id: `interaction_${index}` },
        userSupplementIds: matchingSupplements.map((s) => s.id),
        userSupplementNames: matchingSupplements.map((s) => s.name),
      });
    }
  });

  return {
    hasInteractions: foundInteractions.length > 0,
    interactions: foundInteractions.sort(
      (a, b) => severityRank(b.interaction.severity) - severityRank(a.interaction.severity)
    ),
    checkedAt: new Date(),
  };
}

/**
 * Get severity rank for sorting (higher = more severe)
 */
function severityRank(severity: InteractionSeverity): number {
  switch (severity) {
    case "major":
      return 3;
    case "moderate":
      return 2;
    case "minor":
      return 1;
    default:
      return 0;
  }
}

/**
 * Check if adding a new supplement would create interactions
 */
export function checkNewSupplementInteractions(
  newSupplementName: string,
  existingSupplements: Supplement[]
): InteractionCheckResult {
  // Create a temporary supplement object
  const tempSupplement: Supplement = {
    id: "temp_new",
    name: newSupplementName,
    userId: "",
    createdAt: {} as any,
    updatedAt: {} as any,
  };

  // Check all supplements including the new one
  const allSupplements = [...existingSupplements, tempSupplement];
  const result = checkInteractions(allSupplements);

  // Filter to only include interactions involving the new supplement
  const relevantInteractions = result.interactions.filter((i) =>
    i.userSupplementIds.includes("temp_new")
  );

  return {
    hasInteractions: relevantInteractions.length > 0,
    interactions: relevantInteractions,
    checkedAt: new Date(),
  };
}

/**
 * Get potential drug interactions for a supplement
 * Returns interactions that involve medications (for user awareness)
 */
export function getDrugInteractionWarnings(
  supplementName: string
): Omit<Interaction, "id">[] {
  return KNOWN_INTERACTIONS.filter((interaction) => {
    if (interaction.type !== "supplement-drug") return false;

    return interaction.substances.some(
      (substance) =>
        substance.type === "supplement" && namesMatch(substance.name, supplementName)
    );
  });
}

/**
 * Get all beneficial interactions (like Vitamin C + Iron)
 */
export function getBeneficialInteractions(
  supplements: Supplement[]
): InteractionCheckResult["interactions"] {
  const result = checkInteractions(supplements);

  // Filter to only interactions that mention "BENEFICIAL" in description
  return result.interactions.filter((i) =>
    i.interaction.description.toLowerCase().includes("beneficial")
  );
}

/**
 * Get interaction summary for dashboard display
 */
export function getInteractionSummary(supplements: Supplement[]): {
  major: number;
  moderate: number;
  minor: number;
  beneficial: number;
  total: number;
} {
  const result = checkInteractions(supplements);

  const summary = {
    major: 0,
    moderate: 0,
    minor: 0,
    beneficial: 0,
    total: result.interactions.length,
  };

  result.interactions.forEach((i) => {
    if (i.interaction.description.toLowerCase().includes("beneficial")) {
      summary.beneficial++;
    } else {
      summary[i.interaction.severity]++;
    }
  });

  return summary;
}
