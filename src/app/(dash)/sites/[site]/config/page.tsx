import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { preloadAuthQuery } from "@/lib/auth-server";
import { SiteConfigForm } from "./form";

export default async function ConfigPage(
  props: PageProps<"/sites/[site]/config">
) {
  const params = await props.params;
  const siteId = params.site as Id<"sites">;

  const preloadedSite = await preloadAuthQuery(api.site.get, { siteId });

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 font-semibold text-xl">Site Configuration</h1>
      <SiteConfigForm preloadedSite={preloadedSite} />
    </div>
  );
}
