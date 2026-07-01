"use client"

import { motion } from "framer-motion"
import { fadeInUp, staggerContainer, slideUp, staggerFast } from "@/lib/animation-variants"
import { useReports } from "@/hooks/use-data"

export default function ReportsPage() {
  const { data: reportsData } = useReports()
  const stats = reportsData?.stats
  const employeeStats = reportsData?.employeeStats || []
  const role = reportsData?.role
  const isAdmin = role === "ADMIN"

  const metrics = [
    { label: "Total Employees", value: String(stats?.totalEmployees ?? "—"), color: "text-[#1A202C]" },
    { label: "Avg Attendance", value: stats ? `${stats.avgAttendance}%` : "—", color: "text-[#22C55E]" },
    { label: "Tasks Completed", value: stats ? `${stats.tasksCompleted}/${stats.tasksTotal}` : "—", color: "text-[#3B82F6]" },
    { label: "Avg Productivity", value: stats ? `${stats.avgProductivity}%` : "—", color: "text-[#8B5CF6]" },
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
        <p className="text-sm text-[#6B7280] mt-1">
          {isAdmin ? "Company-wide performance overview" : "Your performance overview"}
        </p>
      </motion.div>

      <motion.div className="grid grid-cols-2 lg:grid-cols-4 gap-4" variants={staggerContainer}>
        {metrics.map(({ label, value, color }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {isAdmin && employeeStats.length > 0 && (
        <motion.div
          className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
          variants={slideUp}
        >
          <div className="px-5 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-sm font-bold text-[#1A202C]">Employee Performance Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E5E7EB]">
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Employee</th>
                  <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3 hidden lg:table-cell">Department</th>
                  <th className="text-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Attendance</th>
                  <th className="text-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Tasks Done</th>
                  <th className="text-center text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-4 py-3">Productivity</th>
                </tr>
              </thead>
              <motion.tbody className="divide-y divide-[#F3F4F6]" variants={staggerFast}>
                {employeeStats.map((emp, i) => (
                  <motion.tr key={emp.employeeId} variants={fadeInUp} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-5 py-4 font-medium text-[#1A202C]">{emp.name}</td>
                    <td className="px-5 py-4 text-[#6B7280] hidden lg:table-cell">{emp.department || "N/A"}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        emp.attendancePercent >= 80 ? "bg-[#DCFCE7] text-[#22C55E]" :
                        emp.attendancePercent >= 50 ? "bg-[#FEF3C7] text-[#F59E0B]" :
                        "bg-[#FEE2E2] text-[#EF4444]"
                      }`}>
                        {emp.attendancePercent}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-semibold text-[#1A202C]">
                        {emp.tasksCompleted}/{emp.tasksTotal}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-[#F3F4F6] overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${emp.productivity}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            style={{
                              backgroundColor: emp.productivity >= 70 ? "#22C55E" : emp.productivity >= 40 ? "#F59E0B" : "#EF4444",
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#1A202C] w-8 text-right">{emp.productivity}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </motion.div>
      )}

      {!isAdmin && (
        <motion.div className="bg-white rounded-xl border border-[#E5E7EB] p-6 text-center" variants={slideUp}>
          <p className="text-sm text-[#6B7280]">
            {employeeStats.length > 0
              ? `You have completed ${employeeStats[0].tasksCompleted} of ${employeeStats[0].tasksTotal} tasks with ${employeeStats[0].productivity}% productivity.`
              : "No performance data available yet. Start completing tasks to see your stats."}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
