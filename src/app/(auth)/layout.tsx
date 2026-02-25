import { Suspense } from "react";
import { PublicLayout } from "@/components/layouts/public";
import { ConvexProvider } from "@/components/providers/convex";
import { Spinner } from "@/components/ui/spinner";
import { getToken } from "@/lib/auth-server";

async function ConvexGate({ children }: { children: React.ReactNode }) {
  const token = await getToken();
  return <ConvexProvider initialToken={token}>{children}</ConvexProvider>;
}

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <PublicLayout>
      <div className="flex min-h-screen items-center justify-center p-4">
        <Suspense fallback={<Spinner />}>
          <ConvexGate>{children}</ConvexGate>
        </Suspense>
      </div>
    </PublicLayout>
  );
}
