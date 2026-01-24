"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutMenuItem() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    if (isPending) return;

    startTransition(async () => {
      await authClient.signOut();
      router.push("/");
    });
  };

  return <span onClick={handleLogout}>Logout{isPending ? "..." : ""}</span>;
}
