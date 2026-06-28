"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { IconBell, IconMessage, IconSearch } from "@tabler/icons-react"
import { staggerContainer, fadeIn } from "@/lib/animation-variants"
import { useQuery } from "@tanstack/react-query"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/leave-management": "Leave Management",
  "/task-management": "Task Management",
  "/daily-reports": "Daily Reports",
  "/work-log": "Work Log",
  "/performance": "Performance",
  "/announcements": "Announcements",
  "/salary-payroll": "Salary & Payroll",
  "/calendar": "Calendar",
  "/documents": "Documents",
  "/reports": "Reports & Analytics",
  "/settings": "Settings",
  "/support": "Help & Support",
}

const notificationVariants = {
  idle: { scale: 1 },
  ring: {
    scale: [1, 1.15, 1, 1.1, 1],
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 4 },
  },
}

const dotVariants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.4, 1],
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 4 },
  },
}

export function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "Dashboard"

  const { data: queryData, isPending, refetch } = useQuery({
    queryKey: ["sidebarProfile"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json()
    },
  })

  const user = queryData?.data
  const fullName = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : (isPending ? "Loading..." : "Admin")
  const initials = user?.employee ? `${user.employee.firstName[0]}${user.employee.lastName[0]}`.toUpperCase() : (isPending ? ".." : "AD")
  const roleDisplay = user?.role || (isPending ? "..." : "admin")

  const todayAttendance = user?.todayAttendance
  const isOnline = todayAttendance && todayAttendance.checkIn && !todayAttendance.checkOut

  const handleToggleStatus = async () => {
    if (!user?.employee?.id) {
      console.warn("Cannot toggle status — no employee record linked to this user")
      return
    }

    const now = new Date().toISOString()
    interface AttendancePayload { employeeId: number; date: string; status: string; checkIn?: string; checkOut?: string | null }
    const payload: AttendancePayload = {
      employeeId: user.employee.id,
      date: new Date().toISOString().split("T")[0]!,
      status: "PRESENT"
    }

    if (isOnline) {
      payload.checkOut = now
    } else {
      payload.checkIn = now
      payload.checkOut = null
    }

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      refetch()
    } catch (err) {
      console.error("Failed to toggle status", err)
    }
  }

  return (
    <motion.header
      className="fixed top-0 right-0 left-[248px] z-40 h-16 bg-white border-b border-[#E5E7EB] flex items-center px-6 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <span className="text-sm font-semibold text-[#1A202C] mr-auto sm:hidden">
        {title}
      </span>

      <motion.div
        className="relative hidden sm:flex flex-1 max-w-sm"
        variants={fadeIn}
      >
        <IconSearch
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
        />
        <motion.input
          type="text"
          placeholder="Search anything..."
          className="w-full pl-9 pr-4 py-2 rounded-full border border-[#E5E7EB] bg-[#F5F7FA] text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
          whileFocus={{ scale: 1.01, backgroundColor: "#FFFFFF" }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

        <div className="ml-auto flex items-center gap-2">
        {user && (
          <motion.button
            onClick={handleToggleStatus}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-colors mr-2 ${
              isOnline 
                ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30" 
                : "bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-[#22C55E] animate-pulse" : "bg-[#9CA3AF]"}`} />
            {isOnline ? "Online" : "Offline"}
          </motion.button>
        )}

        <motion.button
          className="relative h-9 w-9 rounded-full flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
          variants={notificationVariants}
          animate="ring"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconBell size={20} className="text-[#6B7280]" stroke={1.8} />
          <motion.span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444]"
            variants={dotVariants}
            animate="pulse"
          />
        </motion.button>

        <motion.button
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconMessage size={20} className="text-[#6B7280]" stroke={1.8} />
        </motion.button>

        <div className="h-6 w-px bg-[#E5E7EB] mx-1" />

        <motion.div
          className="flex items-center gap-2.5 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="h-8 w-8 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center">
            <span className="text-xs font-bold text-[#22C55E]">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#1A202C] leading-none">
              {fullName}
            </p>
            <p className="text-[11px] text-[#6B7280] mt-0.5 capitalize">{roleDisplay.toLowerCase()}</p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
}
