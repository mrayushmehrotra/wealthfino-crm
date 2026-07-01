"use client"

import { motion } from "framer-motion"
import { usePerformance } from "@/hooks/use-data"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
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
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F3F4F6]">
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
  const { data: perfData } = usePerformance()

  const PERFORMANCE: Array<{
    name: string
    role: string
    tasks: number
    completed: number
    attendance: string
    score: number
  }> = perfData?.data || []
  const CHART_DATA = perfData?.chartData || []

  return (
    <motion.div
      className="mx-auto mt-5 max-w-7xl space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-[#1A202C]">Performance</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Team performance metrics and scores
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
        variants={staggerContainer}
      >
        {[
          { label: "Avg Score", value: "85%", color: "text-[#22C55E]" },
          { label: "Tasks Done", value: "78/89", color: "text-[#3B82F6]" },
          { label: "Avg Attendance", value: "88%", color: "text-[#F59E0B]" },
        ].map(({ label, value, color }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="mb-2 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
              {label}
            </p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CHART SECTION */}
      <motion.div
        className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <h2 className="mb-6 text-lg font-bold text-[#1A202C]">
          Tasks Completed Over Time
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={CHART_DATA}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="Tasks Completed"
                stroke="#3B82F6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTasks)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {[
                "Employee",
                "Role",
                "Tasks",
                "Completed",
                "Attendance",
                "Performance Score",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase ${h === "Role" || h === "Attendance" ? "hidden lg:table-cell" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody
            className="divide-y divide-[#F3F4F6]"
            variants={staggerFast}
          >
            {PERFORMANCE.map((row) => (
              <motion.tr
                key={row.name}
                variants={fadeInUp}
                className="transition-colors hover:bg-[#F9FAFB]"
              >
                <td className="px-5 py-4 font-medium text-[#1A202C]">
                  {row.name}
                </td>
                <td className="hidden px-5 py-4 text-[#6B7280] lg:table-cell">
                  {row.role}
                </td>
                <td className="px-5 py-4 text-[#6B7280]">{row.tasks}</td>
                <td className="px-5 py-4 text-[#6B7280]">{row.completed}</td>
                <td className="hidden px-5 py-4 text-[#6B7280] lg:table-cell">
                  {row.attendance}
                </td>
                <td className="w-48 px-5 py-4">
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
