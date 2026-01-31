"use client";

import Link from "next/link";
import { GlobeIcon, PlusIcon } from "lucide-react";

import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import {
  createSiteDialog,
  CreateSiteDialog,
} from "@/components/sites/create-site-dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { useAuthenticatedQuery } from "@/lib/hooks";

function LoadingState() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card key={i} size="sm" className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-32" />
            <div className="h-3 bg-muted rounded w-24 mt-1" />
          </CardHeader>
        </Card>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <GlobeIcon className="h-10 w-10 text-muted-foreground mb-3" />
      <CardTitle className="mb-1">No sites yet</CardTitle>
      <CardDescription className="mb-4">
        Create your first site to get started
      </CardDescription>
      <CreateSiteDialog
        trigger={
          <Button>
            <PlusIcon className="mr-1" />
            Create site
          </Button>
        }
      />
    </Card>
  );
}

export default function SitesPage() {
  const sites = useAuthenticatedQuery(api.site.list);

  return (
    <div className="p-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Sites</h1>
        <DialogTrigger handle={createSiteDialog} render={<Button size="sm" />}>
          <PlusIcon className="mr-1" />
          New site
        </DialogTrigger>
      </div>

      <div className="grid gap-3">
        {sites === undefined && <LoadingState />}
        {sites?.length === 0 && <EmptyState />}

        {sites?.map((site) => (
          <Card key={site._id} size="sm">
            <CardHeader>
              <CardTitle>{site.name}</CardTitle>
              <CardDescription>{site.domain}</CardDescription>
              <CardAction>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`/sites/${site._id}/chats`} />}
                  nativeButton={false}
                >
                  Open
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
