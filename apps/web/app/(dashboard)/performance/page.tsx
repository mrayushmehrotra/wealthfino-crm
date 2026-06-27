"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
  progressBar,
} from "@/lib/animation-variants"


function ScoreBar({ score }: { score: number }) {
  const color = score >= 90 ? "#22C55E" : score >= 75 ? "#F59E0B" : "#EF4444"
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          variants={progressBar}
          custom={score}
          initial="hidden"
          animate="visible"
          style={{ backgroundColor: color }}
        />
      </div>
      <motion.span
        className="text-xs font-bold"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {score}%
      </motion.span>
    </div>
  )
}

export default function PerformancePage() {
  const { data: queryData, isLoading } = useQuery({
    queryKey: ["PERFORMANCE"],
    queryFn: async () => {
      const res = await fetch("/api/performance")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })
  
  const PERFORMANCE: any[] = queryData?.data || []

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-[#1A202C]">Performance</h1>
        <p className="text-sm text-[#6B7280] mt-1">Team performance metrics and scores</p>
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainer}>
        {[
          { label: "Avg Score", value: "85%", color: "text-[#22C55E]" },
          { label: "Tasks Done", value: "78/89", color: "text-[#3B82F6]" },
          { label: "Avg Attendance", value: "88%", color: "text-[#F59E0B]" },
        ].map(({ label, value, color }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={slideUp}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {["Employee", "Role", "Tasks", "Completed", "Attendance", "Performance Score"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <motion.tbody className="divide-y divide-[#F3F4F6]" variants={staggerFast}>
            {PERFORMANCE.map((row) => (
              <motion.tr
                key={row.name}
                variants={fadeInUp}
                className="hover:bg-[#F9FAFB] transition-colors"
              >
                <td className="px-5 py-4 font-medium text-[#1A202C]">{row.name}</td>
                <td className="px-5 py-4 text-[#6B7280]">{row.role}</td>
                <td className="px-5 py-4 text-[#6B7280]">{row.tasks}</td>
                <td className="px-5 py-4 text-[#6B7280]">{row.completed}</td>
                <td className="px-5 py-4 text-[#6B7280]">{row.attendance}</td>
                <td className="px-5 py-4 w-48">
                  <ScoreBar score={row.score} />
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </motion.div>
    </motion.div>
  )
}
