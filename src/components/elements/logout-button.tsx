"use client";

import { MouseEventHandler, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function LogoutMenuItem() {
  const [loading, setLoading] = useState(false);

  const handleLogout: MouseEventHandler<HTMLSpanElement> = async (evt) => {
    evt.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      await authClient.signOut();
    } catch (error) {
      toast.error("Unable to logout.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return <span onClick={handleLogout}>Logout{loading ? "..." : ""}</span>;
}
