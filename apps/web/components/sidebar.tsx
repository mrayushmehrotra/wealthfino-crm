"use client"

import logoSrc from "@/app/logo.png"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  IconLayoutDashboard,
  IconUsers,
  IconCalendarCheck,
  IconBeach,
  IconChecklist,
  IconFileReport,
  IconClock,
  IconChartBar,
  IconSpeakerphone,
  IconCash,
  IconCalendar,
  IconFolder,
  IconChartPie,
  IconSettings,
  IconHelp,
  IconBuildingBank,
  IconChevronRight,
} from "@tabler/icons-react"
import { cn } from "@workspace/ui/lib/utils"
import { staggerContainer, fadeInLeft } from "@/lib/animation-variants"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "Access Requests", href: "/access-requests", icon: IconUsers, adminOnly: true },
  { label: "Employees", href: "/employees", icon: IconUsers, adminOnly: true },
  { label: "Attendance", href: "/attendance", icon: IconCalendarCheck },
  { label: "Leave Management", href: "/leave-management", icon: IconBeach },
  { label: "Task Management", href: "/task-management", icon: IconChecklist },
  { label: "Daily Reports", href: "/daily-reports", icon: IconFileReport },
  { label: "Work Log (Hourly)", href: "/work-log", icon: IconClock },
  { label: "Performance", href: "/performance", icon: IconChartBar },
  { label: "Announcements", href: "/announcements", icon: IconSpeakerphone },
  { label: "Salary & Payroll", href: "/salary-payroll", icon: IconCash, adminOnly: true },
  { label: "Calendar", href: "/calendar", icon: IconCalendar },
  { label: "Documents", href: "/documents", icon: IconFolder },
  { label: "Reports & Analytics", href: "/reports", icon: IconChartPie, adminOnly: true },
  { label: "Settings", href: "/settings", icon: IconSettings },
  { label: "Help & Support", href: "/support", icon: IconHelp },
]

export function Sidebar({ role = "EMPLOYEE" }: { role?: "ADMIN" | "MANAGER" | "EMPLOYEE" }) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-[#0D1B2A]">
      <motion.div
        className="flex items-center gap-3 px-6 py-5 border-b border-white/10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="flex h-8 w-8 items-center justify-center rounded-lg "
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, delay: 0.1 }}
        >
          <Image src={logoSrc} alt="WealthFino" width={24} height={24} className="object-contain" />
        </motion.div>
        <div>
          <p className="text-sm font-bold text-white leading-none">WealthFino</p>
          <p className="text-[10px] text-[#B8C4CC] mt-0.5">HR & Productivity</p>
        </div>
      </motion.div>

      <motion.nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {NAV_ITEMS.filter((item) => role === "ADMIN" || !item.adminOnly).map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <motion.div key={href} variants={fadeInLeft}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors group relative overflow-hidden",
                  active
                    ? "text-white"
                    : "text-[#B8C4CC] hover:bg-white/5 hover:text-white"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-[#1A7A4A]"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon
                  size={18}
                  stroke={1.8}
                  className={cn(
                    "shrink-0 z-10 transition-colors",
                    active ? "text-white" : "text-[#8A9BA8] group-hover:text-white"
                  )}
                />
                <span className="flex-1 truncate z-10">{label}</span>
                {active && (
                  <motion.div
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <IconChevronRight size={14} className="text-white/60 shrink-0 z-10" />
                  </motion.div>
                )}
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>

      <motion.div
        className="border-t border-white/10 px-4 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-[#22C55E]">KP</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">Krishna Pathak</p>
            <p className="text-[11px] text-[#8A9BA8]">Admin</p>
          </div>
        </div>
      </motion.div>
    </aside>
  )
}
