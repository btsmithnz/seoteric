import {
  type PaginatedQueryArgs,
  type PaginatedQueryReference,
  type UsePaginatedQueryReturnType,
  useConvexAuth,
  usePaginatedQuery,
  useQuery,
} from "convex/react";
import type { FunctionReference } from "convex/server";

export function useAuthQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: Query["_args"] | "skip"
): Query["_returnType"] | undefined {
  const { isLoading } = useConvexAuth();
  return useQuery(query, isLoading ? "skip" : args);
}

export function useAuthPaginatedQuery<Query extends PaginatedQueryReference>(
  query: Query,
  args: PaginatedQueryArgs<Query>,
  options: { initialNumItems: number }
): UsePaginatedQueryReturnType<Query> {
  const { isLoading } = useConvexAuth();
  return usePaginatedQuery(query, isLoading ? "skip" : args, options);
}
