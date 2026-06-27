"use client"

import { motion, AnimatePresence } from "framer-motion"
import {
  IconUsers,
  IconCalendarCheck,
  IconUserX,
  IconBeach,
  IconTicket,
  IconCalendarEvent,
  IconChecklist,
  IconFileReport,
  IconClock,
  IconShieldOff,
  IconActivity,
} from "@tabler/icons-react"
import Link from "next/link"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  progressBar,
} from "@/lib/animation-variants"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

const QUICK_ACTIONS = [
  { label: "Attendance", href: "/attendance", icon: IconCalendarCheck, iconBg: "bg-[#DCFCE7]", iconColor: "text-[#22C55E]" },
  { label: "Leave", href: "/leave-management", icon: IconBeach, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#F59E0B]" },
  { label: "Apply Leave", href: "/leave-management", icon: IconCalendarEvent, iconBg: "bg-[#EFF6FF]", iconColor: "text-[#3B82F6]" },
  { label: "Tasks", href: "/task-management", icon: IconChecklist, iconBg: "bg-[#F5F3FF]", iconColor: "text-[#8B5CF6]" },
  { label: "Daily Report", href: "/daily-reports", icon: IconFileReport, iconBg: "bg-[#EFF6FF]", iconColor: "text-[#3B82F6]" },
  { label: "Hourly Log", href: "/work-log", icon: IconClock, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#F59E0B]" },
  { label: "Calendar", href: "/calendar", icon: IconCalendarEvent, iconBg: "bg-[#DCFCE7]", iconColor: "text-[#22C55E]" },
  { label: "Approvals", href: "/leave-management", icon: IconTicket, iconBg: "bg-[#FEF3C7]", iconColor: "text-[#F59E0B]" },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function formatDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showBlockedBanner, setShowBlockedBanner] = useState(searchParams.get("blocked") === "1")

  useEffect(() => {
    if (showBlockedBanner) {
      // Clear the ?blocked=1 from the URL cleanly
      router.replace("/dashboard")
      const t = setTimeout(() => setShowBlockedBanner(false), 4000)
      return () => clearTimeout(t)
    }
  }, [showBlockedBanner, router])

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats")
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json()
    },
    refetchInterval: 5000,
  })

  const stats = statsData?.data
  const isAdmin = stats?.role === "ADMIN"
  const firstName = stats?.firstName ?? ""

  // Admin top-row stat cards
  const adminStats = [
    {
      label: "Total Employees",
      value: stats?.totalEmployees?.toString() ?? "—",
      badge: "Real-time",
      badgeColor: "bg-[#DCFCE7] text-[#22C55E]",
      icon: IconUsers,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
    },
    {
      label: "Present Today",
      value: stats?.presentToday?.toString() ?? "—",
      badge: "Today",
      badgeColor: "bg-[#DCFCE7] text-[#22C55E]",
      icon: IconCalendarCheck,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
    },
    {
      label: "Absent",
      value: stats?.absent?.toString() ?? "—",
      badge: "Today",
      badgeColor: "bg-[#FEE2E2] text-[#EF4444]",
      icon: IconUserX,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#EF4444]",
    },
    {
      label: "On Leave",
      value: stats?.onLeave?.toString() ?? "—",
      badge: "Today",
      badgeColor: "bg-[#FEF3C7] text-[#F59E0B]",
      icon: IconBeach,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#F59E0B]",
    },
  ]

  // Employee top-row stat cards
  const employeeStats = [
    {
      label: "Working Hours Today",
      value: stats?.workingHoursToday != null ? `${stats.workingHoursToday}h` : "Not clocked in",
      badge: "Live",
      badgeColor: "bg-[#EFF6FF] text-[#3B82F6]",
      icon: IconClock,
      iconBg: "bg-[#EFF6FF]",
      iconColor: "text-[#3B82F6]",
    },
    {
      label: "Tasks Assigned",
      value: stats?.tasksTotal?.toString() ?? "0",
      badge: "Total",
      badgeColor: "bg-[#F5F3FF] text-[#8B5CF6]",
      icon: IconChecklist,
      iconBg: "bg-[#F5F3FF]",
      iconColor: "text-[#8B5CF6]",
    },
    {
      label: "Tasks Completed",
      value: stats?.tasksCompleted?.toString() ?? "0",
      badge: "Done ✓",
      badgeColor: "bg-[#DCFCE7] text-[#22C55E]",
      icon: IconCalendarCheck,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
    },
    {
      label: "Tasks Pending",
      value: stats?.tasksPending?.toString() ?? "0",
      badge: "To-do",
      badgeColor: "bg-[#FEF3C7] text-[#F59E0B]",
      icon: IconUserX,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#F59E0B]",
    },
  ]

  const displayStats = isAdmin ? adminStats : employeeStats

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {showBlockedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center gap-3 bg-[#FEE2E2] border border-[#FECACA] text-[#EF4444] text-sm font-medium px-4 py-3 rounded-xl"
          >
            <IconShieldOff size={18} className="shrink-0" />
            <span>You don&apos;t have permission to access that page.</span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className="flex items-start justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">
            {isLoading
              ? "Loading..."
              : `${getGreeting()}, ${firstName} 👋`
            }
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {isAdmin
              ? "Here's what's happening in your company today."
              : "Here's your personal work summary for today."
            }
          </p>
        </div>
        <motion.div
          className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-3 py-2 bg-white text-sm text-[#6B7280] shadow-sm"
          whileHover={{ scale: 1.02 }}
        >
          <IconCalendarEvent size={16} className="text-[#6B7280]" />
          {formatDate()}
        </motion.div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={staggerContainer}
      >
        {displayStats.map(({ label, value, badge, badgeColor, icon: Icon, iconBg, iconColor }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.08)" }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-shadow cursor-default"
          >
            <div className="flex items-start justify-between mb-4">
              <motion.div
                className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 4 }}
              >
                <Icon size={20} className={iconColor} stroke={1.8} />
              </motion.div>
              <motion.span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.3 }}
              >
                {badge}
              </motion.span>
            </div>
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-3xl font-bold text-[#1A202C]">
              {isLoading ? (
                <span className="animate-pulse bg-gray-200 text-transparent rounded">00</span>
              ) : (
                value
              )}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - same for all */}
        <motion.div
          className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-[#1A202C]">Quick Actions</h2>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-[#22C55E] hover:underline"
            >
              View All
            </Link>
          </div>
          <motion.div
            className="grid grid-cols-4 gap-3"
            variants={staggerContainer}
          >
            {QUICK_ACTIONS.map(({ label, href, icon: Icon, iconBg, iconColor }) => (
              <motion.div key={label} variants={fadeInUp}>
                <Link
                  href={href}
                  className="flex flex-col items-center gap-2.5 p-3 rounded-xl border border-[#E5E7EB] hover:border-[#22C55E]/30 hover:shadow-sm transition-all group block"
                >
                  <motion.div
                    className={`h-11 w-11 rounded-xl ${iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}
                    whileHover={{ scale: 1.12, rotate: 4 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={22} className={iconColor} stroke={1.8} />
                  </motion.div>
                  <span className="text-[11px] font-medium text-[#6B7280] text-center leading-tight">
                    {label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right column — task stats + productivity */}
        <motion.div className="flex flex-col gap-4" variants={staggerContainer}>
          <motion.div
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            variants={slideUp}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#1A202C]">
                {isAdmin ? "Today's Tasks" : "My Tasks"}
              </h2>
              <motion.span
                className="h-6 w-6 rounded-full bg-[#DCFCE7] flex items-center justify-center"
                whileHover={{ rotate: 15 }}
              >
                <IconChecklist size={14} className="text-[#22C55E]" />
              </motion.span>
            </div>
            <motion.p
              className="text-3xl font-bold text-[#1A202C] mb-4"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
            >
              {stats?.tasksTotal ?? 0}
            </motion.p>
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Completed</p>
                <p className="text-xl font-bold text-[#1A202C]">{stats?.tasksCompleted ?? 0}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-[#1A202C]">{stats?.tasksPending ?? 0}</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#22C55E]"
                variants={progressBar}
                custom={stats?.tasksTotal > 0 ? Math.round((stats.tasksCompleted / stats.tasksTotal) * 100) : 0}
                initial="hidden"
                animate="visible"
              />
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            variants={slideUp}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-[#1A202C]">Productivity</h2>
              <motion.span
                className="h-6 w-6 rounded-full bg-[#DCFCE7] flex items-center justify-center"
                whileHover={{ rotate: 15 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
              </motion.span>
            </div>
            <div className="flex items-baseline gap-2">
              <motion.p
                className="text-3xl font-bold text-[#1A202C]"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
              >
                {stats?.productivityScore ?? 0}%
              </motion.p>
              <span className="text-sm font-semibold text-[#22C55E]">
                {stats?.productivityScore >= 75 ? "Great work!" : "Keep going!"}
              </span>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A]"
                variants={progressBar}
                custom={stats?.productivityScore ?? 0}
                initial="hidden"
                animate="visible"
              />
            </div>
          </motion.div>

          {isAdmin && (
            <motion.div
              className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
              variants={slideUp}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-[#1A202C]">Active Employees</h2>
                <motion.span
                  className="h-6 w-6 rounded-full bg-[#DCFCE7] flex items-center justify-center animate-pulse"
                >
                  <IconActivity size={14} className="text-[#22C55E]" />
                </motion.span>
              </div>
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {stats?.activeEmployees?.length > 0 ? (
                  stats.activeEmployees.map((emp: { id: number, name: string, checkIn: string }) => (
                    <div key={emp.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                        <span className="font-medium text-[#374151]">{emp.name}</span>
                      </div>
                      <span className="text-xs text-[#6B7280]">
                        {new Date(emp.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#6B7280] italic">No active employees right now.</p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
