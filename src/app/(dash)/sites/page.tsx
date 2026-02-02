"use client";

import { GlobeIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import {
  CreateSiteDialog,
  createSiteDialog,
} from "@/components/sites/create-site-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useAuthenticatedQuery } from "@/lib/hooks";

function LoadingState() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <Card className="animate-pulse" key={i} size="sm">
          <CardHeader>
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="mt-1 h-3 w-24 rounded bg-muted" />
          </CardHeader>
        </Card>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-12 text-center">
      <GlobeIcon className="mb-3 h-10 w-10 text-muted-foreground" />
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
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Sites</h1>
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
                  nativeButton={false}
                  render={<Link href={`/sites/${site._id}/chats`} />}
                  size="sm"
                  variant="outline"
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
