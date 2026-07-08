import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Proxy de PostHog para evitar ad-blockers (spec 41.6).
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Necesario para que el proxy /ingest de PostHog funcione con trailing slashes.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
