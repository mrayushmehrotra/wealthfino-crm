import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { PageTransition } from "@/components/page-transition"
import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"

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
      <main className="ml-[248px] pt-16 min-h-screen">
        <div className="p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}
