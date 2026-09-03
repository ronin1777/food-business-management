"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { me } from "@/lib/api/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function checkAuthentication() {
      try {
        await me();

        if (mounted) {
          router.replace("/dashboard");
        }
      } catch {
        if (mounted) {
          router.replace("/login");
        }
      }
    }

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-sm text-muted-foreground">
        در حال بررسی حساب کاربری...
      </div>
    </main>
  );
}