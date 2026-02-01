"use client";

import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  InteractionCheckResult,
  getInteractionSeverityColor,
  getInteractionSeverityLabel,
} from "@/lib/models/interactions";

interface InteractionWarningProps {
  result: InteractionCheckResult;
  className?: string;
  collapsible?: boolean;
  showBeneficial?: boolean;
}

export default function InteractionWarning({
  result,
  className,
  collapsible = true,
  showBeneficial = true,
}: InteractionWarningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!result.hasInteractions) {
    return null;
  }

  const majorInteractions = result.interactions.filter(
    (i) => i.interaction.severity === "major" && !i.interaction.description.toLowerCase().includes("beneficial")
  );
  const moderateInteractions = result.interactions.filter(
    (i) => i.interaction.severity === "moderate" && !i.interaction.description.toLowerCase().includes("beneficial")
  );
  const minorInteractions = result.interactions.filter(
    (i) => i.interaction.severity === "minor" && !i.interaction.description.toLowerCase().includes("beneficial")
  );
  const beneficialInteractions = result.interactions.filter(
    (i) => i.interaction.description.toLowerCase().includes("beneficial")
  );

  const getSeverityIcon = (severity: string, isBeneficial: boolean) => {
    if (isBeneficial) return CheckCircle;
    switch (severity) {
      case "major":
        return AlertTriangle;
      case "moderate":
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getSeverityClasses = (severity: string, isBeneficial: boolean) => {
    if (isBeneficial) {
      return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    }
    switch (severity) {
      case "major":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "moderate":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      default:
        return "bg-blue-500/10 border-blue-500/30 text-blue-400";
    }
  };

  const renderInteractionGroup = (
    interactions: typeof result.interactions,
    severity: string,
    isBeneficial = false
  ) => {
    if (interactions.length === 0) return null;
    if (!showBeneficial && isBeneficial) return null;

    const Icon = getSeverityIcon(severity, isBeneficial);
    const classes = getSeverityClasses(severity, isBeneficial);

    return (
      <div className={cn("rounded-lg border p-4", classes)}>
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div className="font-medium">
              {isBeneficial
                ? `${interactions.length} Beneficial Interaction${interactions.length > 1 ? "s" : ""}`
                : `${interactions.length} ${getInteractionSeverityLabel(severity as any)}`}
            </div>
            {interactions.map((item, index) => (
              <div
                key={index}
                className="text-sm space-y-1 border-t border-current/20 pt-2 first:border-0 first:pt-0"
              >
                <div className="font-medium text-white">
                  {item.userSupplementNames.join(" + ")}
                </div>
                <p className="text-slate-300">{item.interaction.description}</p>
                <p className="text-xs opacity-80">
                  <strong>Recommendation:</strong> {item.interaction.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const totalWarnings = majorInteractions.length + moderateInteractions.length + minorInteractions.length;

  return (
    <div className={cn("space-y-3", className)}>
      {collapsible && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn(
              "h-5 w-5",
              majorInteractions.length > 0 ? "text-rose-400" :
              moderateInteractions.length > 0 ? "text-amber-400" : "text-blue-400"
            )} />
            <span className="font-medium text-white">
              {totalWarnings > 0
                ? `${totalWarnings} Interaction Warning${totalWarnings > 1 ? "s" : ""}`
                : "Interaction Information"}
            </span>
            {beneficialInteractions.length > 0 && showBeneficial && (
              <span className="text-sm text-emerald-400">
                (+{beneficialInteractions.length} beneficial)
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-slate-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </button>
      )}

      {(!collapsible || isExpanded) && (
        <div className="space-y-3">
          {renderInteractionGroup(majorInteractions, "major")}
          {renderInteractionGroup(moderateInteractions, "moderate")}
          {renderInteractionGroup(minorInteractions, "minor")}
          {renderInteractionGroup(beneficialInteractions, "minor", true)}
        </div>
      )}
    </div>
  );
}
