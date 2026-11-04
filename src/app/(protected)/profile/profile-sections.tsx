"use client";

import {
  User,
  Mail,
  Lock,
  LogOut,
  Trash2,
  AlertTriangle,
  Sparkles,
  Shield,
  Bell,
  Palette,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const settingsSections = [
  {
    title: "Notifications",
    description: "Manage your notification preferences",
    icon: Bell,
    color: "text-amber-400",
    bgColor: "from-amber-500/20 to-orange-500/20",
    comingSoon: true,
  },
  {
    title: "Appearance",
    description: "Customize the look and feel",
    icon: Palette,
    color: "text-violet-400",
    bgColor: "from-violet-500/20 to-purple-500/20",
    comingSoon: true,
  },
  {
    title: "Privacy & Security",
    description: "Manage your data and security settings",
    icon: Shield,
    color: "text-emerald-400",
    bgColor: "from-emerald-500/20 to-teal-500/20",
    comingSoon: true,
  },
];

export function ProfileHeader() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-emerald-400 mb-2">
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-medium">Profile</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
      <p className="text-slate-400">Manage your account and preferences</p>
    </div>
  );
}

export function ProfileAccountCard({
  identityLoading,
  displayEmail,
  onPasswordReset,
}: {
  identityLoading: boolean;
  displayEmail: string | null;
  onPasswordReset: () => void;
}) {
  return (
    <div className="glass-card p-6 mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 
          border border-emerald-500/20">
          <User className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Account Information</h2>
          <p className="text-sm text-slate-400">Your personal details</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-0.5">Email address</p>
                <p className="text-white font-medium">
                  {identityLoading ? "Loading…" : displayEmail || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-700/50">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400 mb-0.5">Password</p>
                <p className="text-white font-medium">••••••••</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-400 hover:text-emerald-300"
              onClick={onPasswordReset}
            >
              Change
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSettingsCard({
  onComingSoon,
}: {
  onComingSoon: () => void;
}) {
  return (
    <div className="glass-card p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
      <div className="space-y-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.title}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 
                border border-slate-700/50 hover:border-slate-600/50 
                hover:bg-slate-800/50 transition-[color,background-color,border-color,transform,box-shadow,opacity] text-left group"
              onClick={onComingSoon}
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${section.bgColor}`}>
                <Icon className={`h-5 w-5 ${section.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-white font-medium">{section.title}</p>
                  {section.comingSoon ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                      Coming soon
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-400">{section.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-500 group-hover:text-slate-300 
                group-hover:translate-x-1 transition-[color,background-color,border-color,transform,box-shadow,opacity]" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ProfileSessionCard({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="glass-card p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Session</h2>
      <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-700/50">
              <LogOut className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-white font-medium">Sign out</p>
              <p className="text-sm text-slate-400">Sign out of your account on this device</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProfileDangerZone({
  showDeleteConfirm,
  isDeleting,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
}: {
  showDeleteConfirm: boolean;
  isDeleting: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) {
  return (
    <div className="glass-card p-6 border-rose-500/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-500/20">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
        </div>
        <h2 className="text-lg font-semibold text-white">Danger Zone</h2>
      </div>

      {showDeleteConfirm ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium mb-1">Are you absolutely sure?</p>
              <p className="text-sm text-slate-400">
                This action cannot be undone. This will permanently delete your account,
                supplements, and research history.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={onCancelDelete}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onConfirmDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Yes, delete my account
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Delete Account</p>
              <p className="text-sm text-slate-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAskDelete}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 
                hover:border-rose-500/50 hover:text-rose-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
