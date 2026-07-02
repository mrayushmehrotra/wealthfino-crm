"use client"

import { motion } from "framer-motion"
import { useSetAtom } from "jotai"
import { employeeDetailIdAtom } from "@/store/atoms"
import { useEmployeeDetail } from "@/hooks/use-data"
import { EmployeeLoadingState } from "@/components/employee-loading-state"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import {
  IconArrowLeft,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconCalendar,
  IconChecklist,
  IconUserCheck,
  IconBuildingBank,
  IconCashBanknote,
  IconFileReport,
  IconChartLine,
} from "@tabler/icons-react"
import { fadeInUp, staggerContainer, slideUp } from "@/lib/animation-variants"

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const setEmployeeDetailId = useSetAtom(employeeDetailIdAtom)

  useEffect(() => {
    setEmployeeDetailId(Number(employeeId))
  }, [employeeId, setEmployeeDetailId])

  const { data: emp, isPending: isLoading, error } = useEmployeeDetail()

  if (isLoading) {
    return <EmployeeLoadingState label="Loading employee profile..." />
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="rounded-xl bg-[#FEE2E2] p-4 font-medium text-[#EF4444]">
          {error instanceof Error ? error.message : "Failed to load employee"}
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-[#22C55E] hover:underline"
        >
          Go back
        </button>
      </div>
    )
  }

  if (!emp) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="rounded-xl bg-[#FEE2E2] p-4 font-medium text-[#EF4444]">
          Employee not found.
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm font-semibold text-[#22C55E] hover:underline"
        >
          Go back
        </button>
      </div>
    )
  }

  const initials = `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`

  return (
    <motion.div
      className="mx-auto max-w-6xl space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-[#6B7280] transition-colors hover:text-[#1A202C]"
        variants={fadeInUp}
        whileHover={{ x: -2 }}
      >
        <IconArrowLeft size={16} />
        Back to Employees
      </motion.button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Sidebar */}
        <motion.div
          className="relative flex flex-col items-center overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-6 lg:col-span-1 lg:p-8"
          variants={slideUp}
        >
          <div className="absolute top-0 left-0 z-0 h-32 w-full bg-gradient-to-br from-[#22C55E]/10 to-[#16A34A]/5" />

          <motion.div
            className="relative z-10 mt-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white shadow-md"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] opacity-10" />
            <span className="bg-gradient-to-br from-[#22C55E] to-[#16A34A] bg-clip-text text-4xl font-extrabold text-transparent">
              {initials}
            </span>
          </motion.div>

          <div className="z-10 mt-5 w-full">
            <h1 className="text-2xl font-bold text-[#1A202C]">
              {emp.firstName} {emp.lastName}
            </h1>
            <p className="mt-1 text-sm font-medium tracking-wide text-[#22C55E] uppercase">
              {emp.designation || "Employee"}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase">
                {emp.user?.role || "USER"}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#22C55E] uppercase">
                <IconUserCheck size={12} /> Active
              </span>
            </div>
          </div>

          <div className="z-10 mt-8 w-full space-y-4 text-left">
            <div className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F9FAFB]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6]">
                <IconMail size={18} className="text-[#6B7280]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Email
                </p>
                <p className="truncate text-sm font-medium text-[#1A202C]">
                  {emp.user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F9FAFB]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6]">
                <IconPhone size={18} className="text-[#6B7280]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Phone
                </p>
                <p className="truncate text-sm font-medium text-[#1A202C]">
                  {emp.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-[#F9FAFB]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3F4F6]">
                <IconBuildingBank size={18} className="text-[#6B7280]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold tracking-wider text-[#9CA3AF] uppercase">
                  Department
                </p>
                <p className="truncate text-sm font-medium text-[#1A202C]">
                  {emp.department || "Not Assigned"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4"
            variants={staggerContainer}
          >
            <motion.div
              className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
              variants={slideUp}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#3B82F6]">
                <IconCalendar size={24} stroke={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#6B7280] uppercase">
                  Joined Date
                </p>
                <p className="mt-0.5 text-lg font-bold text-[#1A202C]">
                  {new Date(emp.joinedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm"
              variants={slideUp}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#8B5CF6]">
                <IconChecklist size={24} stroke={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#6B7280] uppercase">
                  Total Tasks
                </p>
                <p className="mt-0.5 text-lg font-bold text-[#1A202C]">
                  {emp.tasks?.length || 0}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Tasks */}
          <motion.div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            variants={slideUp}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A202C]">
                <IconChecklist className="text-[#22C55E]" size={20} /> Tasks
              </h2>
            </div>

            {emp.tasks?.length > 0 ? (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {emp.tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-[#F3F4F6] p-4 transition-colors hover:bg-[#F9FAFB]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#1A202C]">
                        {task.title}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-[#6B7280]">
                        {task.description || "No description provided."}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                        task.status === "DONE"
                          ? "bg-[#DCFCE7] text-[#22C55E]"
                          : task.status === "IN_PROGRESS"
                            ? "bg-[#FEF3C7] text-[#F59E0B]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-8 text-center">
                <p className="text-sm font-medium text-[#6B7280]">
                  No tasks assigned yet.
                </p>
              </div>
            )}
          </motion.div>

          {/* Attendance */}
          <motion.div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            variants={slideUp}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A202C]">
                <IconBriefcase className="text-[#3B82F6]" size={20} />{" "}
                Attendance
              </h2>
            </div>

            {emp.attendance?.length > 0 ? (
              <div className="max-h-60 overflow-hidden overflow-y-auto rounded-xl border border-[#F3F4F6]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {emp.attendance.map((record: any) => (
                      <tr
                        key={record.id}
                        className="transition-colors hover:bg-[#F9FAFB]/50"
                      >
                        <td className="px-4 py-3 font-medium text-[#1A202C]">
                          {new Date(record.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                              record.status === "PRESENT"
                                ? "bg-[#DCFCE7] text-[#22C55E]"
                                : "bg-[#FEE2E2] text-[#EF4444]"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-8 text-center">
                <p className="text-sm font-medium text-[#6B7280]">
                  No attendance records found.
                </p>
              </div>
            )}
          </motion.div>

          {/* Leaves */}
          <motion.div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            variants={slideUp}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A202C]">
                <IconCalendar className="text-[#8B5CF6]" size={20} /> Leave
                Requests
              </h2>
            </div>

            {emp.leaveRequests?.length > 0 ? (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {emp.leaveRequests.map((leave: any) => (
                  <div
                    key={leave.id}
                    className="flex flex-col rounded-xl border border-[#F3F4F6] p-4 transition-colors hover:bg-[#F9FAFB]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#1A202C]">
                        {leave.type} Leave
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                          leave.status === "APPROVED"
                            ? "bg-[#DCFCE7] text-[#22C55E]"
                            : leave.status === "REJECTED"
                              ? "bg-[#FEE2E2] text-[#EF4444]"
                              : "bg-[#FEF3C7] text-[#F59E0B]"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#6B7280]">
                      {new Date(leave.fromDate).toLocaleDateString("en-GB")} to{" "}
                      {new Date(leave.toDate).toLocaleDateString("en-GB")} (
                      {leave.days} days)
                    </p>
                    {leave.reason && (
                      <p className="mt-2 border-l-2 border-[#E5E7EB] pl-2 text-xs text-[#6B7280] italic">
                        {leave.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-8 text-center">
                <p className="text-sm font-medium text-[#6B7280]">
                  No leave records found.
                </p>
              </div>
            )}
          </motion.div>

          {/* Payroll */}
          <motion.div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            variants={slideUp}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A202C]">
                <IconCashBanknote className="text-[#F59E0B]" size={20} />{" "}
                Payroll
              </h2>
            </div>

            {emp.payroll?.length > 0 ? (
              <div className="max-h-60 overflow-hidden overflow-y-auto rounded-xl border border-[#F3F4F6]">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#F3F4F6] bg-[#F9FAFB]">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
                        Month/Year
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
                        Net Pay
                      </th>
                      <th className="px-4 py-3 text-[11px] font-bold tracking-wider text-[#6B7280] uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {emp.payroll.map((pay: any) => (
                      <tr
                        key={pay.id}
                        className="transition-colors hover:bg-[#F9FAFB]/50"
                      >
                        <td className="px-4 py-3 font-medium text-[#1A202C]">
                          {new Date(pay.year, pay.month).toLocaleString(
                            "default",
                            { month: "short" }
                          )}{" "}
                          {pay.year}
                        </td>
                        <td className="px-4 py-3 font-bold text-[#22C55E]">
                          ₹{Number(pay.netPay).toLocaleString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                              pay.status === "PAID"
                                ? "bg-[#DCFCE7] text-[#22C55E]"
                                : "bg-[#FEF3C7] text-[#F59E0B]"
                            }`}
                          >
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-8 text-center">
                <p className="text-sm font-medium text-[#6B7280]">
                  No payroll records found.
                </p>
              </div>
            )}
          </motion.div>

          {/* Daily Reports */}
          <motion.div
            className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm"
            variants={slideUp}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1A202C]">
                <IconFileReport className="text-[#EC4899]" size={20} /> Daily
                Reports & Analysis
              </h2>
            </div>

            {emp.dailyReports?.length > 0 ? (
              <div className="max-h-80 space-y-3 overflow-y-auto">
                {emp.dailyReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex flex-col rounded-xl border border-[#F3F4F6] p-4 transition-colors hover:bg-[#F9FAFB]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#1A202C]">
                        {new Date(report.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <span className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#3B82F6] uppercase">
                        {report.hoursLogged} hours logged
                      </span>
                    </div>
                    <p className="mt-2 text-xs whitespace-pre-line text-[#6B7280]">
                      {report.summary}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] py-8 text-center">
                <p className="text-sm font-medium text-[#6B7280]">
                  No daily reports submitted.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
