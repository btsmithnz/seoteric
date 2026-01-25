import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { preloadAuthQuery } from "@/lib/auth-server";
import { SiteConfigForm } from "./form";

export default async function ConfigPage(
  props: PageProps<"/sites/[site]/config">
) {
  const params = await props.params;
  const siteId = params.site as Id<"sites">;

  const preloadedSite = await preloadAuthQuery(api.site.get, { siteId });

  return (
    <div className="p-6 w-full max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">Site Configuration</h1>
      <SiteConfigForm preloadedSite={preloadedSite} />
    </div>
  );
}
