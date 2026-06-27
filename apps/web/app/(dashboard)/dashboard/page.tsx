"use client"

import { motion } from "framer-motion"
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
} from "@tabler/icons-react"
import Link from "next/link"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  progressBar,
} from "@/lib/animation-variants"

import { useQuery } from "@tanstack/react-query"

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

function formatDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function DashboardPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats")
      if (!res.ok) throw new Error("Failed to fetch stats")
      return res.json()
    },
  })

  const stats = statsData?.data || {
    totalEmployees: 0,
    presentToday: 0,
    absent: 0,
    onLeave: 0,
  }

  const dynamicStats = [
    {
      label: "Total Employees",
      value: stats.totalEmployees.toString(),
      badge: "Real-time",
      badgeColor: "bg-[#DCFCE7] text-[#22C55E]",
      icon: IconUsers,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
    },
    {
      label: "Present Today",
      value: stats.presentToday.toString(),
      badge: "Tracking Pending",
      badgeColor: "bg-[#DCFCE7] text-[#22C55E]",
      icon: IconCalendarCheck,
      iconBg: "bg-[#DCFCE7]",
      iconColor: "text-[#22C55E]",
    },
    {
      label: "Absent",
      value: stats.absent.toString(),
      badge: "Tracking Pending",
      badgeColor: "bg-[#FEE2E2] text-[#EF4444]",
      icon: IconUserX,
      iconBg: "bg-[#FEE2E2]",
      iconColor: "text-[#EF4444]",
    },
    {
      label: "On Leave",
      value: stats.onLeave.toString(),
      badge: "Tracking Pending",
      badgeColor: "bg-[#FEF3C7] text-[#F59E0B]",
      icon: IconBeach,
      iconBg: "bg-[#FEF3C7]",
      iconColor: "text-[#F59E0B]",
    },
  ]

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-start justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">
            Good morning, Krishna 👋
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Here&apos;s what&apos;s happening in your company today.
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
        {dynamicStats.map(({ label, value, badge, badgeColor, icon: Icon, iconBg, iconColor }) => (
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

        <motion.div className="flex flex-col gap-4" variants={staggerContainer}>
          <motion.div
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            variants={slideUp}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#1A202C]">Today&apos;s Tasks</h2>
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
              12
            </motion.p>
            <div className="flex gap-6">
              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Completed</p>
                <p className="text-xl font-bold text-[#1A202C]">7</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-[#1A202C]">5</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[#22C55E]"
                variants={progressBar}
                custom={58}
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
                92%
              </motion.p>
              <span className="text-sm font-semibold text-[#22C55E]">+4% this week</span>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A]"
                variants={progressBar}
                custom={92}
                initial="hidden"
                animate="visible"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
