"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type SidebarSelector = string;

interface SidebarState {
  mobileOpen: boolean;
}

type MobileOpen = boolean | ((open: boolean) => boolean);
type SetMobileOpen = (open: MobileOpen) => void;

interface SidebarActions {
  setMobileOpen: SetMobileOpen;
}

interface SidebarContextValue {
  pick: (selector?: SidebarSelector) => SidebarState & SidebarActions;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Record<SidebarSelector, SidebarState>>({});

  const setMobileOpen = useCallback(
    (selector: SidebarSelector, open: MobileOpen) => {
      const func = typeof open === "function" ? open : () => open;

      setState((prev) => ({
        ...prev,
        [selector]: {
          mobileOpen: func(prev[selector]?.mobileOpen ?? false),
        },
      }));
    },
    [],
  );

  const pick = useCallback(
    (selector: SidebarSelector = "default") => {
      return {
        mobileOpen: state[selector]?.mobileOpen ?? false,
        setMobileOpen: (open: MobileOpen) => {
          setMobileOpen(selector, open);
        },
      };
    },
    [state, setMobileOpen],
  );

  return (
    <SidebarContext.Provider value={{ pick }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return ctx;
}
