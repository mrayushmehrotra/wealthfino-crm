import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, DM_Sans } from "next/font/google"
import { Toaster } from "sonner"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import QueryProvider from "@/providers/query-provider"
import JotaiProvider from "@/providers/jotai-provider"
import { baseMetadata } from "./seo-metadata"

const geistHeading = Geist({ subsets: ["latin"], variable: "--font-heading" })

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = baseMetadata

export const viewport: Viewport = {
  themeColor: "#1A202C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        dmSans.variable,
        geistHeading.variable
      )}
    >
      <body>
        <JotaiProvider>
          <QueryProvider>
            <ThemeProvider>{children}</ThemeProvider>
            <Toaster position="top-center" richColors />
          </QueryProvider>
        </JotaiProvider>
      </body>
    </html>
  )
}
