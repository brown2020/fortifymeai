"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../contexts/AuthContext";
import { User, Mail, Lock } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

          <div className="bg-white rounded-xl shadow-xs p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 rounded-full p-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Account Information
                </h2>
                <p className="text-gray-600">Manage your account details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-900">{user?.email}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-900">••••••••</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Delete Account
            </h2>
            <p className="text-gray-600 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <button className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
