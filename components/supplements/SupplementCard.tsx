"use client";

import { Supplement } from "../../lib/models/supplement";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { formatDate } from "../../lib/utils";
import { useState } from "react";

interface SupplementCardProps {
  supplement: Supplement;
  onEdit: (supplement: Supplement) => void;
  onDelete: (id: string) => void;
}

export default function SupplementCard({
  supplement,
  onEdit,
  onDelete,
}: SupplementCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    if (confirm("Are you sure you want to delete this supplement?")) {
      setIsDeleting(true);
      try {
        await onDelete(supplement.id);
      } catch (error) {
        console.error("Error deleting supplement:", error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {supplement.name}
          </h3>
          {supplement.brand && (
            <p className="text-sm text-gray-600 mt-1">{supplement.brand}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(supplement)}
            className="text-gray-400 hover:text-blue-600 transition-colors"
            aria-label="Edit"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="Delete"
            disabled={isDeleting}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {(supplement.dosage || supplement.frequency) && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span>
              {supplement.dosage && supplement.frequency
                ? `${supplement.dosage}, ${supplement.frequency}`
                : supplement.dosage || supplement.frequency}
            </span>
          </div>
        )}

        {supplement.startDate && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>Started {formatDate(supplement.startDate.toDate())}</span>
          </div>
        )}
      </div>

      {supplement.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {supplement.notes}
          </p>
        </div>
      )}
    </div>
  );
}
