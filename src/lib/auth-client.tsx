"use client";

import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { AuthBoundary } from "@convex-dev/better-auth/react";
import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { api } from "@/convex/_generated/api";
import { isAuthError } from "./utils";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});

export const ClientAuthBoundary = ({ children }: PropsWithChildren) => {
  const router = useRouter();

  return (
    <AuthBoundary
      authClient={authClient}
      getAuthUserFn={api.auth.getAuthUser}
      isAuthError={isAuthError}
      onUnauth={() => router.push("/login")}
    >
      {children}
    </AuthBoundary>
  );
};
