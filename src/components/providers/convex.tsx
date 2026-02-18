"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import type { PropsWithChildren } from "react";
import { authClient } from "@/lib/auth-client";
import { convexUrl } from "@/lib/env.client";

const convex = new ConvexReactClient(convexUrl);

export function ConvexProvider({
  children,
  initialToken,
}: PropsWithChildren<{ initialToken?: string | null }>) {
  return (
    <ConvexBetterAuthProvider
      authClient={authClient}
      client={convex}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
