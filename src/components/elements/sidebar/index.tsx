"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SidebarSelector, useSidebar } from "./provider";
import { SidebarCloseIcon, SidebarOpenIcon } from "lucide-react";

export { SidebarProvider, type SidebarSelector, useSidebar } from "./provider";

export function SidebarMobileToggleIcon({
  selector,
  className,
}: {
  selector?: SidebarSelector;
  className?: string;
}) {
  const sidebar = useSidebar();
  const { mobileOpen } = sidebar.pick(selector ?? "default");

  const Icon = mobileOpen ? SidebarCloseIcon : SidebarOpenIcon;

  return <Icon className={cn("size-4", className)} />;
}

export function SidebarMobileToggleButton({
  children,
  className,
  selector,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: SidebarSelector;
  variant?: ButtonProps["variant"];
}) {
  const sidebar = useSidebar();
  const { setMobileOpen } = sidebar.pick(selector);

  return (
    <Button
      className={cn("md:hidden", className)}
      variant={variant}
      onClick={() => setMobileOpen((open) => !open)}
    >
      {children}
    </Button>
  );
}

export function Sidebar({
  children,
  className,
  side,
  selector,
}: {
  children: React.ReactNode;
  className?: string;
  side: "right" | "left";
  selector?: SidebarSelector;
}) {
  const sidebar = useSidebar();
  const { mobileOpen } = sidebar.pick(selector);

  return (
    <div
      className={cn(
        "fixed md:sticky md:block flex flex-col top-[calc(var(--spacing-dashboard-nav)+1px)] h-[calc(100vh-var(--spacing-dashboard-nav))] w-full z-10 md:w-64 border-border bg-background overflow-y-auto",
        side === "right" ? "right-0 border-l" : "left-0 border-r",
        !mobileOpen && "hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
