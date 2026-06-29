"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { fadeInUp, staggerContainer, slideUp, staggerFast } from "@/lib/animation-variants"
import jsPDF from "jspdf"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const now = new Date()
const defaultMonth = now.getMonth() + 1
const defaultYear = now.getFullYear()

function downloadPDF(row: { name: string; role: string; department: string | null; basic: number; allowances: number; deductions: number; bonus: number; netPay: number; month: number; year: number }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" })
  const pageW = 190
  let y = 20

  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("WealthFino", pageW / 2, y, { align: "center" })
  y += 6
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text("Salary Slip", pageW / 2, y, { align: "center" })
  y += 8

  doc.setDrawColor(34, 197, 94)
  doc.setLineWidth(0.8)
  doc.line(10, y, pageW + 10, y)
  y += 6

  const period = `${MONTHS[row.month - 1]} ${row.year}`
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text(`Period: ${period}`, 10, y)
  doc.setFont("helvetica", "normal")
  doc.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, pageW / 2 + 10, y, { align: "right" })
  y += 10

  doc.setFont("helvetica", "bold")
  doc.text("Employee Details", 10, y)
  y += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  const details = [
    [`Name: ${row.name}`, `Role: ${row.role}`],
    [`Department: ${row.department || "N/A"}`, `Payslip ID: #${Math.random().toString(36).slice(2, 8).toUpperCase()}`],
  ]
  for (const [left, right] of details) {
    doc.text(left, 15, y)
    doc.text(right, pageW / 2 + 10, y, { align: "right" })
    y += 5
  }
  y += 4

  doc.setDrawColor(200)
  doc.setLineWidth(0.3)
  doc.line(10, y, pageW + 10, y)
  y += 6

  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.text("Earnings", 10, y)
  doc.text("Amount", pageW + 10, y, { align: "right" })
  y += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  const earningsRows: [string, number][] = [
    ["Basic Salary", row.basic],
    ["Allowances", row.allowances],
  ]
  if (row.bonus > 0) {
    earningsRows.push(["Bonus", row.bonus])
  }
  earningsRows.push(["Deductions", -row.deductions])

  for (const [label, amount] of earningsRows) {
    doc.text(label, 15, y)
    doc.text(`${amount >= 0 ? "" : "-"}${fmt(Math.abs(amount))}`, pageW + 10, y, { align: "right" })
    y += 5.5
  }

  y += 2
  doc.setDrawColor(200)
  doc.setLineWidth(0.3)
  doc.line(10, y, pageW + 10, y)
  y += 5

  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Net Pay", 10, y)
  doc.text(fmt(row.netPay), pageW + 10, y, { align: "right" })
  y += 8

  doc.setDrawColor(34, 197, 94)
  doc.setLineWidth(0.8)
  doc.line(10, y, pageW + 10, y)
  y += 10

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(128)
  doc.text("This is a computer-generated salary slip.", pageW / 2, y, { align: "center" })

  doc.save(`salary-slip-${row.name.replace(/\s+/g, "-")}-${period.replace(/\s+/g, "-")}.pdf`)
}

