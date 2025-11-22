"use client";

import { Supplement } from "@/lib/models/supplement";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";

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
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900">
            {supplement.name}
          </CardTitle>
          {supplement.brand && (
            <p className="text-sm text-muted-foreground mt-1">{supplement.brand}</p>
          )}
        </div>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(supplement)}
            className="h-8 w-8 text-gray-400 hover:text-blue-600"
            aria-label="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-gray-400 hover:text-red-600"
            aria-label="Delete"
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {(supplement.dosage || supplement.frequency) && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span>
              {supplement.dosage && supplement.frequency
                ? `${supplement.dosage}, ${supplement.frequency}`
                : supplement.dosage || supplement.frequency}
            </span>
          </div>
        )}

        {supplement.startDate && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2 text-gray-400" />
            <span>Started {formatDate(supplement.startDate.toDate())}</span>
          </div>
        )}
      </CardContent>

      {supplement.notes && (
        <CardFooter className="pt-4 border-t border-gray-100 block">
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {supplement.notes}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
