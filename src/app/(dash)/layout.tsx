import { ConvexProvider } from "@/components/providers/convex";
import { getToken } from "@/lib/auth-server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();

  return <ConvexProvider initialToken={token}>{children}</ConvexProvider>;
}
