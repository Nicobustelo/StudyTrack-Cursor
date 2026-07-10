import type { NextConfig } from "next";

function resolvePublicAppUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) {
    return productionUrl.startsWith("http")
      ? productionUrl.replace(/\/$/, "")
      : `https://${productionUrl}`;
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }

  return undefined;
}

const publicAppUrl = resolvePublicAppUrl();

const nextConfig: NextConfig = {
  ...(publicAppUrl
    ? {
        env: {
          // Asegura que el cliente use la URL real en Vercel aunque no esté en .env.
          NEXT_PUBLIC_APP_URL: publicAppUrl,
        },
      }
    : {}),
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
