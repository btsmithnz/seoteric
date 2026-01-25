import { Id } from "@/convex/_generated/dataModel";
import { ChatSidebar } from "./sidebar";
import { SidebarProvider } from "@/components/providers/sidebar";
import { ChatSidebarMobileTrigger } from "./sidebar/mobile-trigger";

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
    <SidebarProvider>
      <div className="flex-1 flex flex-row">
        <ChatSidebar siteId={siteId} />
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-4 pt-1 md:pt-4">
          <ChatSidebarMobileTrigger />
          <div className="h-full">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
