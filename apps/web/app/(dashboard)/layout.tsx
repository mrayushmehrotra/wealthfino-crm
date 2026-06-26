import { Sidebar } from "@/components/sidebar"
import { Topbar } from "@/components/topbar"
import { PageTransition } from "@/components/page-transition"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <Sidebar />
      <Topbar />
      <main className="ml-[248px] pt-16 min-h-screen">
        <div className="p-6">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  )
}
