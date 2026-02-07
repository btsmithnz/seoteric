import {
  SidebarMobileToggleButton,
  SidebarMobileToggleIcon,
} from "@/components/elements/sidebar";
import { SidebarProvider } from "@/components/elements/sidebar/provider";
import { ChatsSidebar } from "@/components/sidebars/chats";
import { RecommendationsSidebar } from "@/components/sidebars/recommendations";

export default function ChatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex flex-1 flex-row">
        <ChatsSidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-1 p-4 pt-1 md:pt-4">
          <div className="flex flex-row justify-between">
            <SidebarMobileToggleButton
              className="px-0"
              selector="chats"
              variant="ghost"
            >
              <SidebarMobileToggleIcon className="mr-1" selector="chats" />
              Chats
            </SidebarMobileToggleButton>
            <SidebarMobileToggleButton
              className="px-0"
              selector="recommendations"
              variant="ghost"
            >
              Recommendations
              <SidebarMobileToggleIcon className="ml-1 rotate-180" />
            </SidebarMobileToggleButton>
          </div>
          <div className="h-full">{children}</div>
        </div>

        <RecommendationsSidebar />
      </div>
    </SidebarProvider>
  );
}
