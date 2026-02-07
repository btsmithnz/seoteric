import { api } from "@/convex/_generated/api";
import { preloadAuthQuery } from "@/lib/auth-server";
import { Sites } from "./sites";

export default async function SitesPage() {
  const preloadedSites = await preloadAuthQuery(api.site.list);

  return <Sites preloadedSites={preloadedSites} />;
}
