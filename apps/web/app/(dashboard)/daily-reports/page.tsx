"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { IconPlus, IconFileReport, IconDownload, IconUser, IconLoader2 } from "@tabler/icons-react"
import { useReports, useAuth, useEmployees } from "@/hooks/use-data"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"


export default function DailyReportsPage() {
  const { data: reportsData } = useReports()
  const { data: user } = useAuth()
  const { data: employees, isPending: employeesLoading } = useEmployees()
  const REPORTS = reportsData?.reports || []
  const isAdmin = user?.role === "ADMIN"

  const today = new Date().toISOString().split("T")[0]!
  const [reportDate, setReportDate] = useState(today)
  const dateLabel = new Date(reportDate).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  })

  const displayedEmployees = isAdmin
    ? employees
    : employees.filter((emp) => emp.id === user?.employee?.id)

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
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              const { downloadHtmlAsPdf } = await import("@/lib/download-report")
              downloadHtmlAsPdf(`/api/work-log/report?date=${reportDate}`, `work-report-${reportDate}.pdf`)
            }}
            className="flex items-center gap-2 bg-white border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          >
            <IconDownload size={16} />
            Download Report
          </button>
          <motion.button
            className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconPlus size={16} />
            Submit Report
          </motion.button>
        </div>
      </motion.div>

      {/* Employee Cumulative Reports */}
      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-2">
          <IconUser size={18} className="text-[#0A2C72]" />
          <span className="font-semibold text-[#1A202C] text-sm">Employee Work Reports (Full History)</span>
        </div>
        <div className="divide-y divide-[#F3F4F6]">
          {employeesLoading ? (
            <div className="flex items-center justify-center py-10">
              <IconLoader2 size={24} className="animate-spin text-[#22C55E]" />
            </div>
          ) : displayedEmployees.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#6B7280]">No employees found.</p>
          ) : (
            displayedEmployees.map((emp) => (
              <div
                key={emp.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-[#F9FAFB] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-[#22C55E]">
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A202C] text-sm">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {emp.department || "—"} · Joined{" "}
                      {emp.joinedAt
                        ? new Date(emp.joinedAt).toLocaleDateString("en-GB", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    const { downloadHtmlAsPdf } = await import("@/lib/download-report")
                    const name = `${emp.firstName}-${emp.lastName}`.toLowerCase()
                    downloadHtmlAsPdf(`/api/work-log/employee-report?employeeId=${emp.id}`, `work-report-${name}.pdf`)
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#0A2C72] bg-[#F0F4FF] hover:bg-[#E0E8FF] px-3 py-2 rounded-lg transition-colors"
                >
                  <IconDownload size={14} />
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <IconFileReport size={18} className="text-[#22C55E]" />
            <span className="font-semibold text-[#1A202C] text-sm">Daily Reports — {dateLabel}</span>
          </div>
          <input
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
          />
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
