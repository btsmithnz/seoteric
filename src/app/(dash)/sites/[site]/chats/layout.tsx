import { Id } from "@/convex/_generated/dataModel";
import { ChatSidebar } from "./sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { MobileTrigger } from "./mobile-trigger";

export default async function ChatsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const siteId = site as Id<"sites">;

  return (
    <SidebarProvider
      className="h-[calc(100vh-49px)] min-h-0"
      style={{ "--sidebar-top": "49px" } as React.CSSProperties}
      sidebarTop="49px"
    >
      <ChatSidebar siteId={siteId} />
      <SidebarInset className="overflow-auto p-4">
        <MobileTrigger />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
