"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import {
  IconCalendarCheck,
  IconChevronLeft,
  IconChevronRight,
  IconLogin,
  IconLogout,
} from "@tabler/icons-react"
import { useAttendance, useAuth } from "@/hooks/use-data"
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

function ConfirmModal({
  open,
  type,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean
  type: "check-in" | "check-out"
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-[90%] max-w-sm p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  type === "check-in" ? "bg-[#DCFCE7]" : "bg-[#FEE2E2]"
                }`}
              >
                {type === "check-in" ? (
                  <IconLogin size={20} className="text-[#22C55E]" />
                ) : (
                  <IconLogout size={20} className="text-[#EF4444]" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A202C]">
                  Confirm {type === "check-in" ? "Check-In" : "Check-Out"}
                </h3>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  Are you sure you want to {type === "check-in" ? "check in" : "check out"} for today?
                </p>
              </div>
            </div>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              {type === "check-in"
                ? "Your attendance will be recorded with the current time. You can check out at the end of the day."
                : "Your check-out time will be recorded. Make sure you have completed your work for the day."}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-[#6B7280] bg-[#F3F4F6] rounded-lg hover:bg-[#E5E7EB] transition-colors disabled:opacity-50"
              >
                No
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
                  type === "check-in"
                    ? "bg-[#22C55E] hover:bg-[#16A34A]"
                    : "bg-[#EF4444] hover:bg-[#DC2626]"
                }`}
              >
                {loading ? "Processing..." : "Yes"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function AttendancePage() {
  const { data: attendanceData, refetch } = useAttendance()
  const { data:user } = useAuth()
  const stats = attendanceData?.stats || { present: 0, absent: 0, onLeave: 0 }
  const role = attendanceData?.role || "ADMIN"
  const ATTENDANCE: { date?: string; employee: { id: number; firstName: string; lastName: string; department: string | null }; attendance: { checkIn: string | null; checkOut: string | null } | null; status: string }[] = attendanceData?.records || []
  const hasCheckedIn = !!user?.todayAttendance?.checkIn
  const hasCheckedOut = !!user?.todayAttendance?.checkOut

  const [modalType, setModalType] = useState<"check-in" | "check-out" | null>(null)
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    if (!user?.employee?.id || !modalType) return
    setLoading(true)
    const now = new Date().toISOString()
    const payload = {
      employeeId: user.employee.id,
      date: now.split("T")[0],
      ...(modalType === "check-in"
        ? { status: "PRESENT", checkIn: now, checkOut: null }
        : { checkOut: now }),
    }
    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      await refetch()
      setModalType(null)
    } catch (err) {
      console.error("Failed to record attendance", err)
    } finally {
      setLoading(false)
    }
  }

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
      <ConfirmModal
        open={modalType === "check-in"}
        type="check-in"
        onConfirm={handleConfirm}
        onCancel={() => setModalType(null)}
        loading={loading}
      />
      <ConfirmModal
        open={modalType === "check-out"}
        type="check-out"
        onConfirm={handleConfirm}
        onCancel={() => setModalType(null)}
        loading={loading}
      />

      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Attendance</h1>
          <p className="text-sm text-[#6B7280] mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* <motion.button
            onClick={() => !hasCheckedIn && !hasCheckedOut && setModalType("check-in")}
            disabled={hasCheckedIn || hasCheckedOut}
            className={`h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              hasCheckedIn || hasCheckedOut
                ? "bg-[#DCFCE7] text-[#22C55E] cursor-not-allowed"
                : "bg-[#22C55E] text-white hover:bg-[#16A34A]"
            }`}
            whileHover={!hasCheckedIn && !hasCheckedOut ? { scale: 1.03 } : {}}
            whileTap={!hasCheckedIn && !hasCheckedOut ? { scale: 0.97 } : {}}
          >
            <IconLogin size={16} />
            {hasCheckedIn || hasCheckedOut ? "Checked In ✓" : "Check-In"}
          </motion.button>
          <motion.button
            onClick={() => !hasCheckedOut && hasCheckedIn && setModalType("check-out")}
            disabled={hasCheckedOut || !hasCheckedIn}
            className={`h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
              hasCheckedOut || !hasCheckedIn
                ? "bg-[#FEE2E2] text-[#EF4444] cursor-not-allowed"
                : "bg-[#EF4444] text-white hover:bg-[#DC2626]"
            }`}
            whileHover={!hasCheckedOut && hasCheckedIn ? { scale: 1.03 } : {}}
            whileTap={!hasCheckedOut && hasCheckedIn ? { scale: 0.97 } : {}}
          >
            <IconLogout size={16} />
            {hasCheckedOut ? "Checked Out ✓" : "Checkasd-Out"}
          </motion.button> */}
        </div>
      </motion.div>

      <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" variants={staggerContainer}>
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
                  className={`text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3 ${(h === "Check-Out" || h === "Hours") ? "hidden sm:table-cell" : ""}`}
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
                  <td className="px-5 py-4 text-[#6B7280] hidden sm:table-cell">{checkOutTime}</td>
                  <td className="px-5 py-4 text-[#6B7280] hidden sm:table-cell">{hoursStr}</td>
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
