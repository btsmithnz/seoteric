"use client";

import { Loader2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuthPaginatedQuery } from "@/lib/hooks";
import { ChatsListItem, ChatsListItemSkeleton } from "./list-item";

export function ChatsList({ siteId }: { siteId: Id<"sites"> }) {
  const { results, status, loadMore, isLoading } = useAuthPaginatedQuery(
    api.chat.list,
    { siteId },
    { initialNumItems: 50 }
  );

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && status === "CanLoadMore") {
          loadMore(50);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [status, loadMore]);

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {isLoading && [1, 2, 3].map((i) => <ChatsListItemSkeleton key={i} />)}
      {results.map((chat) => (
        <ChatsListItem chat={chat} key={chat._id} siteId={siteId} />
      ))}
      <div className="h-1" ref={sentinelRef} />
      {status === "LoadingMore" && (
        <div className="flex justify-center py-2">
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
