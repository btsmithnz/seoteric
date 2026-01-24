import { GenericCtx } from "@convex-dev/better-auth";
import { authComponent } from "./auth";
import { DataModel } from "./_generated/dataModel";

export async function getUser(ctx: GenericCtx<DataModel>) {
  return authComponent.getAuthUser(ctx);
}
