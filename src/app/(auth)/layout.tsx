import { PublicLayout } from "@/components/layouts/public";
import { ConvexProvider } from "@/components/providers/convex";
import { getToken } from "@/lib/auth-server";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const token = await getToken();

  return (
    <PublicLayout>
      <ConvexProvider initialToken={token}>
        <div className="flex min-h-screen items-center justify-center p-4">
          {children}
        </div>
      </ConvexProvider>
    </PublicLayout>
  );
}
