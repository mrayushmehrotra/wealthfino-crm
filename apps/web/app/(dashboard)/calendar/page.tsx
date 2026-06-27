"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { fadeInUp, staggerContainer, slideUp } from "@/lib/animation-variants"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]


export default function CalendarPage() {
  const { data: queryData } = useQuery({
    queryKey: ["EVENTS"],
    queryFn: async () => {
      const res = await fetch("/api/calendar")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })
  
  const EVENTS: Record<string, unknown>[] = queryData?.data || []

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear] = useState(now.getFullYear())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const cells = Array.from({ length: offset + daysInMonth }, (_, i) =>
    i < offset ? null : i - offset + 1
  )

  const prev = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else {
      setMonth((m) => m - 1)
    }
  }
  const next = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-[#1A202C]">Calendar</h1>
        <p className="text-sm text-[#6B7280] mt-1">Company events and holidays</p>
      </motion.div>

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
          <AnimatePresence mode="popLayout">
            {cells.map((day, i) => {
              const isToday =
                day === now.getDate() &&
                month === now.getMonth() &&
                year === now.getFullYear()
              const event = EVENTS.find((e) => e.day === day)
              return (
                <motion.div
                  key={`${month}-${year}-${i}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.005 }}
                  className={`min-h-[80px] p-2 border-r border-b border-[#F3F4F6] ${
                    day ? "hover:bg-[#F9FAFB]" : ""
                  } transition-colors`}
                >
                  {day && (
                    <>
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-semibold mb-1 ${
                          isToday
                            ? "bg-[#22C55E] text-white"
                            : "text-[#1A202C]"
                        }`}
                      >
                        {day}
                      </div>
                      {event && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${event.color} block truncate`}
                        >
                          {event.title}
                        </span>
                      )}
                    </>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
