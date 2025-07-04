"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/utils";
import Layout from "@/components/layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Simple auth check - just verify token exists
    // No automatic refresh - on expiry, API layer will redirect to login
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return <Layout>{children}</Layout>;
}
