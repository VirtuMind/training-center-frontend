"use client";

import { GraduationCap } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
      <div className="flex items-center mb-8">
        <GraduationCap className="h-10 w-10 text-primary" />
        <span className="ml-2 text-2xl font-bold">EduCraft</span>
      </div>
      {children}
    </div>
  );
}
