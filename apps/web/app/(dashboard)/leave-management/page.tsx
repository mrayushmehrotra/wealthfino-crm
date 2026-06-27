"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { IconPlus } from "@tabler/icons-react"
import { useState } from "react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"
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
    type: "Sick Leave",
    fromDate: "",
    toDate: "",
    days: 1,
    reason: ""
  })
  const { data: userProfile } = useQuery({
    queryKey: ["sidebarProfile"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      return res.json()
    },
  })
  
  const isAdmin = userProfile?.data?.role === "ADMIN"

  const { data: queryData, refetch } = useQuery({
    queryKey: ["LEAVES"],
    queryFn: async () => {
      const res = await fetch("/api/leave")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })
  
  const stats = queryData?.data?.stats || { pending: 0, approved: 0, rejected: 0 }
  const LEAVES = queryData?.data?.requests || []

  const handleStatusUpdate = async (leaveId: number, status: "APPROVED" | "REJECTED") => {
    try {
      await fetch("/api/leave", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, status })
      })
      refetch()
    } catch (err) {
      console.error("Failed to update status", err)
    }
  }

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.data?.employee?.id) return

    try {
      await fetch("/api/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: userProfile.data.employee.id,
          ...leaveForm
        })
      })
      setIsModalOpen(false)
      setLeaveForm({ type: "Sick Leave", fromDate: "", toDate: "", days: 1, reason: "" })
      refetch()
    } catch (err) {
      console.error("Failed to apply leave", err)
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
          <h1 className="text-2xl font-bold text-[#1A202C]">Leave Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">Review and manage leave requests</p>
        </div>
        {!isAdmin && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <motion.button
                className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <IconPlus size={16} />
                Apply Leave
              </motion.button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border border-[#E5E7EB] p-0 overflow-hidden">
              <DialogHeader className="p-5 border-b border-[#E5E7EB]">
                <DialogTitle className="text-lg font-bold text-[#1A202C]">Apply for Leave</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleApplyLeave} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#374151]">Leave Type</label>
                  <select 
                    value={leaveForm.type}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                  >
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Paid Leave">Paid Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">From Date</label>
                    <input 
                      type="date"
                      value={leaveForm.fromDate}
                      onChange={(e) => setLeaveForm(prev => ({ ...prev, fromDate: e.target.value }))}
                      className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-[#374151]">To Date</label>
                    <input 
                      type="date"
                      value={leaveForm.toDate}
                      onChange={(e) => setLeaveForm(prev => ({ ...prev, toDate: e.target.value }))}
                      className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#374151]">Total Days</label>
                  <input 
                    type="number"
                    min="1"
                    value={leaveForm.days}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, days: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-[#374151]">Reason</label>
                  <textarea 
                    rows={3}
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E] resize-none"
                    placeholder="Briefly explain the reason for your leave"
                    required
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold py-2.5 rounded-lg transition-colors"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainer}>
        {[
          { label: "Pending", count: stats.pending, style: "text-[#F59E0B] bg-[#FEF3C7]" },
          { label: "Approved", count: stats.approved, style: "text-[#22C55E] bg-[#DCFCE7]" },
          { label: "Rejected", count: stats.rejected, style: "text-[#EF4444] bg-[#FEE2E2]" },
        ].map(({ label, count, style }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
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
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={slideUp}
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {["Employee", "Type", "From", "To", "Days", "Reason", "Status", "Action"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody className="divide-y divide-[#F3F4F6]" variants={staggerFast}>
            {(LEAVES as Array<{ id: number; employee: { firstName: string; lastName: string }; fromDate: string; toDate: string; days: number; type: string; reason?: string; status: string }>).map((row) => {
              const empName = `${row.employee.firstName} ${row.employee.lastName}`
              const fromStr = new Date(row.fromDate).toLocaleDateString()
              const toStr = new Date(row.toDate).toLocaleDateString()
              const statusDisplay = row.status === "PENDING" ? "Pending" : row.status === "APPROVED" ? "Approved" : "Rejected"

              return (
                <motion.tr
                  key={row.id}
                  variants={fadeInUp}
                  className="hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="px-5 py-4 font-medium text-[#1A202C]">{empName}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{row.type}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{fromStr}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{toStr}</td>
                  <td className="px-5 py-4 text-[#6B7280]">{row.days}</td>
                  <td className="px-5 py-4 text-[#6B7280] max-w-[160px] truncate">{row.reason || "N/A"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[statusDisplay]}`}
                    >
                      {statusDisplay}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {isAdmin && row.status === "PENDING" ? (
                      <div className="flex gap-2">
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
