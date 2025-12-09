"use client";

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToast } from "@/components/ui/toaster";
import { 
  Plus, 
  Search, 
  FlaskConical, 
  Sparkles, 
  Package,
  Filter
} from "lucide-react";
import { Supplement, SupplementFormData } from "@/lib/models/supplement";
import {
  getUserSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
} from "@/lib/services/supplementService";
import SupplementCard from "@/components/supplements/SupplementCard";
import SupplementForm from "@/components/supplements/SupplementForm";
import { Button } from "@/components/ui/button";
import { Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

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
    } catch (err) {
      console.error("Error fetching supplements:", err);
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
    } catch (err) {
      console.error("Error saving supplement:", err);
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
    } catch (err) {
      console.error("Error deleting supplement:", err);
      addToast("Failed to delete supplement. Please try again.", "error");
    }
  };

  const supplementToFormData = (supplement: Supplement): SupplementFormData => {
    return {
      name: supplement.name,
      brand: supplement.brand,
      dosage: supplement.dosage,
      frequency: supplement.frequency,
      notes: supplement.notes,
      startDate: supplement.startDate ? supplement.startDate.toDate() : undefined,
      imageUrl: supplement.imageUrl,
    };
  };

  return (
    <div className="min-h-screen pt-20 pb-12 page-transition">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
      </div>

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
                  type="text"
                  placeholder="Search supplements..."
                  className="w-full h-12 pl-12 pr-4 bg-transparent text-white placeholder-slate-400 
                    focus:outline-none text-base rounded-xl"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400">
                <Filter className="h-5 w-5" />
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
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="glass-card p-8 text-center border-rose-500/30">
            <div className="p-4 rounded-2xl bg-rose-500/10 w-fit mx-auto mb-4">
              <FlaskConical className="h-10 w-10 text-rose-400" />
            </div>
            <p className="text-rose-400 mb-4">{error}</p>
            <Button onClick={fetchSupplements} variant="outline">
              Try again
            </Button>
          </div>
        ) : filteredSupplements.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="p-4 rounded-2xl bg-slate-800/50 w-fit mx-auto mb-4">
              <Package className="h-12 w-12 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery.trim() !== ""
                ? "No supplements match your search"
                : "No supplements added yet"}
            </h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery.trim() !== ""
                ? "Try a different search term or add a new supplement"
                : "Start building your supplement collection to track your health journey"}
            </p>
            {searchQuery.trim() === "" && (
              <Button onClick={handleAddSupplement} className="gap-2">
                <Plus className="h-5 w-5" />
                Add Your First Supplement
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSupplements.map((supplement, index) => (
              <div
                key={supplement.id}
                className="stagger-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <SupplementCard
                  supplement={supplement}
                  onEdit={handleEditSupplement}
                  onDelete={handleDeleteSupplement}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