export default function SalaryPayrollPage() {
  const [month, setMonth] = useState(defaultMonth)
  const [year, setYear] = useState(defaultYear)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState("")
  const [generateSuccess, setGenerateSuccess] = useState("")
  const [showModal, setShowModal] = useState(false)

  const { data: userData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json()
    },
  })

  const currentUser = userData?.data
  const isAdmin = currentUser?.role === "ADMIN"

  const { data: queryData, refetch } = useQuery({
    queryKey: ["PAYROLL", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/payroll?month=${month}&year=${year}`)
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  const { data: employeesData } = useQuery({
    queryKey: ["EMPLOYEES"],
    queryFn: async () => {
      const res = await fetch("/api/employees")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  type PayrollRow = {
    id: number
    employeeId: number
    name: string
    role: string
    department: string | null
    basic: number
    allowances: number
    deductions: number
    bonus: number
    netPay: number
    status: string
  }

  type EmployeeItem = {
    id: number
    firstName: string
    lastName: string
    department: string | null
    salary: number | null
  }

  const PAYROLL: PayrollRow[] = queryData?.data || []
  const allEmployees: EmployeeItem[] = (employeesData?.data || []).filter((e: EmployeeItem) => e.salary != null)

  const [selected, setSelected] = useState<Record<number, { bonus: string }>>({})

  const openModal = () => {
    setShowModal(true)
    setGenerateError("")
    setGenerateSuccess("")
    const initial: Record<number, { bonus: string }> = {}
    for (const emp of allEmployees) {
      initial[emp.id] = { bonus: "" }
    }
    setSelected(initial)
  }

  const setBonus = (id: number, bonus: string) => {
    setSelected((prev) => ({
      ...prev,
      [id]: { bonus },
    }))
  }

  const handleGenerate = async () => {
    const employeeList = Object.entries(selected).map(([id, v]) => ({
      employeeId: Number(id),
      bonus: v.bonus ? parseFloat(v.bonus) : undefined,
    }))

    if (employeeList.length === 0) {
      setGenerateError("No employees with salary found.")
      return
    }

    setGenerating(true)
    setGenerateError("")
    setGenerateSuccess("")
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, employees: employeeList }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate payslips")
      }
      setGenerateSuccess(`Generated ${data.data?.length || 0} payslip(s) for ${MONTHS[month - 1]} ${year}`)
      setShowModal(false)
      refetch()
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setGenerating(false)
    }
  }

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
          <p className="text-sm text-[#6B7280] mt-1">
            {MONTHS[month - 1]} {year} payroll summary
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <select
              value={month}
              onChange={(e) => { setMonth(Number(e.target.value)); setGenerateSuccess(""); setGenerateError("") }}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setGenerateSuccess(""); setGenerateError("") }}
              className="px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <motion.button
              onClick={openModal}
              disabled={generating}
              className="bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#9CA3AF] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Generate Payslips
            </motion.button>
          )}
        </div>
      </motion.div>

      {generateError && (
        <motion.div variants={fadeInUp} className="bg-[#FEE2E2] text-[#EF4444] text-sm font-medium px-4 py-3 rounded-lg border border-[#FECACA]">
          {generateError}
        </motion.div>
      )}
      {generateSuccess && (
        <motion.div variants={fadeInUp} className="bg-[#DCFCE7] text-[#16A34A] text-sm font-medium px-4 py-3 rounded-lg border border-[#BBF7D0]">
          {generateSuccess}
        </motion.div>
      )}

      <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainer}>
        {[
          { label: "Total Payroll", value: fmt(PAYROLL.reduce((s, r) => s + r.netPay, 0)), color: "text-[#1A202C]" },
          { label: "Total Employees", value: PAYROLL.length.toString(), color: "text-[#22C55E]" },
          { label: "Avg Salary", value: PAYROLL.length ? fmt(Math.round(PAYROLL.reduce((s, r) => s + r.netPay, 0) / PAYROLL.length)) : "N/A", color: "text-[#3B82F6]" },
        ].map(({ label, value, color }) => (
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

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={slideUp}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {["Employee", "Role", "Basic", "Allowances", "Deductions", "Bonus", "Net Pay", "Action"].map((h) => (
                <th key={h} className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <motion.tbody className="divide-y divide-[#F3F4F6]" variants={staggerFast}>
            {PAYROLL.map((row) => (
              <motion.tr key={row.id} variants={fadeInUp} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-5 py-4 font-medium text-[#1A202C]">{row.name}</td>
                <td className="px-5 py-4 text-[#6B7280]">{row.role}</td>
                <td className="px-5 py-4 text-[#6B7280]">{fmt(row.basic)}</td>
                <td className="px-5 py-4 text-[#22C55E]">+{fmt(row.allowances)}</td>
                <td className="px-5 py-4 text-[#EF4444]">-{fmt(row.deductions)}</td>
                <td className="px-5 py-4 text-[#F59E0B]">{row.bonus > 0 ? fmt(row.bonus) : "—"}</td>
                <td className="px-5 py-4 font-bold text-[#1A202C]">{fmt(row.netPay)}</td>
                <td className="px-5 py-4">
                  <motion.button
                    onClick={() => downloadPDF({ ...row, month, year })}
                    className="text-xs font-semibold text-[#22C55E] hover:underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Download
                  </motion.button>
                </td>
              </motion.tr>
            ))}
            {PAYROLL.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-[#9CA3AF]">
                  No payroll data for {MONTHS[month - 1]} {year}.{isAdmin ? " Click \"Generate Payslips\" to create." : ""}
                </td>
              </tr>
            )}
          </motion.tbody>
        </table>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#1A202C]">Generate Payslips — {allEmployees.length} employees</h2>
                <button onClick={() => setShowModal(false)} className="text-[#6B7280] hover:text-[#1A202C] text-xl leading-none">&times;</button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
                {allEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#E5E7EB]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A202C]">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-[#6B7280]">{emp.department || "N/A"} — {emp.salary != null ? fmt(Number(emp.salary)) : "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-[#6B7280]">Bonus:</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={selected[emp.id]?.bonus || ""}
                        onChange={(e) => setBonus(emp.id, e.target.value)}
                        className="w-28 px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#6B7280] hover:text-[#1A202C] transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#9CA3AF] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {generating ? "Generating..." : "Generate All"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
