"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user has student role
    const user = getCurrentUser();
    if (user && user.role !== "STUDENT") {
      // Redirect to appropriate page based on role
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "TRAINER") {
        router.push("/trainer");
      }
    }
  }, [router]);

  return <>{children}</>;
}
