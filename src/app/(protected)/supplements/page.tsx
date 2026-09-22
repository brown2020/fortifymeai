"use client";

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/components/ui/toaster";
import { 
  Plus, 
  Search, 
  Sparkles, 
  Filter
} from "lucide-react";
import { Supplement, SupplementFormData } from "@/lib/models/supplement";
import {
  getUserSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
} from "@/lib/services/supplementService";
import SupplementForm from "@/components/supplements/SupplementForm";
import { Button } from "@/components/ui/button";
import { PageBackground } from "@/components/layout/page-background";
import { Timestamp } from "firebase/firestore";
import { SupplementContent } from "./SupplementContent";



function RenderSupplements({
  isLoading,
  error,
  filteredSupplements,
  searchQuery,
  showForm,
  editingSupplement,
  isSubmitting,
  supplementToFormData,
  handleSearchChange,
  handleAddSupplement,
  handleEditSupplement,
  handleDeleteSupplement,
  handleSubmitForm,
  handleCancelForm,
  fetchSupplements,
}: {
  isLoading: boolean;
  error: string | null;
  filteredSupplements: import("@/lib/models/supplement").Supplement[];
  searchQuery: string;
  showForm: boolean;
  editingSupplement: import("@/lib/models/supplement").Supplement | null;
  isSubmitting: boolean;
  supplementToFormData: (s: import("@/lib/models/supplement").Supplement) => import("@/lib/models/supplement").SupplementFormData;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddSupplement: () => void;
  handleEditSupplement: (s: import("@/lib/models/supplement").Supplement) => void;
  handleDeleteSupplement: (id: string) => void;
  handleSubmitForm: (data: import("@/lib/models/supplement").SupplementFormData) => Promise<void>;
  handleCancelForm: () => void;
  fetchSupplements: () => void;
}) {
  return (

    <div className="min-h-screen pt-20 pb-12 page-transition">
      {/* Background effects */}
      <PageBackground />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">My Supplements</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Supplement Collection
            </h1>
            <p className="text-slate-400">
              Track and manage your supplement routine
            </p>
          </div>
          <Button onClick={handleAddSupplement} className="gap-2">
            <Plus className="h-5 w-5" />
            Add Supplement
          </Button>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="glass-card p-1">
            <div className="relative flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Search supplements..."
                  aria-label="Search supplements"
                  className="w-full h-12 pl-12 pr-4 bg-transparent text-white placeholder-slate-400 
                    focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-base rounded-xl"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" aria-hidden="true" />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-slate-400"
                aria-label="Filter supplements"
              >
                <Filter className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="mb-8">
            <SupplementForm
              initialData={
                editingSupplement
                  ? supplementToFormData(editingSupplement)
                  : undefined
              }
              onSubmit={handleSubmitForm}
              onCancel={handleCancelForm}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {/* Content */}
        <SupplementContent
          isLoading={isLoading}
          error={error}
          filteredSupplements={filteredSupplements}
          searchQuery={searchQuery}
          onRetry={fetchSupplements}
          onAdd={handleAddSupplement}
          onEdit={handleEditSupplement}
          onDelete={handleDeleteSupplement}
        />
      </div>
    </div>
  );
}

export default function Supplements() {

  const { user } = useAuthStore();
  const { addToast } = useToast();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [filteredSupplements, setFilteredSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSupplements = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserSupplements(user.uid);
      setSupplements(data);
      setFilteredSupplements(data);
    } catch {
      setError("Failed to load supplements. Please try again.");
      addToast("Failed to load supplements", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user, addToast]);

  useEffect(() => {
    if (user) {
      fetchSupplements();
    }
  }, [user, fetchSupplements]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSupplements(supplements);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = supplements.filter(
        (supplement) =>
          supplement.name.toLowerCase().includes(query) ||
          (supplement.brand && supplement.brand.toLowerCase().includes(query)) ||
          (supplement.notes && supplement.notes.toLowerCase().includes(query))
      );
      setFilteredSupplements(filtered);
    }
  }, [searchQuery, supplements]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddSupplement = () => {
    setEditingSupplement(null);
    setShowForm(true);
  };

  const handleEditSupplement = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSupplement(null);
  };

  const handleSubmitForm = async (data: SupplementFormData) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      if (editingSupplement) {
        await updateSupplement(editingSupplement.id, data);
        setSupplements((prev) =>
          prev.map((s) => {
            if (s.id === editingSupplement.id) {
              return {
                ...s,
                ...data,
                startDate: data.startDate
                  ? Timestamp.fromDate(data.startDate)
                  : s.startDate,
                updatedAt: Timestamp.now(),
              };
            }
            return s;
          })
        );
        addToast("Supplement updated successfully", "success");
      } else {
        await createSupplement(user.uid, data);
        await fetchSupplements();
        addToast("Supplement added successfully", "success");
      }

      setShowForm(false);
      setEditingSupplement(null);
    } catch {
      addToast("Failed to save supplement. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplement = async (id: string) => {
    try {
      await deleteSupplement(id);
      setSupplements((prev) => prev.filter((s) => s.id !== id));
      addToast("Supplement deleted", "success");
    } catch {
      addToast("Failed to delete supplement. Please try again.", "error");
    }
  };

  const supplementToFormData = (supplement: Supplement): SupplementFormData => {
    return {
      name: supplement.name,
      brand: supplement.brand,
      dosage: supplement.dosage,
      frequency: supplement.frequency,
      scheduleTimes: supplement.scheduleTimes,
      notes: supplement.notes,
      startDate: supplement.startDate ? supplement.startDate.toDate() : undefined,
      imageUrl: supplement.imageUrl,
    };
  };

  return (
    <RenderSupplements
      isLoading={isLoading}
      error={error}
      filteredSupplements={filteredSupplements}
      searchQuery={searchQuery}
      showForm={showForm}
      editingSupplement={editingSupplement}
      isSubmitting={isSubmitting}
      supplementToFormData={supplementToFormData}
      handleSearchChange={handleSearchChange}
      handleAddSupplement={handleAddSupplement}
      handleEditSupplement={handleEditSupplement}
      handleDeleteSupplement={handleDeleteSupplement}
      handleSubmitForm={handleSubmitForm}
      handleCancelForm={handleCancelForm}
      fetchSupplements={fetchSupplements}
    />
  );
}
