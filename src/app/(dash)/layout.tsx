import { ConvexProvider } from "@/components/providers/convex";
import { DashboardNav } from "@/app/(dash)/nav";
import { getToken, isAuthenticated } from "@/lib/auth-server";
import { CreateSiteDialog } from "@/components/sites/create-site-dialog";
import { redirect } from "next/navigation";
import { ClientAuthBoundary } from "@/lib/auth-client";

async function InnerLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }

  return (
    <ClientAuthBoundary>
      <div className="flex w-full min-h-screen flex-col">
        <DashboardNav />
        <CreateSiteDialog />
        {children}
      </div>
    </ClientAuthBoundary>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();

  return (
    <ConvexProvider initialToken={token}>
      <InnerLayout>{children}</InnerLayout>
    </ConvexProvider>
  );
}
