export const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const deploymentUrl = vercelUrl
  ? `https://${vercelUrl}`
  : "http://localhost:3000";
