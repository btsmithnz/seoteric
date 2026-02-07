"use client";

import { ChevronDownIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { LogoutMenuItem } from "@/components/elements/logout-button";
import { createSiteDialog } from "@/components/sites/create-site-dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useAuthQuery } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function DashboardNav() {
  const params = useParams<{ site?: string }>();
  const pathname = usePathname();
  const sites = useAuthQuery(api.site.list);

  const siteId = params?.site;
  const currentSite = sites?.find((s) => s._id === siteId);
  const isConfigPage = pathname?.endsWith("/config");

  return (
    <header className="sticky top-0 z-20 w-full border-border border-b bg-background">
      <div className="flex h-dashboard-nav items-center justify-between px-4">
        <Link className="font-semibold text-xl" href="/sites">
          Seoteric
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeSwitcher />
          {siteId && (
            <div className="mr-2 flex items-center gap-1">
              <Button
                className={cn(!isConfigPage && "bg-muted")}
                nativeButton={false}
                render={<Link href={`/sites/${siteId}/chats`} />}
                size="sm"
                variant="ghost"
              >
                Chat
              </Button>
              <Button
                className={cn(isConfigPage && "bg-muted")}
                nativeButton={false}
                render={<Link href={`/sites/${siteId}/config`} />}
                size="sm"
                variant="ghost"
              >
                Config
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button size="sm" variant="outline">
                  <span className="hidden md:block">
                    {currentSite?.name ?? "Sites"}
                  </span>
                  <ChevronDownIcon className="ml-1" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Sites</DropdownMenuLabel>
                {sites?.map((site) => (
                  <DropdownMenuItem
                    key={site._id}
                    render={
                      <Link
                        className="flex flex-col items-start"
                        href={`/sites/${site._id}`}
                      />
                    }
                  >
                    {site.name}
                    <span className="text-muted-foreground">{site.domain}</span>
                  </DropdownMenuItem>
                ))}

                <DialogTrigger
                  handle={createSiteDialog}
                  nativeButton={false}
                  render={<DropdownMenuItem />}
                >
                  <PlusIcon className="mr-1" />
                  New site
                </DialogTrigger>

                <DropdownMenuSeparator />
              </DropdownMenuGroup>

              <DropdownMenuGroup>
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuItem render={<Link href="/account" />}>
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogoutMenuItem />
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
