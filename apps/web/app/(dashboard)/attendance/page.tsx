"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { IconCalendarCheck, IconChevronLeft, IconChevronRight } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"


const STATUS_STYLES: Record<string, string> = {
  Present: "bg-[#DCFCE7] text-[#22C55E]",
  Absent: "bg-[#FEE2E2] text-[#EF4444]",
  "On Leave": "bg-[#FEF3C7] text-[#F59E0B]",
}

export default function AttendancePage() {
  const { data: queryData } = useQuery({
    queryKey: ["ATTENDANCE"],
    queryFn: async () => {
      const res = await fetch("/api/attendance")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })
  
  const stats = queryData?.data?.stats || { present: 0, absent: 0, onLeave: 0 }
  const role = queryData?.data?.role || "ADMIN"
  const ATTENDANCE: { date?: string; employee: { id: number; firstName: string; lastName: string; department: string | null }; attendance: { checkIn: string | null; checkOut: string | null } | null; status: string }[] = queryData?.data?.records || []

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Attendance</h1>
          <p className="text-sm text-[#6B7280] mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            className="h-9 w-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconChevronLeft size={16} className="text-[#6B7280]" />
          </motion.button>
          <motion.button
            className="h-9 w-9 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconChevronRight size={16} className="text-[#6B7280]" />
          </motion.button>
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainer}>
        {[
          { label: "Present", value: stats.present, color: "text-[#22C55E]", bg: "bg-[#DCFCE7]" },
          { label: "Absent", value: stats.absent, color: "text-[#EF4444]", bg: "bg-[#FEE2E2]" },
          { label: "On Leave", value: stats.onLeave, color: "text-[#F59E0B]", bg: "bg-[#FEF3C7]" },
        ].map(({ label, value, color, bg }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              {label}
            </p>
            <motion.p
              className={`text-3xl font-bold ${color}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              {value}
            </motion.p>
            <div className={`mt-3 h-1 rounded-full ${bg}`} />
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={slideUp}
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <IconCalendarCheck size={18} className="text-[#22C55E]" />
          <span className="font-semibold text-[#1A202C] text-sm">
            {role === "EMPLOYEE" ? "My Attendance History" : "Today's Attendance"}
          </span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {[role === "EMPLOYEE" ? "Date" : "Employee", "Check-In", "Check-Out", "Hours", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody className="divide-y divide-[#F3F4F6]" variants={staggerFast}>
            {ATTENDANCE.map((row: any) => {
              const empName = `${row.employee.firstName} ${row.employee.lastName}`
              const checkInTime = row.attendance?.checkIn ? new Date(row.attendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"
              const checkOutTime = row.attendance?.checkOut ? new Date(row.attendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"
              
              let hoursStr = "0h 0m"
              if (row.attendance?.checkIn && row.attendance?.checkOut) {
                const diffMs = new Date(row.attendance.checkOut).getTime() - new Date(row.attendance.checkIn).getTime()
                const diffHrs = Math.floor(diffMs / 3600000)
                const diffMins = Math.floor((diffMs % 3600000) / 60000)
                hoursStr = `${diffHrs}h ${diffMins}m`
              } else if (row.attendance?.checkIn) {
                const diffMs = new Date().getTime() - new Date(row.attendance.checkIn).getTime()
                const diffHrs = Math.floor(diffMs / 3600000)
                const diffMins = Math.floor((diffMs % 3600000) / 60000)
                hoursStr = `${diffHrs}h ${diffMins}m (Active)`
              }

              const statusFormatted = row.status === "PRESENT" ? "Present" : row.status === "ABSENT" ? "Absent" : "On Leave"

              const firstCol = role === "EMPLOYEE" && row.date 
                ? new Date(row.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) 
                : `${row.employee.firstName} ${row.employee.lastName}`

              return (
                <motion.tr
                  key={row.employee.id + (row.date ? row.date : "")}
                  variants={fadeInUp}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-[#1A202C]">{firstCol}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{checkInTime}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{checkOutTime}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{hoursStr}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[statusFormatted] || "bg-[#F3F4F6] text-[#6B7280]"}`}
                    >
                      {statusFormatted}
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
      </motion.div>
    </motion.div>
  )
}
