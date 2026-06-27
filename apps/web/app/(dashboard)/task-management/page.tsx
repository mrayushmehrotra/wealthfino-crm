"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { IconPlus } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"


const STATUS_STYLES: Record<string, string> = {
  "In Progress": "bg-[#EFF6FF] text-[#3B82F6]",
  Todo: "bg-[#F5F3FF] text-[#8B5CF6]",
  Done: "bg-[#DCFCE7] text-[#22C55E]",
}

const PRIORITY_STYLES: Record<string, string> = {
  High: "bg-[#FEE2E2] text-[#EF4444]",
  Medium: "bg-[#FEF3C7] text-[#F59E0B]",
  Low: "bg-[#F3F4F6] text-[#6B7280]",
}

export default function TaskManagementPage() {
  const { data: queryData, isLoading } = useQuery({
    queryKey: ["TASKS"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })
  
  const TASKS: any[] = queryData?.data || []

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Task Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">Track and assign tasks across the team</p>
        </div>
        <motion.button
          className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconPlus size={16} />
          New Task
        </motion.button>
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainer}>
        {[
          { label: "Total", value: 5 },
          { label: "In Progress", value: 2 },
          { label: "Done", value: 1 },
        ].map(({ label, value }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className="text-3xl font-bold text-[#1A202C]">{value}</p>
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
              {["Task", "Assignee", "Due Date", "Priority", "Status"].map((h) => (
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
            {TASKS.map((task) => (
              <motion.tr
                key={task.title}
                variants={fadeInUp}
                className="hover:bg-[#F9FAFB] transition-colors"
              >
                <td className="px-5 py-4 font-medium text-[#1A202C]">{task.title}</td>
                <td className="px-5 py-4 text-[#6B7280]">{task.assignee}</td>
                <td className="px-5 py-4 text-[#6B7280]">{task.due}</td>
                <td className="px-5 py-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLES[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[task.status]}`}
                  >
                    {task.status}
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
