import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { polar } from "./polar";

const http = httpRouter();

// Auth
authComponent.registerRoutes(http, createAuth);

// Polar
polar.registerRoutes(http);

export default http;
