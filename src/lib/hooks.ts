import { useConvexAuth, useQuery } from "convex/react";
import { FunctionReference } from "convex/server";

export function useAuthenticatedQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: Query["_args"] | "skip"
): Query["_returnType"] | undefined {
  const { isLoading } = useConvexAuth();
  return useQuery(query, isLoading ? "skip" : args);
}
