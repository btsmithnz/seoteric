import { ConvexProvider } from "@/components/providers/convex";
import { DashboardNav } from "@/components/layouts/dashboard";
import { getToken } from "@/lib/auth-server";
import { CreateSiteDialog } from "@/components/sites/create-site-dialog";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();

  return (
    <ConvexProvider initialToken={token}>
      <DashboardNav />
      <CreateSiteDialog />
      {children}
    </ConvexProvider>
  );
}
