"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEmployees } from "@/hooks/use-data"
import { IconPlus, IconSearch, IconChevronDown, IconMail, IconPhone, IconCalendar, IconUserCheck, IconId, IconCash, IconReportAnalytics, IconEye } from "@tabler/icons-react"
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

  const { data: EMPLOYEES } = useEmployees()

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
    return new Date(d).toLocaleDateString('en-GB')
  }

  const initials = (emp: Employee) => {
    const f = emp.firstName?.[0] || ""
    const l = emp.lastName?.[0] || ""
    return `${f}${l}`.toUpperCase()
  }

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Employees</h1>
          <p className="text-sm text-[#6B7280] mt-1">Manage your team members</p>
        </div>
        <motion.button
          className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <IconPlus size={16} />
          Add Employee
        </motion.button>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-full sm:max-w-sm">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] transition-colors"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="w-10 px-2 py-3" />
                <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Employee</th>
                <th className="hidden lg:table-cell text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Department</th>
                <th className="hidden lg:table-cell text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Status</th>
                <th className="hidden lg:table-cell text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Joined</th>
                <th className="hidden lg:table-cell text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Location</th>
                <th className="text-right text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Action</th>
              </tr>
            </thead>
            <motion.tbody className="divide-y divide-[#F3F4F6]" variants={staggerFast}>
              {filtered.map((emp) => (
                <motion.tr key={emp.id} variants={fadeInUp} onPointerDown={() => toggleExpand(emp.id)} className="cursor-pointer">
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
                      <div className="h-8 w-8 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0 overflow-hidden">
                        {emp.image ? (
                          <img src={emp.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-[#22C55E]">{initials(emp)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-[#1A202C] block">{emp.firstName} {emp.lastName}</span>
                        <span className="text-[11px] text-[#9CA3AF]">{emp.user?.email || ""}</span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden lg:table-cell px-5 py-4 text-[#6B7280]">{emp.department || "N/A"}</td>
                  <td className="hidden lg:table-cell px-5 py-4 text-[#6B7280]">
                    <div className="flex flex-col">
                      <span className="text-[#1A202C] font-medium">{emp.designation || "N/A"}</span>
                      <span className="text-[10px] uppercase tracking-wider">{emp.user?.role || "EMPLOYEE"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#22C55E]">Active</span>
                  </td>
                  <td className="hidden lg:table-cell px-5 py-4 text-[#6B7280]">{formatDate(emp.joinedAt)}</td>
                  <td className="hidden lg:table-cell px-5 py-4 text-[#6B7280] max-w-[140px] truncate">{emp.location || "N/A"}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/employees/${emp.id}`) }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-[#22C55E] hover:text-white transition-colors"
                    >
                      <IconEye size={14} />
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
              {filtered.map((emp) => expandedId === emp.id && (
                <motion.tr key={`${emp.id}-expanded`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan={8} className="px-6 pb-6 pt-2">
                    <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                            <IconUserCheck size={14} /> Personal Info
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">Name</span>
                              <span className="font-medium text-[#1A202C]">{emp.firstName} {emp.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280] flex items-center gap-1"><IconMail size={14} /> Email</span>
                              <span className="font-medium text-[#1A202C]">{emp.user?.email || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280] flex items-center gap-1"><IconPhone size={14} /> Phone</span>
                              <span className="font-medium text-[#1A202C]">{emp.phone || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">Address</span>
                              <span className="font-medium text-[#1A202C] text-right max-w-[180px]">{emp.address || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280] flex items-center gap-1"><IconCalendar size={14} /> Joined</span>
                              <span className="font-medium text-[#1A202C]">{formatDate(emp.joinedAt)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                            <IconId size={14} /> Documents &amp; Financial
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">Aadhar Card</span>
                              <span className="font-medium text-[#1A202C]">{emp.aadharCard || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">PAN Number</span>
                              <span className="font-medium text-[#1A202C]">{emp.panNumber || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280] flex items-center gap-1"><IconCash size={14} /> Salary</span>
                              <span className="font-medium text-[#1A202C]">{emp.salary != null ? `₹${emp.salary.toLocaleString()}` : "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280] flex items-center gap-1"><IconCash size={14} /> Bonus</span>
                              <span className="font-medium text-[#1A202C]">₹{(emp.bonus || 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">Department</span>
                              <span className="font-medium text-[#1A202C]">{emp.department || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#6B7280]">Designation</span>
                              <span className="font-medium text-[#1A202C]">{emp.designation || "N/A"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider flex items-center gap-1.5">
                            <IconReportAnalytics size={14} /> Statistics
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 text-center">
                              <p className="text-2xl font-bold text-[#3B82F6]">{emp.totalAttendance}</p>
                              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Attendance</p>
                            </div>
                            <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 text-center">
                              <p className="text-2xl font-bold text-[#F59E0B]">{emp.totalLeaves}</p>
                              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Leaves</p>
                            </div>
                            <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 text-center">
                              <p className="text-2xl font-bold text-[#22C55E]">{emp.totalCheckIns}</p>
                              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Check-ins</p>
                            </div>
                            <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 text-center">
                              <p className="text-2xl font-bold text-[#EF4444]">{emp.totalCheckOuts}</p>
                              <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Check-outs</p>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg border border-[#E5E7EB] p-3 flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Tasks</span>
                            <span className="text-lg font-bold text-[#1A202C]">{emp.totalTasks}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm font-medium text-[#6B7280]">No employees found.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}