"use client";

import { GraduationCap, Presentation } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4 sm:p-8">
      <div className="flex items-center mb-8">
        <Presentation className="h-10 w-10 text-primary" />
        <span className="ml-2 text-2xl font-bold">Centre de Formation</span>
      </div>
      {children}
    </div>
  );
}
