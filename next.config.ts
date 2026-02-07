import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/sites/:site",
        destination: "/sites/:site/chats",
        permanent: false,
      },
    ];
  },
};

export default withBotId(nextConfig);
