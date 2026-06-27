"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { IconArrowLeft, IconMail, IconPhone, IconBriefcase, IconCalendar, IconChecklist, IconLoader2, IconUserCheck, IconBuildingBank } from "@tabler/icons-react"
import { fadeInUp, staggerContainer, slideUp } from "@/lib/animation-variants"

export default function EmployeeProfilePage() {
  const params = useParams()
  const router = useRouter()
  const employeeId = params.id as string

  const { data: queryData, isLoading } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}`)
      if (!res.ok) throw new Error("Failed to fetch employee data")
      return res.json()
    },
  })

  const emp = queryData?.data

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <IconLoader2 size={32} className="animate-spin text-[#22C55E]" />
        <p className="text-[#6B7280] font-medium text-sm">Loading employee profile...</p>
      </div>
    )
  }

  if (!emp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="bg-[#FEE2E2] text-[#EF4444] p-4 rounded-xl font-medium">Employee not found.</div>
        <button onClick={() => router.back()} className="text-[#22C55E] hover:underline font-semibold text-sm">
          Go back
        </button>
      </div>
    )
  }

  const initials = `${emp.firstName?.[0] || ""}${emp.lastName?.[0] || ""}`

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-[#6B7280] hover:text-[#1A202C] transition-colors"
        variants={fadeInUp}
        whileHover={{ x: -2 }}
      >
        <IconArrowLeft size={16} />
        Back to Employees
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <motion.div
          className="lg:col-span-1 bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col items-center text-center relative overflow-hidden"
          variants={slideUp}
        >
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#22C55E]/10 to-[#16A34A]/5 z-0" />
          
          <motion.div
            className="h-28 w-28 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center z-10 mt-6 relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] opacity-10" />
            <span className="text-4xl font-extrabold bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-transparent bg-clip-text">
              {initials}
            </span>
          </motion.div>
          
          <div className="z-10 mt-5 w-full">
            <h1 className="text-2xl font-bold text-[#1A202C]">{emp.firstName} {emp.lastName}</h1>
            <p className="text-sm font-medium text-[#22C55E] mt-1 uppercase tracking-wide">{emp.designation || "Employee"}</p>
            
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="bg-[#EFF6FF] text-[#3B82F6] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {emp.user?.role || "USER"}
              </span>
              <span className="bg-[#DCFCE7] text-[#22C55E] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <IconUserCheck size={12} /> Active
              </span>
            </div>
          </div>

          <div className="w-full mt-8 space-y-4 z-10 text-left">
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
              <div className="h-10 w-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                <IconMail size={18} className="text-[#6B7280]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium text-[#1A202C] truncate">{emp.user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
              <div className="h-10 w-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                <IconPhone size={18} className="text-[#6B7280]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-[#1A202C] truncate">{emp.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F9FAFB] transition-colors">
              <div className="h-10 w-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center shrink-0">
                <IconBuildingBank size={18} className="text-[#6B7280]" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Department</p>
                <p className="text-sm font-medium text-[#1A202C] truncate">{emp.department || "Not Assigned"}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Stats */}
          <motion.div className="grid grid-cols-2 gap-4" variants={staggerContainer}>
            <motion.div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4" variants={slideUp}>
              <div className="h-12 w-12 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#3B82F6]">
                <IconCalendar size={24} stroke={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Joined Date</p>
                <p className="text-lg font-bold text-[#1A202C] mt-0.5">
                  {new Date(emp.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </motion.div>
            
            <motion.div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4" variants={slideUp}>
              <div className="h-12 w-12 rounded-xl bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6]">
                <IconChecklist size={24} stroke={1.5} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Total Tasks</p>
                <p className="text-lg font-bold text-[#1A202C] mt-0.5">{emp.tasks?.length || 0}</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Recent Tasks */}
          <motion.div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6" variants={slideUp}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1A202C] flex items-center gap-2">
                <IconChecklist className="text-[#22C55E]" size={20} /> Recent Tasks
              </h2>
            </div>
            
            {emp.tasks?.length > 0 ? (
              <div className="space-y-3">
                {emp.tasks.map((task: any) => (
                  <div key={task.id} className="flex items-center justify-between p-4 rounded-xl border border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors">
                    <div>
                      <p className="text-sm font-semibold text-[#1A202C]">{task.title}</p>
                      <p className="text-xs text-[#6B7280] mt-1 line-clamp-1">{task.description || "No description provided."}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${
                      task.status === "DONE" ? "bg-[#DCFCE7] text-[#22C55E]" : 
                      task.status === "IN_PROGRESS" ? "bg-[#FEF3C7] text-[#F59E0B]" : 
                      "bg-[#F3F4F6] text-[#6B7280]"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB]">
                <p className="text-sm font-medium text-[#6B7280]">No tasks assigned yet.</p>
              </div>
            )}
          </motion.div>

          {/* Recent Attendance */}
          <motion.div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6" variants={slideUp}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1A202C] flex items-center gap-2">
                <IconBriefcase className="text-[#3B82F6]" size={20} /> Recent Attendance
              </h2>
            </div>
            
            {emp.attendance?.length > 0 ? (
              <div className="overflow-hidden border border-[#F3F4F6] rounded-xl">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6]">
                    <tr>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    {emp.attendance.map((record: any) => (
                      <tr key={record.id} className="hover:bg-[#F9FAFB]/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-[#1A202C]">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            record.status === "PRESENT" ? "bg-[#DCFCE7] text-[#22C55E]" : 
                            "bg-[#FEE2E2] text-[#EF4444]"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB]">
                <p className="text-sm font-medium text-[#6B7280]">No attendance records found.</p>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </motion.div>
  )
}
