"use client";

import { SidebarCloseIcon, SidebarOpenIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type SidebarSelector, useSidebar } from "./provider";

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
  size,
  variant,
}: {
  children: React.ReactNode;
  className?: string;
  selector?: SidebarSelector;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}) {
  const sidebar = useSidebar();
  const { setMobileOpen } = sidebar.pick(selector);

  return (
    <Button
      className={cn("md:hidden", className)}
      onClick={() => setMobileOpen((open) => !open)}
      size={size}
      variant={variant}
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
        "fixed top-[calc(var(--spacing-dashboard-nav)+1px)] z-10 h-[calc(100vh-var(--spacing-dashboard-nav))] w-full overflow-y-auto bg-background md:sticky md:block md:w-64",
        "md:mx-2 md:my-2 md:h-[calc(100vh-var(--spacing-dashboard-nav)-1rem)] md:rounded-xl md:border md:border-border md:shadow-sm",
        side === "right" ? "right-0" : "left-0",
        !mobileOpen && "hidden",
        className
      )}
    >
      {children}
    </div>
  );
}
