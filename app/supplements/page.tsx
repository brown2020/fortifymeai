"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import { Plus, Search } from "lucide-react";

export default function Supplements() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Supplements</h1>
            <p className="text-gray-600 mt-2">
              Manage and track your supplement collection
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-xs text-white bg-blue-600 hover:bg-blue-700">
            <Plus className="h-5 w-5 mr-2" />
            Add Supplement
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search supplements..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No supplements added yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start building your supplement collection
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100">
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Supplement
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
