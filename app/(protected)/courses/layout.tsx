"use client";

import { getCurrentUser } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    // Check if user has student role
    const user = getCurrentUser();
    if (user && user.role !== "STUDENT") {
      // Redirect to appropriate page based on role
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else if (user.role === "TRAINER") {
        // tets if the path is /courses/[id]
        if (pathname.startsWith("/courses/")) return;
        router.push("/trainer");
      }
    }
  }, [router]);
  return <>{children}</>;
}
