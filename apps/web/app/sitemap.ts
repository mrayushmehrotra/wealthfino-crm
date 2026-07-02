import type { MetadataRoute } from "next"

import { siteUrl } from "./seo-metadata"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL("/", siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ]
}
