"use client";

import { useAuth } from "../../../contexts/AuthContext";
import { Calendar, Activity, Bell } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.email?.split("@")[0]}!
        </h1>
        <p className="text-gray-600 mt-2">
          {`Here's an overview of your supplement routine`}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-xs p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">{`Today's Schedule`}</h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600">No supplements scheduled for today</p>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Add supplements →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs p-6">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-lg font-semibold">Progress Tracking</h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600">Start tracking your supplements</p>
            <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View progress →
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xs p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold">Reminders</h2>
          </div>
          <div className="space-y-3">
            <p className="text-gray-600">No active reminders</p>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium">
              Set reminders →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="text-gray-600">
          <p>No recent activity to show</p>
        </div>
      </div>
    </div>
  );
}
