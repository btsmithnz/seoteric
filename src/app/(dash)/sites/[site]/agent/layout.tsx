import {
  SidebarMobileToggleButton,
  SidebarMobileToggleIcon,
} from "@/components/elements/sidebar";
import { SidebarProvider } from "@/components/elements/sidebar/provider";
import { RecommendationsSidebar } from "@/components/sidebars/recommendations";

export default async function AgentLayout(
  props: LayoutProps<"/sites/[site]/agent">
) {
  return (
    <SidebarProvider>
      <div className="flex flex-1 flex-row md:bg-muted/40">
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-4 pt-1 md:pt-4">
          <div className="flex flex-row justify-end">
            <SidebarMobileToggleButton
              className="px-0"
              selector="recommendations"
              variant="ghost"
            >
              Recommendations
              <SidebarMobileToggleIcon className="ml-1 rotate-180" />
            </SidebarMobileToggleButton>
          </div>
          <div className="h-full">{props.children}</div>
        </div>

        <RecommendationsSidebar />
      </div>
    </SidebarProvider>
  );
}
