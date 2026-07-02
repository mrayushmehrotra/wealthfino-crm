import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { PageTransition } from "@/components/page-transition"
import { PushNotificationBootstrap } from "@/components/push-notification-bootstrap"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { privateAreaMetadata } from "../seo-metadata"

export const metadata = privateAreaMetadata

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Sidebar role={user.role} />
      <Topbar />
      <main className="ml-0 min-h-screen pt-16 md:ml-[248px]">
        <div className="p-4 sm:p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <PushNotificationBootstrap />
    </div>
  )
}
