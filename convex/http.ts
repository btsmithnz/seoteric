import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { seoChat } from "./chat";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Auth
authComponent.registerRoutes(http, createAuth);

// Chat: SEO
http.route({
  path: "/chat/seo",
  method: "POST",
  handler: seoChat,
});

http.route({
  path: "/chat/seo",
  method: "OPTIONS",
  handler: httpAction(async (_, request) => {
    // Make sure the necessary headers are present
    // for this to be a valid pre-flight request
    const headers = request.headers;
    if (
      headers.get("Origin") !== null &&
      headers.get("Access-Control-Request-Method") !== null &&
      headers.get("Access-Control-Request-Headers") !== null
    ) {
      return new Response(null, {
        headers: new Headers({
          "Access-Control-Allow-Origin": process.env.SITE_URL!,
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type, Digest",
          "Access-Control-Max-Age": "86400",
        }),
      });
    } else {
      return new Response();
    }
  }),
});

export default http;
