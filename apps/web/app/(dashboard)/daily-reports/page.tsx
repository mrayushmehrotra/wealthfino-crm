"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { IconPlus, IconFileReport } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"


export default function DailyReportsPage() {
  const { data: queryData } = useQuery({
    queryKey: ["REPORTS"],
    queryFn: async () => {
      const res = await fetch("/api/reports")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })
  
  const REPORTS: Array<{ id: number; name: string; date: string; tasks: number; hours: number; status: string }> = queryData?.data || []

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Daily Reports</h1>
          <p className="text-sm text-[#6B7280] mt-1">Submit and review daily work reports</p>
        </div>
        <motion.button
          className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconPlus size={16} />
          Submit Report
        </motion.button>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <IconFileReport size={18} className="text-[#22C55E]" />
          <span className="font-semibold text-[#1A202C] text-sm">Reports — 26 June 2026</span>
        </div>
        <motion.div className="divide-y divide-[#F3F4F6]" variants={staggerFast}>
          {REPORTS.map((r) => (
            <motion.div
              key={r.name}
              variants={fadeInUp}
              className="px-5 py-4 hover:bg-[#F9FAFB] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="h-9 w-9 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-xs font-bold text-[#22C55E]">
                      {r.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </motion.div>
                  <div>
                    <p className="font-semibold text-[#1A202C] text-sm">{r.name}</p>
                    <p className="text-xs text-[#9CA3AF] mt-0.5">
                      {r.date} · {r.hours}h logged
                    </p>
                    <p className="text-sm text-[#6B7280] mt-1">{r.summary}</p>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    r.status === "Submitted"
                      ? "bg-[#DCFCE7] text-[#22C55E]"
                      : "bg-[#FEF3C7] text-[#F59E0B]"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
