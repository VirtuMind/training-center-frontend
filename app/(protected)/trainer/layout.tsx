"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/utils";

export default function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user has trainer or admin role
    const user = getCurrentUser();
    if (user && user.role !== "TRAINER") {
      // Redirect to appropriate page based on role
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  return <>{children}</>;
}
