"use client";

import { useEffect, useRef } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ChatListItem } from "./list-item";
import { Loader2Icon } from "lucide-react";

export function ChatList({ siteId }: { siteId: Id<"sites"> }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.chat.list,
    { siteId },
    { initialNumItems: 50 }
  );

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

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
      {results.map((chat) => (
        <ChatListItem key={chat._id} chat={chat} siteId={siteId} />
      ))}
      <div ref={sentinelRef} className="h-1" />
      {status === "LoadingMore" && (
        <div className="flex justify-center py-2">
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
