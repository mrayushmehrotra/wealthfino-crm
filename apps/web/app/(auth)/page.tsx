import type { Metadata } from "next"

import AuthClient from "./auth-client"
import {
  companyName,
  seoKeywords,
  siteDescription,
  shortName,
} from "../seo-metadata"

export const metadata: Metadata = {
  title: "Financial CRM Login and Workforce Management Platform",
  description: siteDescription,
  keywords: seoKeywords,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: companyName,
    description: siteDescription,
    url: "/",
    siteName: companyName,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: companyName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  applicationName: shortName,
}

export default function AuthPage() {
  return <AuthClient />
}
