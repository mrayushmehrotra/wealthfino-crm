"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"


const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function SalaryPayrollPage() {
  const { data: queryData } = useQuery({
    queryKey: ["PAYROLL"],
    queryFn: async () => {
      const res = await fetch("/api/payroll")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })
  
  type PayrollRow = { name: string; role: string; basic: number; allowance: number; deduction: number; net: number }
  const PAYROLL: PayrollRow[] = queryData?.data || []

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Salary & Payroll</h1>
          <p className="text-sm text-[#6B7280] mt-1">June 2026 payroll summary</p>
        </div>
        <motion.button
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Generate Payslips
        </motion.button>
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainer}>
        {[
          { label: "Total Payroll", value: fmt(PAYROLL.reduce((s, r) => s + r.net, 0)), color: "text-[#1A202C]" },
          { label: "Total Employees", value: PAYROLL.length.toString(), color: "text-[#22C55E]" },
          { label: "Avg Salary", value: PAYROLL.length ? fmt(Math.round(PAYROLL.reduce((s, r) => s + r.net, 0) / PAYROLL.length)) : "N/A", color: "text-[#3B82F6]" },
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
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
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
              {["Employee", "Role", "Basic", "Allowances", "Deductions", "Net Pay", "Action"].map(
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
            {PAYROLL.map((row) => (
              <motion.tr
                key={row.name}
                variants={fadeInUp}
                className="hover:bg-[#F9FAFB] transition-colors"
              >
                <td className="px-5 py-4 font-medium text-[#1A202C]">{row.name}</td>
                <td className="px-5 py-4 text-[#6B7280]">{row.role}</td>
                <td className="px-5 py-4 text-[#6B7280]">{fmt(row.basic)}</td>
                <td className="px-5 py-4 text-[#22C55E]">+{fmt(row.allowance)}</td>
                <td className="px-5 py-4 text-[#EF4444]">-{fmt(row.deduction)}</td>
                <td className="px-5 py-4 font-bold text-[#1A202C]">{fmt(row.net)}</td>
                <td className="px-5 py-4">
                  <motion.button
                    className="text-xs font-semibold text-[#22C55E] hover:underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Download
                  </motion.button>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </motion.div>
    </motion.div>
  )
}
