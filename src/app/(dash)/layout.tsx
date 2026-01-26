import { ConvexProvider } from "@/components/providers/convex";
import { DashboardNav } from "@/app/(dash)/nav";
import { getToken, isAuthenticated, preloadAuthQuery } from "@/lib/auth-server";
import { CreateSiteDialog } from "@/components/sites/create-site-dialog";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { ClientAuthBoundary } from "@/lib/auth-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/sign-in");
  }

  const token = await getToken();

  const preloadedSites = await preloadAuthQuery(api.site.list);

  return (
    <ConvexProvider initialToken={token}>
      <ClientAuthBoundary>
        <div className="flex w-full min-h-screen flex-col">
          <DashboardNav preloadedSites={preloadedSites} />
          <CreateSiteDialog />
          {children}
        </div>
      </ClientAuthBoundary>
    </ConvexProvider>
  );
}
