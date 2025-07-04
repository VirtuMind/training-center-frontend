"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user has admin role
    const user = getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      // Redirect to appropriate page based on role
      if (user?.role === "TRAINER") {
        router.push("/trainer");
      } else {
        router.push("/dashboard");
      }
    }
  }, [router]);

  return <>{children}</>;
}
