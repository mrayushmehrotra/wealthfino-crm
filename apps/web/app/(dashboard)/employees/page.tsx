"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"


const STATUS_STYLES: Record<string, string> = {
  Present: "bg-[#DCFCE7] text-[#22C55E]",
  Absent: "bg-[#FEE2E2] text-[#EF4444]",
  "On Leave": "bg-[#FEF3C7] text-[#F59E0B]",
}

export default function EmployeesPage() {
  const { data: queryData } = useQuery({
    queryKey: ["EMPLOYEES"],
    queryFn: async () => {
      const res = await fetch("/api/employees")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })
  
  const EMPLOYEES: Array<{ id: number; firstName: string; lastName: string; email: string; department: string; designation: string; joinedAt: string }> = queryData?.data || []

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
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
          <div className="relative max-w-sm">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <motion.input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] transition-colors"
              whileFocus={{ scale: 1.01 }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {["Name", "Role", "Department", "Status", "Joined", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3"
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
              {EMPLOYEES.map((emp) => (
                <motion.tr
                  key={emp.id}
                  variants={fadeInUp}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="h-8 w-8 rounded-full bg-[#DCFCE7] flex items-center justify-center"
                        whileHover={{ scale: 1.15 }}
                      >
                        <span className="text-xs font-bold text-[#22C55E]">
                          {emp.firstName?.[0] || ""}{emp.lastName?.[0] || ""}
                        </span>
                      </motion.div>
                      <span className="font-medium text-[#1A202C]">{emp.firstName} {emp.lastName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#6B7280]">
                    <div className="flex flex-col">
                      <span className="text-[#1A202C] font-medium">{emp.designation || "N/A"}</span>
                      <span className="text-[10px] uppercase tracking-wider">{emp.user?.role || "EMPLOYEE"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[#6B7280]">{emp.department || "N/A"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES["Present"]}`}
                    >
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#6B7280]">{emp.joinedAt ? new Date(emp.joinedAt).toLocaleDateString() : "N/A"}</td>
                  <td className="px-5 py-4">
                    <Link href={`/employees/${emp.id}`}>
                      <motion.button
                        className="text-xs font-semibold text-[#22C55E] hover:underline"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View
                      </motion.button>
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
