import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardNav, DashboardNavSkeleton } from "@/app/(dash)/nav";
import { ConvexProvider } from "@/components/providers/convex";
import { CreateSiteDialog } from "@/components/sites/create-site-dialog";
import { ClientAuthBoundary } from "@/lib/auth-client";
import { getToken, isAuthenticated } from "@/lib/auth-server";

function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthBoundary>
      <DashboardNav />
      <CreateSiteDialog />
      {children}
    </ClientAuthBoundary>
  );
}

async function ConvexGate({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }

  return <ConvexProvider initialToken={token}>{children}</ConvexProvider>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Suspense fallback={<DashboardNavSkeleton />}>
        <ConvexGate>
          <AuthGate>{children}</AuthGate>
        </ConvexGate>
      </Suspense>
    </div>
  );
}
