import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
