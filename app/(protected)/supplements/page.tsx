"use client";

import { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Plus, Search } from "lucide-react";
import { Supplement, SupplementFormData } from "../../../lib/models/supplement";
import {
  getUserSupplements,
  createSupplement,
  updateSupplement,
  deleteSupplement,
} from "../../../lib/services/supplementService";
import SupplementCard from "../../../components/supplements/SupplementCard";
import SupplementForm from "../../../components/supplements/SupplementForm";
import Button from "../../../components/ui/Button";
import { Timestamp } from "firebase/firestore";

export default function Supplements() {
  const { user } = useAuth();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [filteredSupplements, setFilteredSupplements] = useState<Supplement[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define fetchSupplements with useCallback
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
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch supplements when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchSupplements();
    }
  }, [user, fetchSupplements]);

  // Filter supplements when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSupplements(supplements);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = supplements.filter(
        (supplement) =>
          supplement.name.toLowerCase().includes(query) ||
          (supplement.brand &&
            supplement.brand.toLowerCase().includes(query)) ||
          (supplement.notes && supplement.notes.toLowerCase().includes(query))
      );
      setFilteredSupplements(filtered);
    }
  }, [searchQuery, supplements]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Use a simple timeout instead of the debounce utility to avoid type issues
    const value = e.target.value;
    setTimeout(() => {
      setSearchQuery(value);
    }, 300);
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

        // Update the local state
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
      } else {
        await createSupplement(user.uid, data);

        // Refresh the supplements list
        await fetchSupplements();
      }

      setShowForm(false);
      setEditingSupplement(null);
    } catch (err) {
      console.error("Error saving supplement:", err);
      alert("Failed to save supplement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplement = async (id: string) => {
    try {
      await deleteSupplement(id);

      // Update the local state
      setSupplements((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Error deleting supplement:", err);
      alert("Failed to delete supplement. Please try again.");
    }
  };

  // Convert Supplement to SupplementFormData for the form
  const supplementToFormData = (supplement: Supplement): SupplementFormData => {
    return {
      name: supplement.name,
      brand: supplement.brand,
      dosage: supplement.dosage,
      frequency: supplement.frequency,
      notes: supplement.notes,
      startDate: supplement.startDate
        ? supplement.startDate.toDate()
        : undefined,
      imageUrl: supplement.imageUrl,
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Supplements</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your supplement collection
          </p>
        </div>
        <Button onClick={handleAddSupplement}>
          <Plus className="h-5 w-5 mr-2" />
          Add Supplement
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search supplements..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={handleSearchChange}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

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

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading supplements...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">
          {error}
          <button
            onClick={fetchSupplements}
            className="ml-2 underline font-medium"
          >
            Try again
          </button>
        </div>
      ) : filteredSupplements.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery.trim() !== ""
                ? "No supplements match your search"
                : "No supplements added yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery.trim() !== ""
                ? "Try a different search term"
                : "Start building your supplement collection"}
            </p>
            {searchQuery.trim() === "" && (
              <Button variant="outline" onClick={handleAddSupplement}>
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Supplement
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSupplements.map((supplement) => (
            <SupplementCard
              key={supplement.id}
              supplement={supplement}
              onEdit={handleEditSupplement}
              onDelete={handleDeleteSupplement}
            />
          ))}
        </div>
      )}
    </div>
  );
}
