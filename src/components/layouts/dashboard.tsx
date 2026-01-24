"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { ChevronDownIcon, PlusIcon } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LogoutMenuItem } from "../elements/logout-button";
import { createSiteDialog } from "@/components/sites/create-site-dialog";
import { DialogTrigger } from "../ui/dialog";

export function DashboardNav() {
  const params = useParams<{ site?: string }>();
  const pathname = usePathname();
  const sites = useQuery(api.site.list);

  const siteId = params?.site;
  const currentSite = sites?.find((s) => s._id === siteId);
  const isConfigPage = pathname?.endsWith("/config");

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-12 items-center justify-between px-4">
        <Link href="/sites" className="text-xl font-semibold">
          Seoteric
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeSwitcher />
          {siteId && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/sites/${siteId}/chats`} />}
                nativeButton={false}
                className={cn(!isConfigPage && "bg-muted")}
              >
                Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/sites/${siteId}/config`} />}
                nativeButton={false}
                className={cn(isConfigPage && "bg-muted")}
              >
                Config
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm">
                  {currentSite?.name ?? "Sites"}
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
                  render={<DropdownMenuItem />}
                  nativeButton={false}
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
