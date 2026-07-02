"use client"

import { motion } from "framer-motion"
import { IconCalendar, IconPlus } from "@tabler/icons-react"
import { useState, useEffect } from "react"
import { useAuth, useLeave } from "@/hooks/use-data"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Calendar } from "@workspace/ui/components/calendar"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-[#FEF3C7] text-[#F59E0B]",
  Approved: "bg-[#DCFCE7] text-[#22C55E]",
  Rejected: "bg-[#FEE2E2] text-[#EF4444]",
}

export default function LeaveManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leaveForm, setLeaveForm] = useState({
    type: "SICK",
    fromDate: "",
    toDate: "",
    days: 1,
    reason: "",
  })
  const { data: user } = useAuth()

  // Auto-calculate days when dates change
  useEffect(() => {
    if (leaveForm.fromDate && leaveForm.toDate) {
      const start = new Date(leaveForm.fromDate)
      const end = new Date(leaveForm.toDate)

      // Calculate difference in milliseconds
      const diffTime = end.getTime() - start.getTime()

      if (diffTime >= 0) {
        // Convert to days and add 1 (inclusive of start and end day)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
        setLeaveForm((prev) => ({ ...prev, days: diffDays }))
      } else {
        setLeaveForm((prev) => ({ ...prev, days: 0 }))
      }
    }
  }, [leaveForm.fromDate, leaveForm.toDate])

  const isAdmin = user?.role === "ADMIN"

  const { data: leaveData, refetch } = useLeave()

  const stats = leaveData?.stats || {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  }
  const LEAVES = leaveData?.requests || []

  const handleStatusUpdate = async (
    leaveId: number,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      await fetch("/api/leave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, status }),
      })
      refetch()
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.employee?.id) return

    try {
      await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: user.employee.id,
          ...leaveForm,
        }),
      })
      setIsModalOpen(false)
      setLeaveForm({
        type: "SICK",
        fromDate: "",
        toDate: "",
        days: 1,
        reason: "",
      })
      refetch()
    } catch (err) {
      console.error("Failed to apply leave", err)
    }
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
          <h1 className="text-2xl font-bold text-[#1A202C]">
            Leave Management
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Review and manage leave requests
          </p>
        </div>
        {!isAdmin && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <motion.button
                className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A]"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <IconPlus size={16} />
                Apply Leave
              </motion.button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden border border-[#E5E7EB] bg-white p-0 sm:max-w-[425px]">
              <DialogHeader className="border-b border-[#E5E7EB] p-5">
                <DialogTitle className="text-lg font-bold text-[#1A202C]">
                  Apply for Leave
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleApplyLeave} className="space-y-4 p-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#374151]">
                    Leave Type
                  </label>
                  <select
                    value={leaveForm.type}
                    onChange={(e) =>
                      setLeaveForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A202C] focus:ring-2 focus:ring-[#22C55E] focus:outline-none"
                    required
                  >
                    <option value="SICK">Sick Leave</option>
                    <option value="CASUAL">Casual Leave</option>
                    <option value="ANNUAL">Annual Leave</option>
                    <option value="UNPAID">Unpaid Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      From Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A202C] transition-colors hover:bg-[#F9FAFB]"
                        >
                          {leaveForm.fromDate &&
                          !isNaN(new Date(leaveForm.fromDate).getTime()) ? (
                            new Date(leaveForm.fromDate).toLocaleDateString(
                              "en-GB"
                            )
                          ) : (
                            <span className="text-[#9CA3AF]">dd/mm/yyyy</span>
                          )}
                          <IconCalendar size={16} className="text-[#9CA3AF]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="z-[100] w-auto p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            leaveForm.fromDate
                              ? new Date(leaveForm.fromDate)
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              setLeaveForm((prev) => ({
                                ...prev,
                                fromDate: format(date, "yyyy-MM-dd"),
                              }))
                            } else {
                              setLeaveForm((prev) => ({
                                ...prev,
                                fromDate: "",
                              }))
                            }
                          }}
                          // @ts-expect-error // TODO: fix later
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">
                      To Date
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex h-10 w-full items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A202C] transition-colors hover:bg-[#F9FAFB]"
                        >
                          {leaveForm.toDate &&
                          !isNaN(new Date(leaveForm.toDate).getTime()) ? (
                            new Date(leaveForm.toDate).toLocaleDateString(
                              "en-GB"
                            )
                          ) : (
                            <span className="text-[#9CA3AF]">dd/mm/yyyy</span>
                          )}
                          <IconCalendar size={16} className="text-[#9CA3AF]" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="z-[100] w-auto p-0"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={
                            leaveForm.toDate
                              ? new Date(leaveForm.toDate)
                              : undefined
                          }
                          onSelect={(date) => {
                            if (date) {
                              setLeaveForm((prev) => ({
                                ...prev,
                                toDate: format(date, "yyyy-MM-dd"),
                              }))
                            } else {
                              setLeaveForm((prev) => ({ ...prev, toDate: "" }))
                            }
                          }}
                          disabled={(date) =>
                            leaveForm.fromDate
                              ? date < new Date(leaveForm.fromDate)
                              : false
                          }
                          // @ts-expect-error // TODO: fix later
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#374151]">
                    Total Days
                  </label>
                  <input
                    type="number"
                    value={leaveForm.days}
                    className="w-full cursor-not-allowed rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-2 text-sm text-[#6B7280] focus:outline-none"
                    readOnly
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#374151]">
                    Reason
                  </label>
                  <textarea
                    rows={3}
                    value={leaveForm.reason}
                    onChange={(e) =>
                      setLeaveForm((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#1A202C] focus:ring-2 focus:ring-[#22C55E] focus:outline-none"
                    placeholder="Briefly explain the reason for your leave"
                    required
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#22C55E] py-2.5 font-semibold text-white transition-colors hover:bg-[#16A34A]"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <motion.div
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
        variants={staggerContainer}
      >
        {[
          {
            label: "Total",
            count: stats.total,
            style: "text-[#3B82F6] bg-[#EFF6FF]",
          },
          {
            label: "Pending",
            count: stats.pending,
            style: "text-[#F59E0B] bg-[#FEF3C7]",
          },
          {
            label: "Approved",
            count: stats.approved,
            style: "text-[#22C55E] bg-[#DCFCE7]",
          },
          {
            label: "Rejected",
            count: stats.rejected,
            style: "text-[#EF4444] bg-[#FEE2E2]",
          },
        ].map(({ label, count, style }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="mb-2 text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
              {label}
            </p>
            <motion.p
              className={`text-3xl font-bold ${style.split(" ")[0]}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              {count}
            </motion.p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {[
                "Employee",
                "Type",
                "From",
                "To",
                "Days",
                "Reason",
                "Status",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className={`px-5 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase ${["From", "To", "Days", "Reason"].includes(h) ? "hidden md:table-cell" : ""}`}
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
            {(
              LEAVES as Array<{
                id: number
                employee: { firstName: string; lastName: string }
                fromDate: string
                toDate: string
                days: number
                type: string
                reason?: string
                status: string
              }>
            ).map((row) => {
              const empName = `${row.employee.firstName} ${row.employee.lastName}`
              const fromStr = new Date(row.fromDate).toLocaleDateString("en-GB")
              const toStr = new Date(row.toDate).toLocaleDateString("en-GB")
              const statusDisplay =
                row.status === "PENDING"
                  ? "Pending"
                  : row.status === "APPROVED"
                    ? "Approved"
                    : "Rejected"

              const formatType = (t: string) => {
                if (t === "SICK") return "Sick Leave"
                if (t === "CASUAL") return "Casual Leave"
                if (t === "ANNUAL") return "Annual Leave"
                if (t === "UNPAID") return "Unpaid Leave"
                return t
              }

              return (
                <motion.tr
                  key={row.id}
                  variants={fadeInUp}
                  className="transition-colors hover:bg-[#F9FAFB]"
                >
                  <td className="px-5 py-4 font-medium text-[#1A202C]">
                    {empName}
                  </td>
                  <td className="px-5 py-4 text-[#6B7280]">
                    {formatType(row.type)}
                  </td>
                  <td className="hidden px-5 py-4 text-[#6B7280] md:table-cell">
                    {fromStr}
                  </td>
                  <td className="hidden px-5 py-4 text-[#6B7280] md:table-cell">
                    {toStr}
                  </td>
                  <td className="hidden px-5 py-4 text-[#6B7280] md:table-cell">
                    {row.days}
                  </td>
                  <td className="hidden max-w-[160px] truncate px-5 py-4 text-[#6B7280] md:table-cell">
                    {row.reason || "N/A"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[statusDisplay]}`}
                    >
                      {statusDisplay}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {isAdmin && row.status === "PENDING" ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <motion.button
                          onClick={() => handleStatusUpdate(row.id, "APPROVED")}
                          className="text-xs font-semibold text-[#22C55E] hover:underline"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Approve
                        </motion.button>
                        <motion.button
                          onClick={() => handleStatusUpdate(row.id, "REJECTED")}
                          className="text-xs font-semibold text-[#EF4444] hover:underline"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Reject
                        </motion.button>
                      </div>
                    ) : (
                      <span className="text-xs text-[#9CA3AF]">—</span>
                    )}
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
      </motion.div>
    </motion.div>
  )
}
