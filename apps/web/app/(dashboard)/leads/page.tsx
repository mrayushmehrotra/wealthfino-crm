"use client"

import { motion } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import {
  IconUpload,
  IconUserPlus,
  IconSearch,
  IconLoader2,
  IconTrash,
  IconCheck,
} from "@tabler/icons-react"
import { useAuth, useEmployees } from "@/hooks/use-data"
import { MultiSelect } from "@/components/ui/multiselect-combobox"
import { fadeInUp, staggerContainer, slideUp } from "@/lib/animation-variants"

interface Lead {
  id: number
  name: string
  email: string | null
  phone: string | null
  source: string | null
  status: string
  notes: string | null
  assignedTo: number | null
  assignedEmployee: { id: number; firstName: string; lastName: string } | null
  createdAt: string
}

export default function LeadsPage() {
  const { data: user } = useAuth()
  const { data: employees } = useEmployees()
  const isAdmin = user?.role === "ADMIN"

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState("")
  const [deleting, setDeleting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const defaultAssignee = employees.find(
    (emp) =>
      emp.user?.role === "ADMIN" ||
      `${emp.firstName} ${emp.lastName}`.toLowerCase() === "krishna pathak"
  )

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/leads")
      const data = await res.json()
      if (data.success) setLeads(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [isAdmin])

  useEffect(() => {
    if (isAdmin && employees.length > 0 && selectedEmployeeIds.length === 0) {
      setSelectedEmployeeIds([String(defaultAssignee?.id || employees[0]!.id)])
    }
  }, [isAdmin, employees, selectedEmployeeIds.length, defaultAssignee?.id])

  const filtered = leads.filter((l) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.name.toLowerCase().includes(q) ||
      (l.email || "").toLowerCase().includes(q) ||
      (l.phone || "").includes(q)
    )
  })

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filtered.map((l) => l.id)))
    }
  }

  const handleAssign = async () => {
    const employeeTargets =
      selectedEmployeeIds.length > 0
        ? selectedEmployeeIds
        : [String(defaultAssignee?.id || employees[0]?.id || 0)]

    if (selectedIds.size === 0 || employeeTargets.length === 0) return
    try {
      const res = await fetch("/api/leads/assign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: Array.from(selectedIds),
          employeeIds: employeeTargets.map((id) => Number(id)),
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSelectedIds(new Set())
        fetchLeads()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadMsg("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/leads/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setUploadMsg(data.message)
        fetchLeads()
      } else {
        setUploadMsg(data.error || "Upload failed")
      }
    } catch {
      setUploadMsg("Upload failed")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lead?")) return
    setDeleting(true)
    try {
      await fetch(`/api/leads?id=${id}`, { method: "DELETE" })
      fetchLeads()
    } finally {
      setDeleting(false)
    }
  }

  const getAssigneeName = (lead: Lead) => {
    if (!lead.assignedEmployee) return "Unassigned"
    return `${lead.assignedEmployee.firstName} ${lead.assignedEmployee.lastName}`
  }

  return (
    <motion.div
      className="mx-auto max-w-7xl space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex items-center justify-between"
        variants={fadeInUp}
      >
        <div>
          <h1 className="text-2xl font-bold text-[#1A202C]">Leads</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            {isAdmin
              ? "Manage and assign leads to employees"
              : "Your assigned leads"}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleUpload}
              className="hidden"
            />
            <motion.button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 rounded-lg bg-[#0A2C72] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0A1D4E] disabled:opacity-50"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {uploading ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconUpload size={16} />
              )}
              {uploading ? "Uploading..." : "Upload CSV"}
            </motion.button>
          </div>
        )}
      </motion.div>

      {uploadMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-[#DCFCE7] p-3 text-sm font-medium text-[#16A34A]"
        >
          {uploadMsg}
        </motion.div>
      )}

      {/* Assign bar — admin only, visible when leads selected */}
      {isAdmin && selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-[#E5E7EB] bg-[#F0F4FF] p-4"
        >
          <span className="text-sm font-medium text-[#0A2C72]">
            {selectedIds.size} lead(s) selected
          </span>
          <div className="min-w-[280px] flex-1">
            <MultiSelect
              options={[
                { label: "Unassign", value: "0" },
                ...(defaultAssignee
                  ? [
                      {
                        label: `${defaultAssignee.firstName} ${defaultAssignee.lastName} (Default)`,
                        value: String(defaultAssignee.id),
                      },
                    ]
                  : []),
                ...employees
                  .filter((emp) => emp.id !== defaultAssignee?.id)
                  .map((emp) => ({
                    label: `${emp.firstName} ${emp.lastName}`,
                    value: String(emp.id),
                  })),
              ]}
              selected={selectedEmployeeIds}
              onChange={setSelectedEmployeeIds}
              placeholder="Select employees..."
            />
          </div>
          <motion.button
            onClick={handleAssign}
            disabled={selectedEmployeeIds.length === 0}
            className="flex items-center gap-1.5 rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A]"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <IconCheck size={16} />
            Assign
          </motion.button>
        </motion.div>
      )}

      <motion.div
        className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        variants={slideUp}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <IconLoader2 size={32} className="animate-spin text-[#22C55E]" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-3">
              <div className="relative flex-1">
                <IconSearch
                  size={16}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] py-2 pr-3 pl-9 text-sm focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                />
              </div>
              <span className="text-xs text-[#9CA3AF]">
                {filtered.length} lead(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E7EB]">
                    {isAdmin && (
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={
                            selectedIds.size === filtered.length &&
                            filtered.length > 0
                          }
                          onChange={toggleAll}
                          className="rounded border-[#D1D5DB] accent-[#22C55E]"
                        />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                      Name
                    </th>
                    <th className="hidden px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase sm:table-cell">
                      Email
                    </th>
                    <th className="hidden px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase md:table-cell">
                      Phone
                    </th>
                    <th className="hidden px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase md:table-cell">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                      Status
                    </th>
                    {isAdmin && (
                      <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                        Assigned To
                      </th>
                    )}
                    {isAdmin && <th className="w-16 px-4 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={isAdmin ? 7 : 5}
                        className="px-4 py-12 text-center text-sm text-[#6B7280]"
                      >
                        {isAdmin
                          ? "No leads yet. Upload a CSV to get started."
                          : "No leads assigned to you."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((lead) => (
                      <tr
                        key={lead.id}
                        className="transition-colors hover:bg-[#F9FAFB]"
                      >
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(lead.id)}
                              onChange={() => toggleSelect(lead.id)}
                              className="rounded border-[#D1D5DB] accent-[#22C55E]"
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 font-medium text-[#1A202C]">
                          {lead.name}
                        </td>
                        <td className="hidden px-4 py-3 text-[#6B7280] sm:table-cell">
                          {lead.email || "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-[#6B7280] md:table-cell">
                          {lead.phone || "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-[#6B7280] md:table-cell">
                          {lead.source || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-xs font-semibold text-[#22C55E]">
                            {lead.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-sm text-[#6B7280]">
                            {getAssigneeName(lead)}
                          </td>
                        )}
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDelete(lead.id)}
                              disabled={deleting}
                              className="rounded-lg p-1.5 text-[#9CA3AF] transition-colors hover:bg-[#FEE2E2] hover:text-[#EF4444]"
                            >
                              <IconTrash size={15} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
