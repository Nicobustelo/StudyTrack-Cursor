import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl();

  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
