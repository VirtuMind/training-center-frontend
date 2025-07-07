"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/utils";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    // Redirect based on user role
    const user = getCurrentUser();
    if (user) {
      switch (user.role) {
        case "ADMIN":
          router.replace("/admin");
          break;
        case "TRAINER":
          router.replace("/trainer");
          break;
        default:
          router.replace("/dashboard");
          break;
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <h1 className="text-2xl font-bold">Chargement en cours...</h1>
        <p className="text-muted-foreground">Veuillez patienter</p>
      </div>
    </div>
  );
}
