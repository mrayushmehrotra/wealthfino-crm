"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef } from "react"
import { fadeInUp, staggerContainer, slideUp, staggerFast } from "@/lib/animation-variants"
import { IconPrinter, IconCheck, IconX, IconLoader2 } from "@tabler/icons-react"
import { useAuth, useEmployees, usePayroll, usePayrollRequests } from "@/hooks/use-data"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const now = new Date()
const defaultMonth = now.getMonth() + 1
const defaultYear = now.getFullYear()

function generateSlipHTML(row: { name: string; role: string; department: string | null; basic: number; allowances: number; deductions: number; bonus: number; netPay: number; month: number; year: number }) {
  const period = `${MONTHS[row.month - 1]} ${row.year}`
  const lines: [string, string][] = [
    ["Basic Salary", fmt(row.basic)],
    ["Allowances", fmt(row.allowances)],
  ]
  if (row.bonus > 0) lines.push(["Bonus", fmt(row.bonus)])
  lines.push(["Deductions", `- ${fmt(row.deductions)}`])
  const rowsHTML = lines.map(([l, v]) =>
    `<tr><td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;font-size:13px;color:#374151">${l}</td><td style="padding:8px 12px;border-bottom:1px solid #E5E7EB;font-size:13px;color:#374151;text-align:right;font-weight:600">${v}</td></tr>`
  ).join("")

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Salary Slip - ${row.name}</title><style>
    @page { margin: 15mm }
    body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; color: #1A202C }
    .slip { max-width: 700px; margin: 0 auto; padding: 32px }
    .header { text-align: center }
    .header h1 { font-size: 22px; margin: 0; color: #1A202C }
    .header p { font-size: 13px; margin: 4px 0 0; color: #6B7280 }
    .divider { border: none; border-top: 3px solid #22C55E; margin: 16px 0 }
    .info-grid { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 16px }
    .info-grid div { color: #374151 }
    .info-grid strong { color: #1A202C }
    .section-title { font-size: 14px; font-weight: 700; color: #1A202C; margin: 0 0 8px }
    table { width: 100%; border-collapse: collapse }
    th { text-align: left; padding: 8px 12px; font-size: 12px; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #E5E7EB }
    th:last-child { text-align: right }
    .net-row td { padding: 10px 12px; font-size: 15px; font-weight: 700; color: #1A202C; border-top: 2px solid #22C55E }
    .net-row td:last-child { text-align: right; color: #22C55E }
    .footer { text-align: center; font-size: 11px; color: #9CA3AF; margin-top: 24px }
  </style></head><body>
  <div class="slip">
    <div class="header"><h1>WealthFino</h1><p>Salary Slip — ${period}</p></div>
    <hr class="divider">
    <div class="info-grid">
      <div><strong>Name:</strong> ${row.name}<br><strong>Role:</strong> ${row.role}</div>
      <div style="text-align:right"><strong>Department:</strong> ${row.department || "N/A"}<br><strong>Payslip ID:</strong> #${Math.random().toString(36).slice(2, 8).toUpperCase()}</div>
    </div>
    <p class="section-title">Earnings</p>
    <table><thead><tr><th>Component</th><th>Amount</th></tr></thead><tbody>${rowsHTML}</tbody></table>
    <table><tr class="net-row"><td>Net Pay</td><td>${fmt(row.netPay)}</td></tr></table>
    <hr class="divider">
    <div class="footer">This is a computer-generated salary slip.</div>
  </div></body></html>`
}

function RequestAction({
  row,
  request,
  onView,
  onRefetch,
}: {
  row: { id: number; name: string }
  request?: { id: number; status: string }
  onView: () => void
  onRefetch: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleRequest = async () => {
    setLoading(true)
    try {
      await fetch("/api/payroll/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payrollId: row.id }),
      })
      onRefetch()
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAgain = async () => {
    setLoading(true)
    try {
      await fetch("/api/payroll/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payrollId: row.id }),
      })
      onRefetch()
    } finally {
      setLoading(false)
    }
  }

  if (request?.status === "APPROVED") {
    return (
      <motion.button
        onClick={onView}
        className="text-xs font-semibold text-[#22C55E] hover:underline"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        View Slip
      </motion.button>
    )
  }

  if (request?.status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#F59E0B] uppercase tracking-wider">
        <IconLoader2 size={10} className="animate-spin" />
        Requested
      </span>
    )
  }

  if (request?.status === "REJECTED") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#FEE2E2] text-[#EF4444] uppercase tracking-wider">
          Rejected
        </span>
        <motion.button
          onClick={handleRequestAgain}
          disabled={loading}
          className="text-[10px] font-semibold text-[#22C55E] hover:underline disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? "..." : "Request Again"}
        </motion.button>
      </div>
    )
  }

  return (
    <motion.button
      onClick={handleRequest}
      disabled={loading}
      className="text-xs font-semibold text-[#F59E0B] hover:underline disabled:opacity-50"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {loading ? "Requesting..." : "Request Download"}
    </motion.button>
  )
}

export default function SalaryPayrollPage() {
  const [month, setMonth] = useState(defaultMonth)
  const [year, setYear] = useState(defaultYear)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState("")
  const [generateSuccess, setGenerateSuccess] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showRequests, setShowRequests] = useState(false)
  const [previewSlip, setPreviewSlip] = useState<{
    name: string; role: string; department: string | null;
    basic: number; allowances: number; deductions: number; bonus: number; netPay: number;
    month: number; year: number
  } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const { data: user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const { data: employees } = useEmployees()

  const { data: payrollData, refetch } = usePayroll(month, year)
  const { data: downloadRequests, refetch: refetchRequests } = usePayrollRequests()

  const requestMap = new Map<number, typeof downloadRequests[number]>()
  for (const req of downloadRequests) {
    requestMap.set(req.payrollId, req)
  }

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

  const PAYROLL: PayrollRow[] = payrollData?.data || []
  const allEmployees: EmployeeItem[] = employees?.data || []

  const [selected, setSelected] = useState<Record<number, { checked: boolean; bonus: string }>>({})

  const getEntry = (id: number) => selected[id] ?? { checked: true, bonus: "" }

  const openModal = () => {
    setShowModal(true)
    setGenerateError("")
    setGenerateSuccess("")
  }

  const toggleEmployee = (id: number) => {
    const current = getEntry(id)
    setSelected((prev) => ({
      ...prev,
      [id]: { ...current, checked: !current.checked },
    }))
  }

  const setBonus = (id: number, bonus: string) => {
    const current = getEntry(id)
    setSelected((prev) => ({
      ...prev,
      [id]: { ...current, bonus },
    }))
  }

  const handleGenerate = async () => {
    const checked = allEmployees
      .filter((e) => getEntry(e.id).checked)
      .map((e) => ({
        employeeId: e.id,
        bonus: getEntry(e.id).bonus ? parseFloat(getEntry(e.id).bonus) : undefined,
      }))

    if (checked.length === 0) {
      setGenerateError("Select at least one employee.")
      return
    }

    setGenerating(true)
    setGenerateError("")
    setGenerateSuccess("")
    try {
      const res = await fetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, year, employees: checked }),
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

  const handleDownloadPDF = () => {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.focus()
    iframeRef.current.contentWindow.print()
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

      {/* Admin: Download Requests */}
      {isAdmin && (
        <motion.div variants={slideUp} className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <button
            onClick={() => setShowRequests(!showRequests)}
            className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F9FAFB] transition-colors"
          >
            <h2 className="text-sm font-bold text-[#1A202C] flex items-center gap-2">
              <IconLoader2 size={16} className="text-[#F59E0B]" />
              Download Requests
              {downloadRequests.filter((r) => r.status === "PENDING").length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#F59E0B]">
                  {downloadRequests.filter((r) => r.status === "PENDING").length} pending
                </span>
              )}
            </h2>
            <span className="text-[#9CA3AF] text-sm">{showRequests ? "▲" : "▼"}</span>
          </button>
          <AnimatePresence>
            {showRequests && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-[#E5E7EB]"
              >
                {downloadRequests.filter((r) => r.status === "PENDING").length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] text-center py-8">No pending download requests.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Employee</th>
                        <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Period</th>
                        <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Net Pay</th>
                        <th className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Requested</th>
                        <th className="text-right text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {downloadRequests.filter((r) => r.status === "PENDING").map((req) => (
                        <tr key={req.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-5 py-4 font-medium text-[#1A202C]">{req.employeeName}</td>
                          <td className="px-5 py-4 text-[#6B7280]">{MONTHS[req.month - 1]} {req.year}</td>
                          <td className="px-5 py-4 text-[#6B7280]">{fmt(req.netPay)}</td>
                          <td className="px-5 py-4 text-[#6B7280]">{new Date(req.requestedAt).toLocaleDateString("en-GB")}</td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <motion.button
                                onClick={async () => {
                                  await fetch(`/api/payroll/requests/${req.id}/approve`, { method: "PUT" })
                                  refetchRequests()
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-[#DCFCE7] text-[#22C55E] hover:bg-[#22C55E] hover:text-white transition-colors uppercase tracking-wider"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <IconCheck size={12} />
                                Approve
                              </motion.button>
                              <motion.button
                                onClick={async () => {
                                  await fetch(`/api/payroll/requests/${req.id}/reject`, { method: "PUT" })
                                  refetchRequests()
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-[#FEE2E2] text-[#EF4444] hover:bg-[#EF4444] hover:text-white transition-colors uppercase tracking-wider"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <IconX size={12} />
                                Reject
                              </motion.button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

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
                  {isAdmin ? (
                    <motion.button
                      // @ts-expect-error FIXME: fix this ts issue error
                      onClick={() => setPreviewSlip(row)}
                      className="text-xs font-semibold text-[#22C55E] hover:underline"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Slip
                    </motion.button>
                  ) : (
                    <RequestAction
                      row={row}
                      request={requestMap.get(row.id)}
                      onView={() => setPreviewSlip(row)}
                      onRefetch={refetchRequests}
                    />
                  )}
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

      {/* Generate Modal */}
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

              <div className="px-6 py-3 border-b border-[#E5E7EB] flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allEmployees.length > 0 && allEmployees.every((e) => getEntry(e.id).checked)}
                    onChange={() => {
                      const all = allEmployees.every((e) => getEntry(e.id).checked)
                      const next: Record<number, { checked: boolean; bonus: string }> = {}
                      for (const emp of allEmployees) {
                        next[emp.id] = { ...getEntry(emp.id), checked: !all }
                      }
                      setSelected(next)
                    }}
                    className="w-4 h-4 accent-[#22C55E]"
                  />
                  <span className="font-medium text-[#1A202C]">Select All</span>
                </label>
                <span className="text-[#6B7280]">
                  {allEmployees.filter((e) => getEntry(e.id).checked).length} / {allEmployees.length} selected
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-3 space-y-2">
                {allEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${getEntry(emp.id).checked ? "border-[#22C55E] bg-[#F0FFF4]" : "border-[#E5E7EB]"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={getEntry(emp.id).checked}
                      onChange={() => toggleEmployee(emp.id)}
                      className="w-4 h-4 accent-[#22C55E]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A202C]">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-[#6B7280]">{emp.department || "N/A"} — {emp.salary != null ? fmt(Number(emp.salary)) : "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-[#6B7280]">Bonus:</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={getEntry(emp.id).bonus}
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
                  {generating ? "Generating..." : `Generate (${allEmployees.filter((e) => getEntry(e.id).checked).length})`}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slip Preview Modal */}
      <AnimatePresence>
        {previewSlip && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#1A202C]">Salary Slip — {previewSlip.name}</h2>
                <button onClick={() => setPreviewSlip(null)} className="text-[#6B7280] hover:text-[#1A202C] text-xl leading-none">&times;</button>
              </div>
              <div className="p-4 bg-[#F9FAFB]">
                <motion.button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IconPrinter size={16} />
                  Download PDF
                </motion.button>
              </div>
              <div className="flex-1 p-4 pt-0 max-h-[70vh]">
                <iframe
                  ref={iframeRef}
                  srcDoc={generateSlipHTML({ ...previewSlip, month, year })}
                  className="w-full h-full rounded-lg border border-[#E5E7EB] bg-white"
                  title="Salary Slip"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
