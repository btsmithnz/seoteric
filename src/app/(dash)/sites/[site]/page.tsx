import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { preloadAuthQuery } from "@/lib/auth-server";
import { SiteLanding } from "./landing";

export default async function SitePage(props: PageProps<"/sites/[site]">) {
  const { site: siteId } = await props.params;

  const [preloadedSite, preloadedRecommendations] = await Promise.all([
    preloadAuthQuery(api.site.get, { siteId: siteId as Id<"sites"> }),
    preloadAuthQuery(api.recommendations.listBySite, {
      siteId: siteId as Id<"sites">,
    }),
  ]);

  return (
    <SiteLanding
      preloadedRecommendations={preloadedRecommendations}
      preloadedSite={preloadedSite}
      siteId={siteId as Id<"sites">}
    />
  );
}
