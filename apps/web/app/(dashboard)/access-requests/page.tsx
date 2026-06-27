"use client"

import { motion } from "framer-motion"
import { IconUsers, IconCheck, IconX, IconSearch, IconLoader2 } from "@tabler/icons-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fadeInUp,
  staggerContainer,
  slideUp,
  staggerFast,
} from "@/lib/animation-variants"

export default function AccessRequestsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["accessRequests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/access-requests")
      if (!res.ok) throw new Error("Failed to fetch requests")
      return res.json()
    },
  })

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "approve" | "reject" }) => {
      const res = await fetch(`/api/admin/access-requests/${id}/${action}`, {
        method: "PUT",
      })
      if (!res.ok) throw new Error("Action failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessRequests"] })
    },
  })

  const requests = data?.data || []

  return (
    <motion.div
      className="max-w-7xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Access Requests</h1>
          <p className="text-sm text-[#6B7280] mt-1">Review and approve employee signups</p>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden"
        variants={slideUp}
      >
        <div className="p-4 border-b border-[#E5E7EB]">
          <div className="relative max-w-sm">
            <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <motion.input
              type="text"
              placeholder="Search requests..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E] transition-colors"
              whileFocus={{ scale: 1.01 }}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                {["Employee Name", "Email", "Role", "Requested On", "Actions"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-5 py-3"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            
            {isLoading ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6B7280]">
                    <IconLoader2 className="mx-auto animate-spin mb-2" size={24} />
                    Loading requests...
                  </td>
                </tr>
              </tbody>
            ) : requests.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6B7280]">
                    No pending access requests at the moment.
                  </td>
                </tr>
              </tbody>
            ) : (
              <motion.tbody
                className="divide-y divide-[#F3F4F6]"
                variants={staggerFast}
              >
                {requests.map((req: any) => (
                  <motion.tr
                    key={req.id}
                    variants={fadeInUp}
                    className="hover:bg-[#F9FAFB] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="h-8 w-8 rounded-full bg-[#EFF6FF] flex items-center justify-center"
                          whileHover={{ scale: 1.15 }}
                        >
                          <span className="text-xs font-bold text-[#3B82F6]">
                            {req.employee?.firstName?.[0] || "?"}
                          </span>
                        </motion.div>
                        <span className="font-medium text-[#1A202C]">
                          {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#6B7280]">{req.email}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#F59E0B]">
                        {req.role} (Pending)
                      </span>
                    </td>
                    <td className="px-5 py-4 text-[#6B7280]">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => actionMutation.mutate({ id: req.id, action: "approve" })}
                          disabled={actionMutation.isPending}
                          className="flex items-center gap-1 text-xs font-semibold bg-[#DCFCE7] text-[#22C55E] px-3 py-1.5 rounded-lg hover:bg-[#22C55E] hover:text-white transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconCheck size={14} />
                          Approve
                        </motion.button>
                        <motion.button
                          onClick={() => actionMutation.mutate({ id: req.id, action: "reject" })}
                          disabled={actionMutation.isPending}
                          className="flex items-center gap-1 text-xs font-semibold bg-[#FEE2E2] text-[#EF4444] px-3 py-1.5 rounded-lg hover:bg-[#EF4444] hover:text-white transition-colors disabled:opacity-50"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <IconX size={14} />
                          Reject
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            )}
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
