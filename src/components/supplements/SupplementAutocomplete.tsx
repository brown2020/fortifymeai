"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { searchSupplements, SupplementInfo } from "@/lib/models/supplement-database";
import { Input } from "@/components/ui/input";
import { Pill, ChevronRight } from "lucide-react";

interface SupplementAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (supplement: Omit<SupplementInfo, "id">) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export default function SupplementAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search supplements...",
  className,
  error,
}: SupplementAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Omit<SupplementInfo, "id">[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search for suggestions when value changes
  useEffect(() => {
    if (value.length >= 2) {
      const results = searchSupplements(value);
      setSuggestions(results.slice(0, 8));
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (supplement: Omit<SupplementInfo, "id">) => {
    onChange(supplement.canonicalName);
    setIsOpen(false);
    onSelect?.(supplement);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        error={error}
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          {suggestions.map((supplement, index) => (
            <button
              key={supplement.canonicalName}
              type="button"
              onClick={() => handleSelect(supplement)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={cn(
                "w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors",
                highlightedIndex === index
                  ? "bg-emerald-500/20 text-white"
                  : "text-slate-300 hover:bg-slate-700/50"
              )}
            >
              <div className="flex-shrink-0 p-1.5 rounded-lg bg-slate-700/50">
                <Pill className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {supplement.canonicalName}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {supplement.category} · {supplement.typicalDosage.min}-{supplement.typicalDosage.max} {supplement.typicalDosage.unit}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
