import { ConvexProvider } from "@/components/providers/convex";
import { DashboardNav } from "@/app/(dash)/nav";
import { getToken, preloadAuthQuery } from "@/lib/auth-server";
import { CreateSiteDialog } from "@/components/sites/create-site-dialog";
import { api } from "@/convex/_generated/api";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();

  const preloadedSites = await preloadAuthQuery(api.site.list);

  return (
    <ConvexProvider initialToken={token}>
      <div className="flex w-full min-h-screen flex-col">
        <DashboardNav preloadedSites={preloadedSites} />
        <CreateSiteDialog />
        {children}
      </div>
    </ConvexProvider>
  );
}
