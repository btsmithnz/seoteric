"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { ChevronDownIcon } from "lucide-react";

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

export function DashboardNav() {
  const params = useParams<{ domain?: string }>();
  const pathname = usePathname();
  const sites = useQuery(api.site.list);

  const domain = params?.domain;
  const currentSite = sites?.find((s) => s.domain === domain);
  const isConfigPage = pathname?.endsWith("/config");

  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-12 items-center justify-between px-4">
        <Link href="/sites" className="text-xl font-semibold">
          Seoteric
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeSwitcher />
          {domain && (
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/sites/${domain}`} />}
                nativeButton={false}
                className={cn(!isConfigPage && "bg-muted")}
              >
                Chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href={`/sites/${domain}/config`} />}
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
