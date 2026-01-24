import { NextRequest } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";
import z from "zod";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const data = z
    .object({
      name: z.string(),
      domain: z.string(),
    })
    .parse({
      name: searchParams.get("name") ?? "",
      domain: searchParams.get("domain") ?? "",
    });

  const siteId = await fetchAuthMutation(api.site.create, data);

  return redirect(`/sites/${siteId}/chats`);
}
