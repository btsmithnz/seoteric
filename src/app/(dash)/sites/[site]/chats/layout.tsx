import { Id } from "@/convex/_generated/dataModel";
import { ChatSidebar } from "./sidebar";

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
    <div className="flex h-[calc(100vh-49px)]">
      <ChatSidebar siteId={siteId} />
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
