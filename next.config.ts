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

export default nextConfig;
