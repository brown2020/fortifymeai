"use client";

import { Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pill } from "lucide-react";

export function AuthBrandHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center gap-2 mb-6">
        <div className="p-2.5 rounded-xl bg-linear-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20">
          <Pill className="h-6 w-6 text-emerald-400" />
        </div>
        <span className="text-xl font-bold gradient-text">Fortify.me</span>
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-slate-400">{subtitle}</p>
    </div>
  );
}

export function AuthEmailField({
  id = "email",
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>Email address</Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Mail className="h-5 w-5 text-slate-500" />
        </div>
        <Input
          id={id}
          name="email"
          type="email"
          autoComplete="email"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="you@example.com"
          className="pl-10"
        />
      </div>
    </div>
  );
}

export function AuthAlert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const cls =
    tone === "error"
      ? "p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm"
      : "p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm";
  return <div className={cls}>{children}</div>;
}
