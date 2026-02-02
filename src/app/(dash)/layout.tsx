import { redirect } from "next/navigation";
import { DashboardNav } from "@/app/(dash)/nav";
import { ConvexProvider } from "@/components/providers/convex";
import { CreateSiteDialog } from "@/components/sites/create-site-dialog";
import { ClientAuthBoundary } from "@/lib/auth-client";
import { getToken, isAuthenticated } from "@/lib/auth-server";

async function InnerLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect("/login");
  }

  return (
    <ClientAuthBoundary>
      <div className="flex min-h-screen w-full flex-col">
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
