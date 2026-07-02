import type { Metadata } from "next"

function resolveSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"

  return rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
    ? rawUrl
    : `https://${rawUrl}`
}

export const siteUrl = resolveSiteUrl()
export const metadataBase = new URL(siteUrl)

export const companyName = "WealthFino CRM"
export const shortName = "WealthFino"
export const siteDescription =
  "WealthFino CRM is a financial services CRM for employee management, attendance, payroll, leave tracking, performance, reports, announcements, and daily operations."

export const seoKeywords = [
  "WealthFino CRM",
  "financial services CRM",
  "CRM for finance teams",
  "employee management software",
  "attendance tracking",
  "leave management",
  "payroll management",
  "performance management",
  "task management",
  "work log tracking",
  "daily reports",
  "document management",
  "announcements dashboard",
  "internal operations platform",
  "business management software",
]

export const sharedOpenGraph = {
  type: "website" as const,
  locale: "en_IN",
  siteName: companyName,
  title: companyName,
  description: siteDescription,
}

export const sharedTwitter = {
  card: "summary_large_image" as const,
  title: companyName,
  description: siteDescription,
}

export const baseMetadata: Metadata = {
  metadataBase,
  applicationName: companyName,
  title: {
    default: companyName,
    template: `%s | ${companyName}`,
  },
  description: siteDescription,
  keywords: seoKeywords,
  authors: [{ name: companyName }],
  creator: companyName,
  publisher: companyName,
  category: "business",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...sharedOpenGraph,
    url: "/",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: `${companyName} logo`,
      },
    ],
  },
  twitter: sharedTwitter,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: shortName,
  },
  formatDetection: {
    telephone: false,
  },
}

export const privateAreaMetadata: Metadata = {
  metadataBase,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      "max-image-preview": "none",
      "max-snippet": 0,
      "max-video-preview": 0,
    },
  },
}
