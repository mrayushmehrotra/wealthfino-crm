"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEmployees } from "@/hooks/use-data"
import { EmployeeLoadingState } from "@/components/employee-loading-state"
import {
  IconPlus,
  IconSearch,
  IconChevronDown,
  IconMail,
  IconPhone,
  IconCalendar,
  IconUserCheck,
  IconId,
  IconCash,
  IconReportAnalytics,
  IconEye,
} from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"

interface Employee {
  id: number
  firstName: string
  lastName: string
  phone: string | null
  address: string | null
  aadharCard: string | null
  panNumber: string | null
  salary: number | null
  bonus: number
  department: string | null
  designation: string | null
  image: string | null
  joinedAt: string
  updatedAt: string | null
  location: string | null
  lastIp: string | null
  user: { email: string; role: string } | null
  totalAttendance: number
  totalLeaves: number
  totalTasks: number
  totalCheckIns: number
  totalCheckOuts: number
}

export default function EmployeesPage() {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data: EMPLOYEES, isPending } = useEmployees()

  if (isPending) {
    return <EmployeeLoadingState label="Loading employees..." />
  }

  const filtered = EMPLOYEES.filter((emp) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      emp.firstName.toLowerCase().includes(q) ||
      emp.lastName.toLowerCase().includes(q) ||
      emp.user?.email?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    )
  })

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (d: string) => {
    if (!d) return "N/A"
    return new Date(d).toLocaleDateString("en-GB")
  }

  const initials = (emp: Employee) => {
    const f = emp.firstName?.[0] || ""
    const l = emp.lastName?.[0] || ""
    return `${f}${l}`.toUpperCase()
  }

  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
        variants={fadeInUp}
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Employees</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Manage your team members
          </p>
        </div>
      </motion.div>

      <motion.div
        className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <div className="border-b border-[#E5E7EB] p-4">
          <div className="relative max-w-full sm:max-w-sm">
            <IconSearch
              size={16}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] py-2 pr-4 pl-9 text-sm text-[#1A202C] placeholder-[#9CA3AF] transition-colors focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="w-10 px-2 py-3" />
                <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Employee
                </th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase lg:table-cell">
                  Department
                </th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase lg:table-cell">
                  Role
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Status
                </th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase lg:table-cell">
                  Joined
                </th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase lg:table-cell">
                  Location
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <motion.tbody
              className="divide-y divide-[#F3F4F6]"
              variants={staggerFast}
            >
              {filtered.map((emp) => (
                <motion.tr
                  key={emp.id}
                  variants={fadeInUp}
                  onPointerDown={() => toggleExpand(emp.id)}
                  className="cursor-pointer"
                >
                  <td className="px-2 py-4 text-center">
                    <motion.div
                      animate={{ rotate: expandedId === emp.id ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <IconChevronDown size={16} className="text-[#9CA3AF]" />
                    </motion.div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#DCFCE7]">
                        {emp.image ? (
                          <img
                            src={emp.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-[#22C55E]">
                            {initials(emp)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="block font-medium text-[#1A202C]">
                          {emp.firstName} {emp.lastName}
                        </span>
                        <span className="text-[11px] text-[#9CA3AF]">
                          {emp.user?.email || ""}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-4 text-[#6B7280] lg:table-cell">
                    {emp.department || "N/A"}
                  </td>
                  <td className="hidden px-5 py-4 text-[#6B7280] lg:table-cell">
                    <div className="flex flex-col">
                      <span className="font-medium text-[#1A202C]">
                        {emp.designation || "N/A"}
                      </span>
                      <span className="text-[10px] tracking-wider uppercase">
                        {emp.user?.role || "EMPLOYEE"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#22C55E]">
                      Active
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 text-[#6B7280] lg:table-cell">
                    {formatDate(emp.joinedAt)}
                  </td>
                  <td className="hidden max-w-[140px] truncate px-5 py-4 text-[#6B7280] lg:table-cell">
                    {emp.location || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/employees/${emp.id}`)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#F3F4F6] px-3 py-1.5 text-[11px] font-bold tracking-wider text-[#6B7280] uppercase transition-colors hover:bg-[#22C55E] hover:text-white"
                    >
                      <IconEye size={14} />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.map(
                (emp) =>
                  expandedId === emp.id && (
                    <motion.tr
                      key={`${emp.id}-expanded`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan={8} className="px-6 pt-2 pb-6">
                        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 sm:p-6">
                          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                            <div className="space-y-3">
                              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                                <IconUserCheck size={14} /> Personal Info
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-[#6B7280]">Name</span>
                                  <span className="font-medium text-[#1A202C]">
                                    {emp.firstName} {emp.lastName}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="flex items-center gap-1 text-[#6B7280]">
                                    <IconMail size={14} /> Email
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    {emp.user?.email || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="flex items-center gap-1 text-[#6B7280]">
                                    <IconPhone size={14} /> Phone
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    {emp.phone || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#6B7280]">
                                    Address
                                  </span>
                                  <span className="max-w-[180px] text-right font-medium text-[#1A202C]">
                                    {emp.address || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="flex items-center gap-1 text-[#6B7280]">
                                    <IconCalendar size={14} /> Joined
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    {formatDate(emp.joinedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                                <IconId size={14} /> Documents &amp; Financial
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-[#6B7280]">
                                    Aadhar Card
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    {emp.aadharCard || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#6B7280]">
                                    PAN Number
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    {emp.panNumber || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="flex items-center gap-1 text-[#6B7280]">
                                    <IconCash size={14} /> Salary
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    {emp.salary != null
                                      ? `₹${emp.salary.toLocaleString()}`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="flex items-center gap-1 text-[#6B7280]">
                                    <IconCash size={14} /> Bonus
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    ₹{(emp.bonus || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#6B7280]">
                                    Department
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    {emp.department || "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-[#6B7280]">
                                    Designation
                                  </span>
                                  <span className="font-medium text-[#1A202C]">
                                    {emp.designation || "N/A"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                                <IconReportAnalytics size={14} /> Statistics
                              </h3>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 text-center">
                                  <p className="text-2xl font-bold text-[#3B82F6]">
                                    {emp.totalAttendance}
                                  </p>
                                  <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                                    Attendance
                                  </p>
                                </div>
                                <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 text-center">
                                  <p className="text-2xl font-bold text-[#F59E0B]">
                                    {emp.totalLeaves}
                                  </p>
                                  <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                                    Leaves
                                  </p>
                                </div>
                                <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 text-center">
                                  <p className="text-2xl font-bold text-[#22C55E]">
                                    {emp.totalCheckIns}
                                  </p>
                                  <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                                    Check-ins
                                  </p>
                                </div>
                                <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 text-center">
                                  <p className="text-2xl font-bold text-[#EF4444]">
                                    {emp.totalCheckOuts}
                                  </p>
                                  <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                                    Check-outs
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white p-3">
                                <span className="text-xs font-semibold tracking-wider text-[#6B7280] uppercase">
                                  Tasks
                                </span>
                                <span className="text-lg font-bold text-[#1A202C]">
                                  {emp.totalTasks}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )
              )}
            </motion.tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-[#6B7280]">
                No employees found.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
