"use client"

import { motion } from "framer-motion"
import { IconPlus } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"

const LOGS = [
  { name: "Krishna Pathak", date: "26 Jun", task: "Q2 Review meeting", start: "09:00", end: "11:00", hours: 2 },
  { name: "Krishna Pathak", date: "26 Jun", task: "Client calls", start: "11:30", end: "13:00", hours: 1.5 },
  { name: "Priya Sharma", date: "26 Jun", task: "Dashboard UI", start: "09:00", end: "13:00", hours: 4 },
  { name: "Priya Sharma", date: "26 Jun", task: "Code review", start: "14:00", end: "16:00", hours: 2 },
  { name: "Deepak Kumar", date: "26 Jun", task: "Bug fixes", start: "09:30", end: "18:30", hours: 9 },
]

export default function WorkLogPage() {
  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Work Log (Hourly)</h1>
          <p className="text-sm text-[#6B7280] mt-1">Track time spent on tasks hourly</p>
        </div>
        <motion.button
          className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconPlus size={16} />
          Log Time
        </motion.button>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={slideUp}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {["Employee", "Date", "Task", "Start", "End", "Hours"].map((h) => (
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
            {LOGS.map((log, i) => (
              <motion.tr
                key={i}
                variants={fadeInUp}
                className="hover:bg-[#F9FAFB] transition-colors"
              >
                <td className="px-5 py-4 font-medium text-[#1A202C]">{log.name}</td>
                <td className="px-5 py-4 text-[#6B7280]">{log.date}</td>
                <td className="px-5 py-4 text-[#6B7280]">{log.task}</td>
                <td className="px-5 py-4 text-[#6B7280]">{log.start}</td>
                <td className="px-5 py-4 text-[#6B7280]">{log.end}</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-semibold bg-[#EFF6FF] text-[#3B82F6] px-2.5 py-1 rounded-full">
                    {log.hours}h
                  </span>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </motion.div>
    </motion.div>
  )
}
