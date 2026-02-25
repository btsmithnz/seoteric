import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import z from "zod";
import { api } from "@/convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const data = z
    .object({
      name: z.string(),
      domain: z.string(),
      country: z.string(),
      industry: z.string(),
      location: z.string().optional(),
      latitude: z.coerce.number().optional(),
      longitude: z.coerce.number().optional(),
    })
    .parse({
      name: searchParams.get("name") ?? "",
      domain: searchParams.get("domain") ?? "",
      country: searchParams.get("country") ?? "",
      industry: searchParams.get("industry") ?? "",
      location: searchParams.get("location") ?? undefined,
      latitude: searchParams.get("latitude") ?? undefined,
      longitude: searchParams.get("longitude") ?? undefined,
    });

  const siteId = await fetchAuthMutation(api.site.create, data);

  return redirect(`/sites/${siteId}/chats`);
}
