import type { MetadataRoute } from "next"

import { siteUrl } from "./seo-metadata"

const privatePaths = [
  "/dashboard",
  "/access-requests",
  "/support",
  "/settings",
  "/reports",
  "/documents",
  "/calendar",
  "/salary-payroll",
  "/employees",
  "/task-management",
  "/leave-management",
  "/attendance",
  "/work-log",
  "/performance",
  "/daily-reports",
  "/announcements",
  "/api",
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privatePaths,
      },
    ],
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
  }
}
