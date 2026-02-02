import type { GenericCtx } from "@convex-dev/better-auth";
import type { DataModel } from "./_generated/dataModel";
import { authComponent } from "./auth";

export function getUser(ctx: GenericCtx<DataModel>) {
  return authComponent.getAuthUser(ctx);
}
