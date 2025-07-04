"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/utils";

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check if user has student or trainer role
    const user = getCurrentUser();
    if (user && user.role === "ADMIN") {
      // Admins should be redirected to admin panel
      router.push("/admin");
    }
  }, [router]);

  return <>{children}</>;
}
