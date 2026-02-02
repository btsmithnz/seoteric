"use client";

import { type MouseEventHandler, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function LogoutMenuItem() {
  const [loading, setLoading] = useState(false);

  const handleLogout: MouseEventHandler<HTMLSpanElement> = async (evt) => {
    evt.stopPropagation();

    if (loading) {
      return;
    }

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

  // biome-ignore lint/a11y/noNoninteractiveElementInteractions: <used as child>
  // biome-ignore lint/a11y/noStaticElementInteractions: <used as child>
  return <span onClick={handleLogout}>Logout{loading ? "..." : ""}</span>;
}
