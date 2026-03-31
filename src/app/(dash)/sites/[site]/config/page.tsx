import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { preloadAuthQuery } from "@/lib/auth-server";
import { SiteConfigForm } from "./form";
import { SiteMemoriesForm } from "./memories-form";

export default async function ConfigPage(
  props: PageProps<"/sites/[site]/config">
) {
  const params = await props.params;
  const siteId = params.site as Id<"sites">;

  const [preloadedSite, preloadedMemories] = await Promise.all([
    preloadAuthQuery(api.site.get, { siteId }),
    preloadAuthQuery(api.memories.listBySite, { siteId }),
  ]);

  return (
    <div className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-6 font-semibold text-xl">Site Configuration</h1>
      <SiteConfigForm preloadedSite={preloadedSite} />
      <SiteMemoriesForm preloadedMemories={preloadedMemories} siteId={siteId} />
    </div>
  );
}
