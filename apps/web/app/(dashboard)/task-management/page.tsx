"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { IconPlus, IconX, IconPlayerPlay, IconCheck, IconPlayerStop } from "@tabler/icons-react"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"

const STATUS_STYLES: Record<string, string> = {
  "IN_PROGRESS": "bg-[#FEF3C7] text-[#F59E0B]",
  "TODO": "bg-[#F3F4F6] text-[#6B7280]",
  "DONE": "bg-[#DCFCE7] text-[#22C55E]",
}

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-[#FEE2E2] text-[#EF4444]",
  MEDIUM: "bg-[#FEF3C7] text-[#F59E0B]",
  LOW: "bg-[#F3F4F6] text-[#6B7280]",
}

export default function TaskManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ title: "", description: "", employeeId: "", dueDate: "", priority: "MEDIUM" })

  const { data: userProfile } = useQuery({
    queryKey: ["sidebarProfile"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      return res.json()
    }
  })
  const isAdmin = userProfile?.data?.role === "ADMIN"

  const { data: queryData, isLoading, refetch } = useQuery({
    queryKey: ["TASKS"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })
  const TASKS = queryData?.data?.tasks || []
  const stats = queryData?.data?.stats || { total: 0, inProgress: 0, done: 0 }

  const { data: employeesData } = useQuery({
    queryKey: ["EMPLOYEES_LIST"],
    queryFn: async () => {
      const res = await fetch("/api/employees")
      return res.json()
    },
    enabled: isAdmin,
  })
  const employees = employeesData?.data || []

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      setIsModalOpen(false)
      setFormData({ title: "", description: "", employeeId: "", dueDate: "", priority: "MEDIUM" })
      refetch()
    } catch (error) {
      console.error("Failed to create task", error)
    }
  }

  const handleUpdateStatus = async (taskId: number, newStatus: string) => {
    try {
      await fetch("/api/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus })
      })
      refetch()
    } catch (error) {
      console.error("Failed to update status", error)
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
          <h1 className="text-2xl font-bold text-[#1A202C]">Task Management</h1>
          <p className="text-sm text-[#6B7280] mt-1">Track and assign tasks across the team</p>
        </div>
        {isAdmin && (
          <motion.button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconPlus size={16} />
            New Task
          </motion.button>
        )}
      </motion.div>

      <motion.div className="grid grid-cols-3 gap-4" variants={staggerContainer}>
        {[
          { label: "Total", value: stats.total },
          { label: "In Progress", value: stats.inProgress },
          { label: "Done", value: stats.done },
        ].map(({ label, value }) => (
          <motion.div
            key={label}
            variants={slideUp}
            whileHover={{ y: -3 }}
            className="bg-white rounded-xl border border-[#E5E7EB] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
          >
            <p className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-2">
              {label}
            </p>
            <p className="text-3xl font-bold text-[#1A202C]">{value}</p>
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
              {["Task", "Assignee", "Due Date", "Priority", "Status", "Action"].map((h) => (
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
            {TASKS.map((task: any) => (
              <motion.tr
                key={task.id}
                variants={fadeInUp}
                className="hover:bg-[#F9FAFB] transition-colors"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-[#1A202C]">{task.title}</p>
                  <p className="text-[10px] text-[#9CA3AF] line-clamp-1">{task.description}</p>
                </td>
                <td className="px-5 py-4 text-[#6B7280]">
                  {task.employee.firstName} {task.employee.lastName}
                </td>
                <td className="px-5 py-4 text-[#6B7280]">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${PRIORITY_STYLES[task.priority]}`}
                  >
                    {task.priority}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${STATUS_STYLES[task.status]}`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {!isAdmin && task.status === "TODO" && (
                    <motion.button
                      onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                      className="flex items-center gap-1 text-xs font-semibold text-[#3B82F6] hover:underline"
                      whileHover={{ scale: 1.05 }}
                    >
                      <IconPlayerPlay size={14} /> Start Timer
                    </motion.button>
                  )}
                  {!isAdmin && task.status === "IN_PROGRESS" && (
                    <motion.button
                      onClick={() => handleUpdateStatus(task.id, "DONE")}
                      className="flex items-center gap-1 text-xs font-semibold text-[#F59E0B] hover:underline"
                      whileHover={{ scale: 1.05 }}
                    >
                      <IconPlayerStop size={14} /> Stop & Complete
                    </motion.button>
                  )}
                  {task.status === "DONE" && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#22C55E]">
                      <IconCheck size={14} /> Completed
                    </span>
                  )}
                  {isAdmin && task.status !== "DONE" && (
                    <span className="text-xs text-[#9CA3AF] italic">Awaiting action...</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </motion.div>

      {/* Admin Task Creation Modal */}
      <AnimatePresence>
        {isModalOpen && isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB]">
                <h2 className="text-lg font-bold text-[#1A202C]">Assign New Task</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-[#9CA3AF] hover:text-[#EF4444] rounded-lg transition-colors"
                >
                  <IconX size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                    Task Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                    placeholder="e.g. Design Landing Page"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                    placeholder="Add more details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                      Assign To
                    </label>
                    <select
                      required
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                    >
                      <option value="" disabled>Select Employee</option>
                      {employees.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                  />
                </div>
                <div className="pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 rounded-lg bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-sm transition-colors"
                  >
                    Assign Task
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
