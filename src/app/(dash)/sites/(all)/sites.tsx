"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { GlobeIcon } from "lucide-react";
import Link from "next/link";
import { CreateSiteDialogTrigger } from "@/components/sites/create-site-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { api } from "@/convex/_generated/api";

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <GlobeIcon className="mb-3 h-10 w-10 text-muted-foreground" />
      <CardTitle className="mb-1">No sites yet</CardTitle>
      <CardDescription className="mb-4">
        Create your first site to get started
      </CardDescription>
      <CreateSiteDialogTrigger />
    </Card>
  );
}

export function Sites({
  preloadedSites,
}: {
  preloadedSites: Preloaded<typeof api.site.list>;
}) {
  const sites = usePreloadedQuery(preloadedSites);

  if (sites.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {sites.map((site) => (
        <Card key={site._id} size="sm">
          <CardHeader>
            <CardTitle>{site.name}</CardTitle>
            <CardDescription>{site.domain}</CardDescription>
            <CardAction>
              <Button
                nativeButton={false}
                render={<Link href={`/sites/${site._id}`} />}
                size="sm"
                variant="outline"
              >
                Open
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </>
  );
}
