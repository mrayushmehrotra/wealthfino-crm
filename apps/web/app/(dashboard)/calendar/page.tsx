"use client"

import { useMemo } from "react"
import { useAtom } from "jotai"
import { calendarMonthState, calendarYearState, calendarSelectedEmployeeIdState, calendarSelectedDayState } from "@/store/atoms"
import { motion } from "framer-motion"
import { fadeInUp, staggerContainer, slideUp } from "@/lib/animation-variants"
import { useAuth, useCalendarData } from "@/hooks/use-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function getDayColor(total: number, completed: number): { bg: string; text: string; label: string } | null {
  if (total === 0) return null
  const incomplete = total - completed
  const ratio = incomplete / total
  if (completed === total) return { bg: "bg-[#DCFCE7]", text: "text-[#22C55E]", label: "All done" }
  if (ratio > 0.7) return { bg: "bg-[#FEE2E2]", text: "text-[#EF4444]", label: `${incomplete} pending` }
  return { bg: "bg-[#FEF3C7]", text: "text-[#F59E0B]", label: `${completed}/${total} done` }
}

export default function CalendarPage() {
  const now = new Date()
  const [month, setMonth] = useAtom(calendarMonthState)
  const [year, setYear] = useAtom(calendarYearState)
  const [selectedEmployeeId, setSelectedEmployeeId] = useAtom(calendarSelectedEmployeeIdState)
  const [selectedDay, setSelectedDay] = useAtom(calendarSelectedDayState)

  const { data: user } = useAuth()
  const role = user?.role

  const { data: calendarData } = useCalendarData(month, year, selectedEmployeeId, role)
  const daysData: Record<string, { total: number; completed: number; tasks: Array<{ id: number; title: string; status: string; priority: string }> }> = calendarData?.days || {}
  const employees: Array<{ id: number; firstName: string; lastName: string; department: string | null }> = calendarData?.employees || []

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const cells = useMemo(
    () => Array.from({ length: offset + daysInMonth }, (_, i) =>
      i < offset ? null : i - offset + 1
    ),
    [offset, daysInMonth]
  )

  const isAdmin = role === "ADMIN"

  const selectedDateTasks = selectedDay ? daysData[String(selectedDay)]?.tasks || [] : []

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1) }
    else setMonth((m) => m - 1)
  }
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1) }
    else setMonth((m) => m + 1)
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Calendar</h1>
          <p className="text-sm text-[#6B7280] mt-1">Employee task completion log</p>
        </div>
        {isAdmin && (
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-sm font-medium text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/30"
          >
            <option value="">Select an employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName} {emp.department ? `(${emp.department})` : ""}
              </option>
            ))}
          </select>
        )}
      </motion.div>

      {isAdmin && !selectedEmployeeId && (
        <motion.div
          variants={fadeInUp}
          className="bg-[#FEF3C7] text-[#F59E0B] p-4 rounded-xl text-sm font-medium text-center"
        >
          Select an employee above to view their monthly task log
        </motion.div>
      )}

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={slideUp}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <motion.button
            onClick={prev}
            className="h-8 w-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F5F7FA] transition-colors text-[#6B7280] text-sm font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ‹
          </motion.button>
          <h2 className="font-semibold text-[#1A202C]">
            {MONTHS[month]} {year}
          </h2>
          <motion.button
            onClick={next}
            className="h-8 w-8 rounded-lg border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F5F7FA] transition-colors text-[#6B7280] text-sm font-bold"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ›
          </motion.button>
        </div>

        <div className="grid grid-cols-7 border-b border-[#E5E7EB]">
          {DAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[11px] font-semibold text-[#9CA3AF] uppercase py-3"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[90px] border-r border-b border-[#F3F4F6]" />
            }

            const dayStr = String(day)
            const dayInfo = daysData[dayStr]
            const color = dayInfo ? getDayColor(dayInfo.total, dayInfo.completed) : null
            const isToday =
              day === now.getDate() &&
              month === now.getMonth() &&
              year === now.getFullYear()

            return (
              <motion.button
                key={`${month}-${year}-${day}`}
                onClick={() => dayInfo && setSelectedDay(day)}
                disabled={!dayInfo}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.005 }}
                className={`relative min-h-[90px] p-2 border-r border-b border-[#F3F4F6] transition-colors flex flex-col ${
                  color ? color.bg + " hover:brightness-95" : "hover:bg-[#F9FAFB]"
                } ${dayInfo ? "cursor-pointer" : ""}`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-semibold mb-1 shrink-0 ${
                    isToday
                      ? "bg-[#22C55E] text-white"
                      : "text-[#1A202C]"
                  }`}
                >
                  {day}
                </div>
                {dayInfo && (
                  <div className="mt-auto space-y-0.5">
                    <span className={`text-[10px] font-bold block ${color?.text || "text-[#6B7280]"}`}>
                      {dayInfo.total} task{dayInfo.total !== 1 ? "s" : ""}
                    </span>
                    {color && (
                      <span className={`text-[9px] font-semibold block ${color.text} opacity-80`}>
                        {color.label}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      <Dialog open={selectedDay !== null} onOpenChange={(open) => { if (!open) setSelectedDay(null) }}>
        <DialogContent className="sm:max-w-[450px] bg-white border border-[#E5E7EB] p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-lg font-bold text-[#1A202C]">
              Tasks for {MONTHS[month]} {selectedDay}, {year}
            </DialogTitle>
          </DialogHeader>
          {selectedDateTasks.length === 0 ? (
            <p className="text-sm text-[#6B7280] text-center py-6">No tasks for this day.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {selectedDateTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm font-semibold text-[#1A202C] truncate">{task.title}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      task.status === "DONE" ? "bg-[#DCFCE7] text-[#22C55E]" :
                      task.status === "IN_PROGRESS" ? "bg-[#FEF3C7] text-[#F59E0B]" :
                      "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      {task.status === "IN_PROGRESS" ? "In Progress" : task.status}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      task.priority === "HIGH" ? "bg-[#FEE2E2] text-[#EF4444]" :
                      task.priority === "MEDIUM" ? "bg-[#FEF3C7] text-[#F59E0B]" :
                      "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
