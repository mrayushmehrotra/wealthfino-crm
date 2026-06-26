"use client"

import { motion } from "framer-motion"
import { fadeInUp, staggerContainer, slideUp, progressBar } from "@/lib/animation-variants"

export default function ReportsPage() {
  const metrics = [
    { label: "Total Employees", value: 12, change: "+2", up: true },
    { label: "Avg Attendance", value: "88%", change: "+3%", up: true },
    { label: "Tasks Completed", value: "78/89", change: "-5", up: false },
    { label: "Avg Productivity", value: "92%", change: "+4%", up: true },
  ]

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-[#1A202C]">Reports & Analytics</h1>
        <p className="text-sm text-[#6B7280] mt-1">Company performance overview — June 2026</p>
      </motion.div>

      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer}>
        {metrics.map(({ label, value, change, up }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className="text-2xl font-bold text-[#1A202C]">{value}</p>
            <p
              className={`text-xs font-semibold mt-1 ${up ? "text-[#22C55E]" : "text-[#EF4444]"}`}
            >
              {change} this month
            </p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {["Attendance Trend", "Task Completion"].map((title) => (
          <motion.div
            key={title}
            variants={fadeInUp}
            className="bg-white rounded-xl border border-[#E5E7EB] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <h3 className="font-semibold text-[#1A202C] mb-4">{title}</h3>
            <div className="flex items-end gap-2 h-32">
              {[65, 80, 75, 90, 85, 88, 92].map((val, i) => (
                <motion.div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.4 }}
                >
                  <motion.div
                    className="w-full rounded-t-sm bg-[#22C55E]/80"
                    initial={{ height: 0 }}
                    animate={{ height: `${val}%` }}
                    transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                  />
                  <span className="text-[9px] text-[#9CA3AF]">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
