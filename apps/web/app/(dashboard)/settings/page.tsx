"use client"

import { motion } from "framer-motion"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { fadeInUp, staggerContainer, slideUp } from "@/lib/animation-variants"
import { IconSearch, IconLoader2, IconDeviceFloppy, IconUser, IconPhoto, IconCalendar, IconChecklist, IconClock, IconCash } from "@tabler/icons-react"

export default function SettingsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    aadharCard: "",
    panNumber: "",
    salary: "",
    department: "",
    designation: "",
    image: "",
  })

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

  const { data: employeesData } = useQuery({
    queryKey: ["EMPLOYEES"],
    queryFn: async () => {
      const res = await fetch("/api/employees")
      if (!res.ok) return { data: [] }
      return res.json()
    },
    enabled: isAdmin,
  })

  const employees: Array<{ id: number; firstName: string; lastName: string; user: { email: string } | null; department: string | null }> = employeesData?.data || []

  useEffect(() => {
    if (!isAdmin && currentUser?.employee?.id) {
      setSelectedId(currentUser.employee.id)
    }
  }, [isAdmin, currentUser?.employee?.id])

  const filtered = isAdmin
    ? employees.filter((emp) => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
          emp.firstName.toLowerCase().includes(q) ||
          emp.lastName.toLowerCase().includes(q) ||
          emp.user?.email?.toLowerCase().includes(q)
        )
      })
    : []

  const { data: profileData } = useQuery({
    queryKey: ["employeeDetail", selectedId],
    queryFn: async () => {
      if (!selectedId) return { data: null }
      const res = await fetch(`/api/employees/${selectedId}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: !!selectedId,
  })

  const emp = profileData?.data

  const loadEmployee = (id: number) => {
    setSelectedId(id)
    setSuccess("")
    setError("")
  }

  const handleSave = async () => {
    if (!selectedId) return
    setSaving(true)
    setSuccess("")
    setError("")
    try {
      const payload: Record<string, unknown> = {}
      if (form.firstName !== emp?.firstName) payload.firstName = form.firstName
      if (form.lastName !== emp?.lastName) payload.lastName = form.lastName
      if (form.phone !== (emp?.phone || "")) payload.phone = form.phone || null
      if (form.address !== (emp?.address || "")) payload.address = form.address || null
      if (form.aadharCard !== (emp?.aadharCard || "")) payload.aadharCard = form.aadharCard || null
      if (form.panNumber !== (emp?.panNumber || "")) payload.panNumber = form.panNumber || null
      if (form.salary !== (emp?.salary != null ? String(emp.salary) : "")) payload.salary = form.salary ? parseFloat(form.salary) : null
      if (form.department !== (emp?.department || "")) payload.department = form.department || null
      if (form.designation !== (emp?.designation || "")) payload.designation = form.designation || null
      if (form.image !== (emp?.image || "")) payload.image = form.image || null

      if (Object.keys(payload).length === 0) {
        setSuccess("No changes to save.")
        setSaving(false)
        return
      }

      const res = await fetch(`/api/employees/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to save")
      }

      setSuccess("Employee details saved successfully!")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  const setField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setForm((prev) => ({ ...prev, image: base64 }))
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (emp) {
      setForm({
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        phone: emp.phone || "",
        address: emp.address || "",
        aadharCard: emp.aadharCard || "",
        panNumber: emp.panNumber || "",
        salary: emp.salary != null ? String(emp.salary) : "",
        department: emp.department || "",
        designation: emp.designation || "",
        image: emp.image || "",
      })
    }
  }, [emp])

  return (
    <motion.div
      className="max-w-6xl mx-auto space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-[#1A202C]">Settings</h1>
        <p className="text-sm text-[#6B7280] mt-1">Manage employee details and account information</p>
      </motion.div>

      <div className={`grid ${isAdmin ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
        {/* Employee Selector — admin only */}
        {isAdmin && (
        <motion.div
          variants={slideUp}
          className="lg:col-span-1 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <div className="p-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#1A202C] text-sm flex items-center gap-2">
              <IconUser size={16} /> Select Employee
            </h2>
          </div>
          <div className="p-3 border-b border-[#E5E7EB]">
            <div className="relative">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
              />
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {filtered.map((emp) => (
              <button
                key={emp.id}
                onClick={() => loadEmployee(emp.id)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] ${
                  selectedId === emp.id ? "bg-[#DCFCE7] border-l-2 border-l-[#22C55E]" : ""
                }`}
              >
                <span className="font-medium text-[#1A202C] block">{emp.firstName} {emp.lastName}</span>
                <span className="text-[11px] text-[#9CA3AF]">{emp.user?.email || ""}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-[#6B7280] text-center py-8">No employees found.</p>
            )}
          </div>
        </motion.div>
        )}

        {/* Edit Form */}
        <motion.div
          variants={slideUp}
          className={`${isAdmin ? "lg:col-span-2" : "lg:col-span-1"} bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}
        >
          {selectedId && emp ? (
            <div>
              <div className="p-5 border-b border-[#E5E7EB]">
                <h2 className="font-semibold text-[#1A202C]">
                  {emp.firstName} {emp.lastName}
                </h2>
                <p className="text-xs text-[#6B7280] mt-0.5">{emp.user?.email}</p>
              </div>

              {success && (
                <div className="mx-5 mt-4 p-3 bg-[#DCFCE7] text-[#22C55E] text-sm font-medium rounded-lg">{success}</div>
              )}
              {error && (
                <div className="mx-5 mt-4 p-3 bg-[#FEE2E2] text-[#EF4444] text-sm font-medium rounded-lg">{error}</div>
              )}

              <div className="p-5 space-y-6">
                {/* Profile Image & Personal Info */}
                <div className="flex gap-6">
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <div className="h-24 w-24 rounded-full bg-[#DCFCE7] flex items-center justify-center overflow-hidden border-2 border-[#E5E7EB]">
                      {form.image ? (
                        <img src={form.image} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-[#22C55E]">
                          {(emp.firstName?.[0] || "").toUpperCase()}
                        </span>
                      )}
                    </div>
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <span className="text-xs font-semibold text-[#22C55E] hover:underline flex items-center gap-1">
                        <IconPhoto size={14} /> Upload Photo
                      </span>
                    </label>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">Profile Image</label>
                    <p className="text-xs text-[#9CA3AF]">Upload a photo to set as profile image. The image will be stored as base64.</p>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Personal Info</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">First Name</label>
                      <input
                        value={form.firstName}
                        onChange={setField("firstName")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">Last Name</label>
                      <input
                        value={form.lastName}
                        onChange={setField("lastName")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">Phone</label>
                      <input
                        value={form.phone}
                        onChange={setField("phone")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">Department</label>
                      <input
                        value={form.department}
                        onChange={setField("department")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">Designation</label>
                      <input
                        value={form.designation}
                        onChange={setField("designation")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">Address</label>
                      <input
                        value={form.address}
                        onChange={setField("address")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">Aadhar Card Number</label>
                      <input
                        value={form.aadharCard}
                        onChange={setField("aadharCard")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">PAN Number</label>
                      <input
                        value={form.panNumber}
                        onChange={setField("panNumber")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Financial</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#1A202C] mb-1.5">Salary (₹)</label>
                      <input
                        type="number"
                        value={form.salary}
                        onChange={setField("salary")}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm text-[#1A202C] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">Statistics (read-only)</h3>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#3B82F6]">{emp.totalAttendance ?? 0}</p>
                      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Attendance</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#F59E0B]">{emp.totalLeaves ?? 0}</p>
                      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Leaves</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#22C55E]">{emp.totalCheckIns ?? 0}</p>
                      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Check-ins</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#EF4444]">{emp.totalCheckOuts ?? 0}</p>
                      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Check-outs</p>
                    </div>
                    <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#8B5CF6]">{emp.totalTasks ?? 0}</p>
                      <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mt-0.5">Tasks</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider flex items-center gap-1">
                      <IconCash size={14} /> Bonus (on profile)
                    </span>
                    <span className="text-lg font-bold text-[#1A202C]">₹{(emp.bonus ? Number(emp.bonus) : 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="px-5 pb-5">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] disabled:bg-[#9CA3AF] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {saving ? (
                    <IconLoader2 size={16} className="animate-spin" />
                  ) : (
                    <IconDeviceFloppy size={16} />
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <IconUser size={40} className="text-[#D1D5DB] mb-3" />
              <p className="text-sm font-medium text-[#6B7280]">Select an employee from the list</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Choose an employee to view and edit their details</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
