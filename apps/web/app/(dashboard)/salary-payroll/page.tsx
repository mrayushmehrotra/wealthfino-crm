"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef } from "react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"
import { IconPrinter, IconCheck, IconX, IconLoader2 } from "@tabler/icons-react"
import {
  useAuth,
  useEmployees,
  usePayroll,
  usePayrollRequests,
} from "@/hooks/use-data"
import Logo from "@/public/wealthfino_logo.png"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const now = new Date()
const defaultMonth = now.getMonth() + 1
const defaultYear = now.getFullYear()

function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ]
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ]

  if (num === 0) return "Zero"

  function helper(n: number): string {
    if (n === 0) return ""
    if (n < 20) return ones[n] + " "
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " "
    if (n < 1000)
      return ones[Math.floor(n / 100)] + " Hundred " + helper(n % 100)
    if (n < 100000)
      return helper(Math.floor(n / 1000)) + "Thousand " + helper(n % 1000)
    if (n < 10000000)
      return helper(Math.floor(n / 100000)) + "Lakh " + helper(n % 100000)
    return helper(Math.floor(n / 10000000)) + "Crore " + helper(n % 10000000)
  }

  return helper(num).trim()
}

function generateSlipHTML(row: {
  name: string
  role: string
  department: string | null
  basic: number
  allowances: number
  deductions: number
  bonus: number
  netPay: number
  month: number
  year: number
  employeeId?: number | string
  paymentMode?: string
}) {
  const period = `${MONTHS[row.month - 1]} ${row.year}`
  const daysInMonth = new Date(row.year, row.month, 0).getDate()
  const payPeriod = `01 ${MONTHS[row.month - 1]} ${row.year} to ${daysInMonth} ${MONTHS[row.month - 1]} ${row.year}`
  const payDate = `${daysInMonth} ${MONTHS[row.month - 1]} ${row.year}`
  const empId =
    row.employeeId ?? `WF${String(Math.floor(Math.random() * 9000) + 1000)}`
  const paymentMode = row.paymentMode ?? "Bank Transfer"

  const hra = Math.round(row.allowances * 0.45)
  const special = Math.round(row.allowances * 0.35)
  const conveyance = Math.round(row.allowances * 0.12)
  const medical = row.allowances - hra - special - conveyance
  const grossSalary = row.basic + row.allowances + row.bonus
  const netPay = grossSalary - row.deductions

  const earningsRows = [
    { label: "Basic Salary", value: row.basic },
    { label: "House Rent Allowance (HRA)", value: hra },
    { label: "Special Allowance", value: special },
    { label: "Conveyance Allowance", value: conveyance },
    { label: "Medical Allowance", value: medical },
    ...(row.bonus > 0
      ? [{ label: "Performance Bonus", value: row.bonus }]
      : []),
  ]

  const deductionRows = [
    ...(row.deductions > 0
      ? [
          {
            label: "Provident Fund (PF)",
            value: Math.round(row.deductions * 0.5),
          },
        ]
      : []),
    ...(row.deductions > 0
      ? [{ label: "Professional Tax", value: Math.round(row.deductions * 0.3) }]
      : []),
    ...(row.deductions > 0
      ? [
          {
            label: "TDS",
            value:
              row.deductions -
              Math.round(row.deductions * 0.5) -
              Math.round(row.deductions * 0.3),
          },
        ]
      : []),
  ]

  const earningsRowsHTML = earningsRows
    .map(
      (e) => `
    <tr>
      <td style="padding:12px 20px;color:#374151;font-size:13.5px;border-bottom:1px solid #E5E7EB;">${e.label}</td>
      <td style="padding:12px 20px;text-align:right;font-weight:600;color:#1A202C;font-size:13.5px;border-bottom:1px solid #E5E7EB;">${fmt(e.value)}</td>
    </tr>
  `
    )
    .join("")

  const deductionsRowsHTML =
    deductionRows.length > 0
      ? deductionRows
          .map(
            (d) => `
      <tr>
        <td style="padding:12px 20px;color:#374151;font-size:13.5px;border-bottom:1px solid #E5E7EB;">${d.label}</td>
        <td style="padding:12px 20px;text-align:right;font-weight:600;color:#EF4444;font-size:13.5px;border-bottom:1px solid #E5E7EB;">${fmt(d.value)}</td>
      </tr>
    `
          )
          .join("")
      : `<tr><td colspan="2" style="padding:12px 20px;color:#9CA3AF;font-size:13px;text-align:center;border-bottom:1px solid #E5E7EB;">No deductions</td></tr>`

  const amountInWords = `Rupees ${numberToWords(netPay)} Only`

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Salary Slip - ${row.name} - ${period}</title>
  <style>
    @page { margin: 10mm; size: A4; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #ffffff;
      color: #1A202C;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .slip { max-width: 820px; margin: 0 auto; padding: 32px 36px; }

    /* ── Colors ── */
    .blue { color: #0A2C72; }
    .green { color: #57B947; }
    .bg-blue { background: #0A2C72; }
    .bg-grey { background: #F4F5F7; }
    .border-color { border-color: #D0D5DD; }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    .logo-img { width: 200px; height: auto; }
    .slip-badge { text-align: right; }
    .slip-badge h2 {
      font-size: 20px; font-weight: 700; color: #0A2C72;
      letter-spacing: 1px; text-transform: uppercase; margin-bottom: 2px;
    }
    .slip-badge .period {
      font-size: 13px; color: #57B947; font-weight: 600;
    }

    .divider { border: none; border-top: 1px solid #D0D5DD; margin-bottom: 24px; }

    /* ── Employee Card ── */
    .emp-card {
      border: 1px solid #D0D5DD;
      border-radius: 8px;
      padding: 20px 24px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .avatar-circle {
      width: 56px; height: 56px;
      background: #0A2C72;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .avatar-circle svg { width: 28px; height: 28px; }
    .emp-fields { display: flex; flex: 1; gap: 40px; }
    .emp-col { flex: 1; display: flex; flex-direction: column; gap: 6px; }
    .emp-row { display: flex; gap: 6px; align-items: baseline; }
    .emp-label { font-size: 13px; color: #555; }
    .emp-val { font-size: 13px; font-weight: 600; color: #0A2C72; }

    /* ── Section Title ── */
    .section-title {
      font-size: 13px; font-weight: 700; color: #0A2C72;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    /* ── Earnings Table ── */
    .earnings-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #D0D5DD;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .earnings-table thead tr { background: #0A2C72; }
    .earnings-table thead th {
      padding: 10px 18px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .earnings-table thead th:last-child { text-align: right; }
    .earnings-table tbody tr { background: #fff; }
    .earnings-table tbody td {
      padding: 10px 18px;
      font-size: 13px;
      color: #333;
      border-bottom: 1px solid #E5E7EB;
    }
    .earnings-table tbody td:last-child {
      text-align: right;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
    }
    .earnings-table tbody tr:last-child td { border-bottom: none; }
    .earnings-table tbody tr:last-child {
      background: #F4F5F7;
    }
    .earnings-table tbody tr:last-child td {
      font-weight: 700;
      color: #0A2C72;
      font-size: 14px;
    }
    .earnings-table tbody tr:last-child td:last-child { color: #57B947; }

    /* ── Deductions Table (only if deductions exist) ── */
    .deductions-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #D0D5DD;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 24px;
    }
    .deductions-table thead tr { background: #7F1D1D; }
    .deductions-table thead th {
      padding: 10px 18px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #fff;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .deductions-table thead th:last-child { text-align: right; }
    .deductions-table tbody tr { background: #fff; }
    .deductions-table tbody td {
      padding: 10px 18px;
      font-size: 13px;
      border-bottom: 1px solid #E5E7EB;
    }
    .deductions-table tbody td:last-child {
      text-align: right;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: #EF4444;
    }
    .deductions-table tbody tr:last-child td { border-bottom: none; }
    .deductions-table tbody tr:last-child { background: #F4F5F7; }
    .deductions-table tbody tr:last-child td {
      font-weight: 700;
      color: #7F1D1D;
      font-size: 14px;
    }

    /* ── Salary Summary ── */
    .salary-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px 28px;
      border: 1px solid #D0D5DD;
      border-radius: 8px;
      background: #fff;
      margin-bottom: 8px;
    }
    .summary-left { display: flex; align-items: center; gap: 14px; }
    .summary-icon {
      width: 44px; height: 44px;
      background: #F4F5F7;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .summary-icon svg { width: 22px; height: 22px; }
    .summary-label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-amount { font-size: 24px; font-weight: 700; color: #0A2C72; margin-top: 2px; }
    .summary-amount.green { color: #57B947; }
    .summary-divider { width: 1px; height: 56px; background: #D0D5DD; }
    .summary-right { display: flex; align-items: center; gap: 14px; }

    .amount-words {
      text-align: center;
      font-size: 12px;
      color: #888;
      font-style: italic;
      margin-bottom: 28px;
      padding: 8px 0;
      border-bottom: 1px dashed #D0D5DD;
    }

    /* ── Footer ── */
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 16px;
      border-top: 1px solid #D0D5DD;
    }
    .footer-left { font-size: 11px; color: #999; line-height: 1.6; font-style: italic; }
    .footer-center { text-align: center; }
    .footer-star {
      width: 36px; height: 36px;
      border: 1px solid #D0D5DD;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 4px;
    }
    .footer-star svg { width: 16px; height: 16px; }
    .footer-center p { font-size: 10px; color: #999; }
    .footer-right { text-align: right; }
    .footer-right .co-name { font-size: 13px; font-weight: 700; color: #0A2C72; }
    .footer-right .co-addr { font-size: 11px; color: #777; margin-top: 2px; line-height: 1.5; }
    .footer-right .co-web { font-size: 11px; color: #57B947; font-weight: 600; margin-top: 2px; }
  </style>
</head>
<body>
  <div class="slip">

    <div class="header">
      <img src="/wealthfino_logo.png" alt="WealthFino" class="logo-img" />
      <div class="slip-badge">
        <h2>Salary Slip</h2>
        <div class="period">${period}</div>
      </div>
    </div>

    <hr class="divider" />

    <div class="emp-card">
      <div class="avatar-circle">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="16" r="7" fill="rgba(255,255,255,0.25)" stroke="white" stroke-width="1.5"/>
          <path d="M6 36c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="emp-fields">
        <div class="emp-col">
          <div class="emp-row"><span class="emp-label">Employee Name :</span><span class="emp-val">${row.name}</span></div>
          <div class="emp-row"><span class="emp-label">Employee ID :</span><span class="emp-val">${empId}</span></div>
          <div class="emp-row"><span class="emp-label">Designation :</span><span class="emp-val">${row.role}</span></div>
        </div>
        <div class="emp-col">
          <div class="emp-row"><span class="emp-label">Pay Period :</span><span class="emp-val">${payPeriod}</span></div>
          <div class="emp-row"><span class="emp-label">Pay Date :</span><span class="emp-val">${payDate}</span></div>
          <div class="emp-row"><span class="emp-label">Payment Mode :</span><span class="emp-val">${paymentMode}</span></div>
        </div>
      </div>
    </div>

    <div class="section-title">Earnings Breakup</div>

    <table class="earnings-table">
      <thead>
        <tr>
          <th>Component</th>
          <th style="text-align:right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${earningsRowsHTML}
        <tr>
          <td>Total Gross Salary</td>
          <td>${fmt(grossSalary)}</td>
        </tr>
      </tbody>
    </table>

    ${
      row.deductions > 0
        ? `
    <div class="section-title" style="margin-top:20px;">Deductions</div>
    <table class="deductions-table">
      <thead>
        <tr>
          <th>Component</th>
          <th style="text-align:right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${deductionsRowsHTML}
        <tr>
          <td>Total Deductions</td>
          <td>${fmt(row.deductions)}</td>
        </tr>
      </tbody>
    </table>
    `
        : ""
    }

    <div class="salary-summary">
      <div class="summary-left">
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4v16M4 12h16" stroke="#0A2C72" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <div class="summary-label">Gross Salary</div>
          <div class="summary-amount">${fmt(grossSalary)}</div>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-right">
        <div>
          <div class="summary-label">Net Pay</div>
          <div class="summary-amount green">${fmt(netPay)}</div>
        </div>
        <div class="summary-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#57B947" stroke-width="2"/>
            <path d="M9 12l2 2 4-4" stroke="#57B947" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <div class="amount-words">${amountInWords}</div>

    <div class="footer">
      <div class="footer-left">
        This is a system generated salary slip<br />and does not require any signature.
      </div>
      <div class="footer-center">
        <div class="footer-star">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#0A2C72" stroke-width="1.5" stroke-linejoin="round"/>
          </svg>
        </div>
        <p>Thank you for your<br />continued contribution.</p>
      </div>
      <div class="footer-right">
        <div class="co-name">WealthFino Capital</div>
        <div class="co-addr">Bangalore, Karnataka, India</div>
        <div class="co-web">www.wealthfino.in</div>
      </div>
    </div>

  </div>
</body>
</html>`
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
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#F59E0B] uppercase">
        <IconLoader2 size={10} className="animate-spin" />
        Requested
      </span>
    )
  }

  if (request?.status === "REJECTED") {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#FEE2E2] px-2 py-1 text-[10px] font-bold tracking-wider text-[#EF4444] uppercase">
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
    name: string
    role: string
    department: string | null
    basic: number
    allowances: number
    deductions: number
    bonus: number
    netPay: number
    month: number
    year: number
    employeeId?: number | string
    paymentMode?: string
  } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const { data: user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const { data: employees } = useEmployees()

  const { data: payrollData, refetch } = usePayroll(month, year)
  const { data: downloadRequests, refetch: refetchRequests } =
    usePayrollRequests()

  const requestMap = new Map<number, (typeof downloadRequests)[number]>()
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

  const PAYROLL: PayrollRow[] = Array.isArray(payrollData) ? payrollData : []
  const allEmployees: EmployeeItem[] = Array.isArray(employees) ? employees : []

  const [selected, setSelected] = useState<
    Record<number, { checked: boolean; bonus: string }>
  >({})

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
        bonus: getEntry(e.id).bonus
          ? parseFloat(getEntry(e.id).bonus)
          : undefined,
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
      setGenerateSuccess(
        `Generated ${data.data?.length || 0} payslip(s) for ${MONTHS[month - 1]} ${year}`
      )
      setShowModal(false)
      refetch()
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Something went wrong"
      )
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
      className="mx-auto max-w-7xl space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex flex-wrap items-center justify-between gap-3"
        variants={fadeInUp}
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">
            Salary & Payroll
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {MONTHS[month - 1]} {year} payroll summary
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <select
              value={month}
              onChange={(e) => {
                setMonth(Number(e.target.value))
                setGenerateSuccess("")
                setGenerateError("")
              }}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
            >
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => {
                setYear(Number(e.target.value))
                setGenerateSuccess("")
                setGenerateError("")
              }}
              className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
            >
              {[year - 1, year, year + 1].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {isAdmin && (
            <motion.button
              onClick={openModal}
              disabled={generating}
              className="w-full rounded-lg bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A] disabled:bg-[#9CA3AF] sm:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Generate Payslips
            </motion.button>
          )}
        </div>
      </motion.div>

      {generateError && (
        <motion.div
          variants={fadeInUp}
          className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-4 py-3 text-sm font-medium text-[#EF4444]"
        >
          {generateError}
        </motion.div>
      )}
      {generateSuccess && (
        <motion.div
          variants={fadeInUp}
          className="rounded-lg border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-3 text-sm font-medium text-[#16A34A]"
        >
          {generateSuccess}
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
        variants={staggerContainer}
      >
        {[
          {
            label: "Total Payroll",
            value: fmt(PAYROLL.reduce((s, r) => s + r.netPay, 0)),
            color: "text-[#1A202C]",
          },
          {
            label: "Total Employees",
            value: PAYROLL.length.toString(),
            color: "text-[#22C55E]",
          },
          {
            label: "Avg Salary",
            value: PAYROLL.length
              ? fmt(
                  Math.round(
                    PAYROLL.reduce((s, r) => s + r.netPay, 0) / PAYROLL.length
                  )
                )
              : "N/A",
            color: "text-[#3B82F6]",
          },
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
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Admin: Download Requests */}
      {isAdmin && (
        <motion.div
          variants={slideUp}
          className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <button
            onClick={() => setShowRequests(!showRequests)}
            className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#F9FAFB]"
          >
            <h2 className="flex items-center gap-2 text-sm font-bold text-[#1A202C]">
              <IconLoader2 size={16} className="text-[#F59E0B]" />
              Download Requests
              {downloadRequests.filter((r) => r.status === "PENDING").length >
                0 && (
                <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold text-[#F59E0B]">
                  {
                    downloadRequests.filter((r) => r.status === "PENDING")
                      .length
                  }{" "}
                  pending
                </span>
              )}
            </h2>
            <span className="text-sm text-[#9CA3AF]">
              {showRequests ? "▲" : "▼"}
            </span>
          </button>
          <AnimatePresence>
            {showRequests && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-[#E5E7EB]"
              >
                {downloadRequests.filter((r) => r.status === "PENDING")
                  .length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#9CA3AF]">
                    No pending download requests.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB]">
                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                          Employee
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                          Period
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                          Net Pay
                        </th>
                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                          Requested
                        </th>
                        <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F3F4F6]">
                      {downloadRequests
                        .filter((r) => r.status === "PENDING")
                        .map((req) => (
                          <tr
                            key={req.id}
                            className="transition-colors hover:bg-[#F9FAFB]"
                          >
                            <td className="px-5 py-4 font-medium text-[#1A202C]">
                              {req.employeeName}
                            </td>
                            <td className="px-5 py-4 text-[#6B7280]">
                              {MONTHS[req.month - 1]} {req.year}
                            </td>
                            <td className="px-5 py-4 text-[#6B7280]">
                              {fmt(req.netPay)}
                            </td>
                            <td className="px-5 py-4 text-[#6B7280]">
                              {new Date(req.requestedAt).toLocaleDateString(
                                "en-GB"
                              )}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <motion.button
                                  onClick={async () => {
                                    await fetch(
                                      `/api/payroll/requests/${req.id}/approve`,
                                      { method: "PUT" }
                                    )
                                    refetchRequests()
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#DCFCE7] px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-[#22C55E] uppercase transition-colors hover:bg-[#22C55E] hover:text-white"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <IconCheck size={12} />
                                  Approve
                                </motion.button>
                                <motion.button
                                  onClick={async () => {
                                    await fetch(
                                      `/api/payroll/requests/${req.id}/reject`,
                                      { method: "PUT" }
                                    )
                                    refetchRequests()
                                  }}
                                  className="inline-flex items-center gap-1 rounded-lg bg-[#FEE2E2] px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-[#EF4444] uppercase transition-colors hover:bg-[#EF4444] hover:text-white"
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
        className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {[
                "Employee",
                "Role",
                "Basic",
                "Allowances",
                "Deductions",
                "Bonus",
                "Net Pay",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase ${["Role", "Basic", "Allowances", "Deductions", "Bonus"].includes(h) ? "hidden sm:table-cell" : ""}`}
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
            {PAYROLL.map((row) => (
              <motion.tr
                key={row.id}
                variants={fadeInUp}
                className="transition-colors hover:bg-[#F9FAFB]"
              >
                <td className="px-5 py-4 font-medium text-[#1A202C]">
                  {row.name}
                </td>
                <td className="hidden px-5 py-4 text-[#6B7280] sm:table-cell">
                  {row.role}
                </td>
                <td className="hidden px-5 py-4 text-[#6B7280] sm:table-cell">
                  {fmt(row.basic)}
                </td>
                <td className="hidden px-5 py-4 text-[#22C55E] sm:table-cell">
                  +{fmt(row.allowances)}
                </td>
                <td className="hidden px-5 py-4 text-[#EF4444] sm:table-cell">
                  -{fmt(row.deductions)}
                </td>
                <td className="hidden px-5 py-4 text-[#F59E0B] sm:table-cell">
                  {row.bonus > 0 ? fmt(row.bonus) : "—"}
                </td>
                <td className="px-5 py-4 font-bold text-[#1A202C]">
                  {fmt(row.netPay)}
                </td>
                <td className="px-5 py-4">
                  {isAdmin ? (
                    <motion.button
                      onClick={() => setPreviewSlip({ ...row, month, year })}
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
                      onView={() => setPreviewSlip({ ...row, month, year })}
                      onRefetch={refetchRequests}
                    />
                  )}
                </td>
              </motion.tr>
            ))}
            {PAYROLL.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-8 text-center text-sm text-[#9CA3AF]"
                >
                  No payroll data for {MONTHS[month - 1]} {year}.
                  {isAdmin ? ' Click "Generate Payslips" to create.' : ""}
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
              className="mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
                <h2 className="text-lg font-bold text-[#1A202C]">
                  Generate Payslips — {allEmployees.length} employees
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-xl leading-none text-[#6B7280] hover:text-[#1A202C]"
                >
                  &times;
                </button>
              </div>

              <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-6 py-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      allEmployees.length > 0 &&
                      allEmployees.every((e) => getEntry(e.id).checked)
                    }
                    onChange={() => {
                      const all = allEmployees.every(
                        (e) => getEntry(e.id).checked
                      )
                      const next: Record<
                        number,
                        { checked: boolean; bonus: string }
                      > = {}
                      for (const emp of allEmployees) {
                        next[emp.id] = { ...getEntry(emp.id), checked: !all }
                      }
                      setSelected(next)
                    }}
                    className="h-4 w-4 accent-[#22C55E]"
                  />
                  <span className="font-medium text-[#1A202C]">Select All</span>
                </label>
                <span className="text-[#6B7280]">
                  {allEmployees.filter((e) => getEntry(e.id).checked).length} /{" "}
                  {allEmployees.length} selected
                </span>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto px-6 py-3">
                {allEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className={`flex-col items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors sm:flex-row sm:items-center ${
                      getEntry(emp.id).checked
                        ? "border-[#22C55E] bg-[#F0FFF4]"
                        : "border-[#E5E7EB]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={getEntry(emp.id).checked}
                      onChange={() => toggleEmployee(emp.id)}
                      className="h-4 w-4 accent-[#22C55E]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#1A202C]">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {emp.department || "N/A"} —{" "}
                        {emp.salary != null ? fmt(Number(emp.salary)) : "N/A"}
                      </p>
                    </div>
                    <div className="flex w-full items-center gap-2 sm:w-auto">
                      <label className="shrink-0 text-xs font-medium text-[#6B7280]">
                        Bonus:
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={getEntry(emp.id).bonus}
                        onChange={(e) => setBonus(emp.id, e.target.value)}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-1.5 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none sm:w-28"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#6B7280] transition-colors hover:text-[#1A202C]"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="rounded-lg bg-[#22C55E] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A] disabled:bg-[#9CA3AF]"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {generating
                    ? "Generating..."
                    : `Generate (${allEmployees.filter((e) => getEntry(e.id).checked).length})`}
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
              className="mx-4 flex w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
                <h2 className="text-lg font-bold text-[#1A202C]">
                  Salary Slip — {previewSlip.name}
                </h2>
                <button
                  onClick={() => setPreviewSlip(null)}
                  className="text-xl leading-none text-[#6B7280] hover:text-[#1A202C]"
                >
                  &times;
                </button>
              </div>
              <div className="bg-[#F9FAFB] p-4">
                <motion.button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A]"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <IconPrinter size={16} />
                  Download PDF
                </motion.button>
              </div>
              <div className="max-h-[70vh] flex-1 p-4 pt-0">
                <iframe
                  ref={iframeRef}
                  srcDoc={generateSlipHTML({ ...previewSlip, month, year })}
                  className="h-full w-full rounded-lg border border-[#E5E7EB] bg-white"
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
