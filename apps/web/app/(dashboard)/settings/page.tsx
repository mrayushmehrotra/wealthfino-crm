"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { useAtom } from "jotai"
import { useQueryClient } from "@tanstack/react-query"
import { employeeDetailIdAtom } from "@/store/atoms"
import { useAuth, useEmployees, useEmployeeDetail } from "@/hooks/use-data"
import {
  getPushSubscriptionState,
  unsubscribeFromPush,
} from "@/components/push-notification-bootstrap"
import { fadeInUp, staggerContainer, slideUp } from "@/lib/animation-variants"
import {
  IconSearch,
  IconLoader2,
  IconDeviceFloppy,
  IconUser,
  IconPhoto,
  IconCalendar,
  IconChecklist,
  IconClock,
  IconCash,
  IconBell,
  IconBellOff,
  IconDeviceMobile,
  IconReceipt,
  IconPercentage,
  IconCurrencyRupee,
} from "@tabler/icons-react"
export default function SettingsPage() {
  const [selectedId, setSelectedId] = useAtom(employeeDetailIdAtom)
  const [searchQuery, setSearchQuery] = useState("")
  const [saving, setSaving] = useState(false)
  const [freezing, setFreezing] = useState(false)
  const [pushSaving, setPushSaving] = useState(false)
  const [pushState, setPushState] = useState<
    "enabled" | "disabled" | "denied" | "unsupported" | "loading"
  >("loading")
  const [showFreezeModal, setShowFreezeModal] = useState(false)
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

  // Salary Template state (admin only)
  const [salaryTemplate, setSalaryTemplate] = useState({
    hraPercent: "45",       // % of allowances -> HRA
    specialPercent: "35",   // % of allowances -> Special Allowance
    conveyancePercent: "12",// % of allowances -> Conveyance
    // remaining -> Medical (auto-calculated)
    allowancePercent: "10", // allowances = basic * this %
    deductionPercent: "5",  // deductions = basic * this %
    pfPercent: "50",        // % of deductions -> PF
    ptPercent: "30",        // % of deductions -> Professional Tax
    // remaining -> TDS
    defaultBonus: "0",      // default bonus in ₹
  })
  const [templateSaving, setTemplateSaving] = useState(false)
  const [templateMsg, setTemplateMsg] = useState("")
  const [templateError, setTemplateError] = useState("")

  const setTemplateField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryTemplate((prev) => ({ ...prev, [field]: e.target.value }))
    setTemplateMsg("")
    setTemplateError("")
  }

  const handleSaveTemplate = async () => {
    setTemplateSaving(true)
    setTemplateMsg("")
    setTemplateError("")
    try {
      // Validate percents add up correctly
      const hra = Number(salaryTemplate.hraPercent)
      const special = Number(salaryTemplate.specialPercent)
      const conveyance = Number(salaryTemplate.conveyancePercent)
      if (hra + special + conveyance > 100) {
        throw new Error("HRA + Special + Conveyance cannot exceed 100% of allowances")
      }
      const pf = Number(salaryTemplate.pfPercent)
      const pt = Number(salaryTemplate.ptPercent)
      if (pf + pt > 100) {
        throw new Error("PF + Professional Tax cannot exceed 100% of deductions")
      }
      // Save to localStorage for now (can be moved to DB later)
      localStorage.setItem("salary_template", JSON.stringify(salaryTemplate))
      setTemplateMsg("Salary template saved successfully!")
    } catch (err: unknown) {
      setTemplateError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setTemplateSaving(false)
    }
  }

  // Load saved template on mount
  useEffect(() => {
    const saved = localStorage.getItem("salary_template")
    if (saved) {
      try {
        setSalaryTemplate(JSON.parse(saved))
      } catch {}
    }
  }, [])

  const queryClient = useQueryClient()

  const { data: user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const { data: employees, isPending: employeesLoading } = useEmployees()

  useEffect(() => {
    if (!isAdmin && user?.employee?.id) {
      setSelectedId(user.employee.id)
    }
  }, [isAdmin, user?.employee?.id])

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

  const { data: emp } = useEmployeeDetail()

  const loadEmployee = (id: number) => {
    setSelectedId(id)
    setSuccess("")
    setError("")
  }

  const isFrozen = emp?.user?.frozen ?? false

  useEffect(() => {
    let mounted = true
    const loadPushState = async () => {
      const state = await getPushSubscriptionState().catch(
        () => "unsupported" as const
      )
      if (mounted) setPushState(state)
    }
    loadPushState()
    return () => {
      mounted = false
    }
  }, [])

  const handleFreeze = async () => {
    if (!selectedId) return
    setFreezing(true)
    setSuccess("")
    setError("")
    try {
      const res = await fetch(`/api/employees/${selectedId}/freeze`, {
        method: "PATCH",
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || "Failed to update account status")
      }
      const json = await res.json()
      setShowFreezeModal(false)
      setSuccess(json.message || "Account status updated.")
      queryClient.invalidateQueries({
        queryKey: ["employeeDetail", selectedId],
      })
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setFreezing(false)
    }
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
      if (form.address !== (emp?.address || ""))
        payload.address = form.address || null
      if (form.aadharCard !== (emp?.aadharCard || ""))
        payload.aadharCard = form.aadharCard || null
      if (form.panNumber !== (emp?.panNumber || ""))
        payload.panNumber = form.panNumber || null
      if (form.salary !== (emp?.salary != null ? String(emp.salary) : ""))
        payload.salary = form.salary ? parseFloat(form.salary) : null
      if (form.department !== (emp?.department || ""))
        payload.department = form.department || null
      if (form.designation !== (emp?.designation || ""))
        payload.designation = form.designation || null
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

  const setField =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
    }

  const handleEnablePush = async () => {
    setPushSaving(true)
    setError("")
    setSuccess("")
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        throw new Error("This browser does not support push notifications.")
      }

      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setPushState(permission === "denied" ? "denied" : "disabled")
        throw new Error("Notification permission was not granted.")
      }

      const registration = await navigator.serviceWorker.ready
      const existing = await registration.pushManager.getSubscription()
      if (existing) {
        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(existing.toJSON()),
        })
        setPushState("enabled")
        setSuccess("Push notifications are already enabled.")
        return
      }

      const publicKeyRes = await fetch("/api/push/public-key", {
        cache: "no-store",
      })
      if (!publicKeyRes.ok) throw new Error("Failed to load push key.")
      const publicKeyData = await publicKeyRes.json()
      const publicKey = publicKeyData?.data?.publicKey
      if (!publicKey) throw new Error("Push key is missing.")

      const base64ToUint8Array = (base64String: string) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
        const base64 = (base64String + padding)
          .replace(/-/g, "+")
          .replace(/_/g, "/")
        const raw = window.atob(base64)
        return Uint8Array.from(raw, (char) => char.charCodeAt(0))
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToUint8Array(publicKey),
      })

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      })
      if (!res.ok) throw new Error("Failed to save subscription.")

      setPushState("enabled")
      setSuccess("Push notifications enabled for this device.")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setPushSaving(false)
    }
  }

  const handleDisablePush = async () => {
    setPushSaving(true)
    setError("")
    setSuccess("")
    try {
      const disabled = await unsubscribeFromPush()
      if (!disabled) throw new Error("No push subscription found.")
      setPushState("disabled")
      setSuccess("Push notifications disabled for this device.")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setPushSaving(false)
    }
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
      className="mx-auto max-w-6xl space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-[#1A202C]">Settings</h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Manage employee details and account information
        </p>
      </motion.div>

      <motion.div
        variants={slideUp}
        className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
      >
        <div className="flex flex-col gap-4 border-b border-[#E5E7EB] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DCFCE7]">
              <IconBell size={20} className="text-[#22C55E]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1A202C]">
                Push notifications
              </h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Get announcement alerts on this installed web app.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#6B7280]">
              {pushState === "enabled"
                ? "Enabled"
                : pushState === "denied"
                  ? "Blocked"
                  : pushState === "unsupported"
                    ? "Unsupported"
                    : "Disabled"}
            </span>
            {pushState === "enabled" ? (
              <button
                type="button"
                onClick={handleDisablePush}
                disabled={pushSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm font-semibold text-[#1A202C] transition-colors hover:bg-[#F9FAFB] disabled:opacity-60"
              >
                <IconBellOff size={16} />
                {pushSaving ? "Disabling..." : "Disable"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={pushSaving || pushState === "unsupported"}
                className="inline-flex items-center gap-2 rounded-lg bg-[#22C55E] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A] disabled:bg-[#9CA3AF]"
              >
                <IconDeviceMobile size={16} />
                {pushSaving ? "Enabling..." : "Enable on this device"}
              </button>
            )}
          </div>
        </div>
        <div className="p-5 text-sm text-[#6B7280]">
          {pushState === "enabled"
            ? "This device will receive announcement push notifications."
            : pushState === "denied"
              ? "Notifications are blocked in the browser. Re-enable them in browser settings to receive alerts."
              : pushState === "unsupported"
                ? "This browser does not support push notifications."
                : "Enable notifications to receive announcement push alerts on this device."}
        </div>
      </motion.div>

      <div
        className={`grid ${isAdmin ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
      >
        {/* Employee Selector — admin only */}
        {isAdmin && (
          <motion.div
            variants={slideUp}
            className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] lg:col-span-1"
          >
            <div className="border-b border-[#E5E7EB] p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1A202C]">
                <IconUser size={16} /> Select Employee
              </h2>
            </div>
            <div className="border-b border-[#E5E7EB] p-3">
              <div className="relative">
                <IconSearch
                  size={14}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-[#9CA3AF]"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7EB] py-2 pr-3 pl-8 text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                />
              </div>
            </div>
            <div className="max-h-[250px] overflow-y-auto sm:max-h-[400px]">
              {employeesLoading ? (
                <div className="flex items-center justify-center py-10">
                  <IconLoader2
                    size={24}
                    className="animate-spin text-[#22C55E]"
                  />
                </div>
              ) : filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-[#6B7280]">
                  No employees found.
                </p>
              ) : (
                filtered.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => loadEmployee(emp.id)}
                    className={`w-full border-b border-[#F3F4F6] px-4 py-3 text-left text-sm transition-colors last:border-0 hover:bg-[#F9FAFB] ${
                      selectedId === emp.id
                        ? "border-l-2 border-l-[#22C55E] bg-[#DCFCE7]"
                        : ""
                    }`}
                  >
                    <span className="block font-medium text-[#1A202C]">
                      {emp.firstName} {emp.lastName}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">
                      {emp.user?.email || ""}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* Edit Form */}
        <motion.div
          variants={slideUp}
          className={`${isAdmin ? "lg:col-span-2" : "lg:col-span-1"} rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]`}
        >
          {selectedId && emp ? (
            <div>
              <div className="border-b border-[#E5E7EB] p-5">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-[#1A202C]">
                    {emp.firstName} {emp.lastName}
                  </h2>
                  {isFrozen && (
                    <span className="rounded-full bg-[#FEE2E2] px-2 py-0.5 text-[10px] font-bold text-[#EF4444]">
                      Frozen
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  {emp.user?.email}
                </p>
              </div>

              {success && (
                <div className="mx-5 mt-4 rounded-lg bg-[#DCFCE7] p-3 text-sm font-medium text-[#22C55E]">
                  {success}
                </div>
              )}
              {error && (
                <div className="mx-5 mt-4 rounded-lg bg-[#FEE2E2] p-3 text-sm font-medium text-[#EF4444]">
                  {error}
                </div>
              )}

              <div className="space-y-6 p-5">
                {/* Profile Image & Personal Info */}
                <div className="flex-col gap-4 sm:flex-row sm:gap-6">
                  <div className="flex shrink-0 flex-col items-center gap-2">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[#E5E7EB] bg-[#DCFCE7]">
                      {form.image ? (
                        <img
                          src={form.image}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
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
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#22C55E] hover:underline">
                        <IconPhoto size={14} /> Upload Photo
                      </span>
                    </label>
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                      Profile Image
                    </label>
                    <p className="text-xs text-[#9CA3AF]">
                      Upload a photo to set as profile image. The image will be
                      stored as base64.
                    </p>
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 className="mb-3 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                    Personal Info
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        First Name
                      </label>
                      <input
                        value={form.firstName}
                        onChange={setField("firstName")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        Last Name
                      </label>
                      <input
                        value={form.lastName}
                        onChange={setField("lastName")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        Phone
                      </label>
                      <input
                        value={form.phone}
                        onChange={setField("phone")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        Department
                      </label>
                      <input
                        value={form.department}
                        onChange={setField("department")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        Designation
                      </label>
                      <input
                        value={form.designation}
                        onChange={setField("designation")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        Address
                      </label>
                      <input
                        value={form.address}
                        onChange={setField("address")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h3 className="mb-3 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        Aadhar Card Number
                      </label>
                      <input
                        value={form.aadharCard}
                        onChange={setField("aadharCard")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        PAN Number
                      </label>
                      <input
                        value={form.panNumber}
                        onChange={setField("panNumber")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h3 className="mb-3 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                    Financial
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#1A202C]">
                        Salary (₹)
                      </label>
                      <input
                        type="number"
                        value={form.salary}
                        onChange={setField("salary")}
                        className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm text-[#1A202C] focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-[#E5E7EB] pt-6">
                  <h3 className="mb-3 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                    Statistics (read-only)
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
                    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#3B82F6]">
                        {emp.totalAttendance ?? 0}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                        Attendance
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#F59E0B]">
                        {emp.totalLeaves ?? 0}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                        Leaves
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#22C55E]">
                        {emp.totalCheckIns ?? 0}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                        Check-ins
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#EF4444]">
                        {emp.totalCheckOuts ?? 0}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                        Check-outs
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-center">
                      <p className="text-2xl font-bold text-[#8B5CF6]">
                        {emp.totalTasks ?? 0}
                      </p>
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#6B7280] uppercase">
                        Tasks
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                    <span className="flex items-center gap-1 text-xs font-semibold tracking-wider text-[#6B7280] uppercase">
                      <IconCash size={14} /> Bonus (on profile)
                    </span>
                    <span className="text-lg font-bold text-[#1A202C]">
                      ₹{(emp.bonus ? Number(emp.bonus) : 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 px-5 pb-5">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-[#22C55E] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#16A34A] disabled:bg-[#9CA3AF]"
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
                {isAdmin && (
                  <motion.button
                    onClick={() => setShowFreezeModal(true)}
                    disabled={freezing}
                    className="flex items-center gap-2 rounded-lg bg-[#EF4444] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#DC2626] disabled:bg-[#9CA3AF]"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {freezing ? (
                      <IconLoader2 size={16} className="animate-spin" />
                    ) : (
                      <IconUser size={16} />
                    )}
                    {freezing
                      ? "Updating..."
                      : isFrozen
                        ? "Unfreeze Account"
                        : "Freeze Account"}
                  </motion.button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <IconUser size={40} className="mb-3 text-[#D1D5DB]" />
              <p className="text-sm font-medium text-[#6B7280]">
                Select an employee from the list
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">
                Choose an employee to view and edit their details
              </p>
            </div>
          )}
        </motion.div>
      </div>
      {/* Freeze / Unfreeze Confirmation Modal */}
      <AnimatePresence>
        {showFreezeModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFreezeModal(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {isFrozen ? (
                <>
                  <h3 className="mb-2 text-lg font-bold text-[#1A202C]">
                    Unfreeze Account
                  </h3>
                  <p className="mb-6 text-sm text-[#6B7280]">
                    This will restore access for{" "}
                    <span className="font-semibold text-[#1A202C]">
                      {emp?.firstName} {emp?.lastName}
                    </span>
                    . They will be able to log in and use the system again.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="mb-2 text-lg font-bold text-[#1A202C]">
                    Freeze Account
                  </h3>
                  <p className="mb-6 text-sm text-[#6B7280]">
                    Are you sure you want to freeze{" "}
                    <span className="font-semibold text-[#1A202C]">
                      {emp?.firstName} {emp?.lastName}
                    </span>
                    &#39;s account? They will be unable to log in until an admin
                    unfreezes them.
                  </p>
                </>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowFreezeModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A202C]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFreeze}
                  disabled={freezing}
                  className="flex items-center gap-2 rounded-lg bg-[#EF4444] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#DC2626] disabled:bg-[#9CA3AF]"
                >
                  {freezing && (
                    <IconLoader2 size={16} className="animate-spin" />
                  )}
                  {freezing
                    ? "Updating..."
                    : isFrozen
                      ? "Yes, Unfreeze"
                      : "Yes, Freeze"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Salary Template — admin only */}
      {isAdmin && (
        <motion.div
          variants={slideUp}
          className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <div className="border-b border-[#E5E7EB] p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EDE9FE]">
                <IconReceipt size={20} className="text-[#7C3AED]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#1A202C]">
                  Salary Slip Template
                </h2>
                <p className="mt-0.5 text-xs text-[#6B7280]">
                  Configure the default breakdown ratios used when generating payslips
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5">
            {templateMsg && (
              <div className="rounded-lg bg-[#DCFCE7] p-3 text-sm font-medium text-[#22C55E]">
                {templateMsg}
              </div>
            )}
            {templateError && (
              <div className="rounded-lg bg-[#FEE2E2] p-3 text-sm font-medium text-[#EF4444]">
                {templateError}
              </div>
            )}

            {/* Earnings Breakdown */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                <IconCurrencyRupee size={13} />
                Earnings Breakdown
              </h3>
              <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F9FAFB]">
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">Component</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">Formula / Value</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">Override (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#1A202C]">Basic Salary</td>
                      <td className="px-4 py-3 text-[#6B7280]">Employee's configured salary</td>
                      <td className="px-4 py-3 text-right text-[#9CA3AF] text-xs italic">fixed</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#1A202C]">Total Allowances</td>
                      <td className="px-4 py-3 text-[#6B7280]">Basic × <span className="font-mono font-semibold text-[#7C3AED]">{salaryTemplate.allowancePercent}%</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0" max="100"
                            value={salaryTemplate.allowancePercent}
                            onChange={setTemplateField("allowancePercent")}
                            className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-right text-sm text-[#1A202C] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 focus:outline-none"
                          />
                          <IconPercentage size={14} className="text-[#9CA3AF]" />
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-[#FAFAFA]">
                      <td className="px-4 py-3 pl-8 text-[#6B7280]">↳ HRA</td>
                      <td className="px-4 py-3 text-[#6B7280]">Allowances × <span className="font-mono font-semibold text-[#7C3AED]">{salaryTemplate.hraPercent}%</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0" max="100"
                            value={salaryTemplate.hraPercent}
                            onChange={setTemplateField("hraPercent")}
                            className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-right text-sm text-[#1A202C] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 focus:outline-none"
                          />
                          <IconPercentage size={14} className="text-[#9CA3AF]" />
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-[#FAFAFA]">
                      <td className="px-4 py-3 pl-8 text-[#6B7280]">↳ Special Allowance</td>
                      <td className="px-4 py-3 text-[#6B7280]">Allowances × <span className="font-mono font-semibold text-[#7C3AED]">{salaryTemplate.specialPercent}%</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0" max="100"
                            value={salaryTemplate.specialPercent}
                            onChange={setTemplateField("specialPercent")}
                            className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-right text-sm text-[#1A202C] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 focus:outline-none"
                          />
                          <IconPercentage size={14} className="text-[#9CA3AF]" />
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-[#FAFAFA]">
                      <td className="px-4 py-3 pl-8 text-[#6B7280]">↳ Conveyance</td>
                      <td className="px-4 py-3 text-[#6B7280]">Allowances × <span className="font-mono font-semibold text-[#7C3AED]">{salaryTemplate.conveyancePercent}%</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0" max="100"
                            value={salaryTemplate.conveyancePercent}
                            onChange={setTemplateField("conveyancePercent")}
                            className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-right text-sm text-[#1A202C] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 focus:outline-none"
                          />
                          <IconPercentage size={14} className="text-[#9CA3AF]" />
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-[#FAFAFA]">
                      <td className="px-4 py-3 pl-8 text-[#6B7280]">↳ Medical Allowance</td>
                      <td className="px-4 py-3 text-[#6B7280]">Allowances × remainder <span className="font-mono font-semibold text-[#7C3AED]">{Math.max(0, 100 - Number(salaryTemplate.hraPercent) - Number(salaryTemplate.specialPercent) - Number(salaryTemplate.conveyancePercent))}%</span></td>
                      <td className="px-4 py-3 text-right text-[#9CA3AF] text-xs italic">auto</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#1A202C]">Performance Bonus</td>
                      <td className="px-4 py-3 text-[#6B7280]">Default ₹ value (editable per-employee at generation)</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-[#9CA3AF]">₹</span>
                          <input
                            type="number"
                            min="0"
                            value={salaryTemplate.defaultBonus}
                            onChange={setTemplateField("defaultBonus")}
                            className="w-24 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-right text-sm text-[#1A202C] focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 focus:outline-none"
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-xs font-bold tracking-wider text-[#6B7280] uppercase">
                <IconPercentage size={13} />
                Deductions Breakdown
              </h3>
              <div className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F9FAFB]">
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">Component</th>
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">Formula / Value</th>
                      <th className="px-4 py-2.5 text-right text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">Override (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3F4F6]">
                    <tr>
                      <td className="px-4 py-3 font-medium text-[#1A202C]">Total Deductions</td>
                      <td className="px-4 py-3 text-[#6B7280]">Basic × <span className="font-mono font-semibold text-[#EF4444]">{salaryTemplate.deductionPercent}%</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0" max="100"
                            value={salaryTemplate.deductionPercent}
                            onChange={setTemplateField("deductionPercent")}
                            className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-right text-sm text-[#1A202C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 focus:outline-none"
                          />
                          <IconPercentage size={14} className="text-[#9CA3AF]" />
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-[#FAFAFA]">
                      <td className="px-4 py-3 pl-8 text-[#6B7280]">↳ Provident Fund (PF)</td>
                      <td className="px-4 py-3 text-[#6B7280]">Deductions × <span className="font-mono font-semibold text-[#EF4444]">{salaryTemplate.pfPercent}%</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0" max="100"
                            value={salaryTemplate.pfPercent}
                            onChange={setTemplateField("pfPercent")}
                            className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-right text-sm text-[#1A202C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 focus:outline-none"
                          />
                          <IconPercentage size={14} className="text-[#9CA3AF]" />
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-[#FAFAFA]">
                      <td className="px-4 py-3 pl-8 text-[#6B7280]">↳ Professional Tax</td>
                      <td className="px-4 py-3 text-[#6B7280]">Deductions × <span className="font-mono font-semibold text-[#EF4444]">{salaryTemplate.ptPercent}%</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <input
                            type="number"
                            min="0" max="100"
                            value={salaryTemplate.ptPercent}
                            onChange={setTemplateField("ptPercent")}
                            className="w-20 rounded-lg border border-[#E5E7EB] px-2 py-1.5 text-right text-sm text-[#1A202C] focus:border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20 focus:outline-none"
                          />
                          <IconPercentage size={14} className="text-[#9CA3AF]" />
                        </div>
                      </td>
                    </tr>
                    <tr className="bg-[#FAFAFA]">
                      <td className="px-4 py-3 pl-8 text-[#6B7280]">↳ TDS</td>
                      <td className="px-4 py-3 text-[#6B7280]">Deductions × remainder <span className="font-mono font-semibold text-[#EF4444]">{Math.max(0, 100 - Number(salaryTemplate.pfPercent) - Number(salaryTemplate.ptPercent))}%</span></td>
                      <td className="px-4 py-3 text-right text-[#9CA3AF] text-xs italic">auto</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Preview */}
            <div className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <h3 className="mb-3 text-xs font-bold tracking-wider text-[#6B7280] uppercase">Live Preview — ₹50,000 Basic</h3>
              {(() => {
                const basic = 50000
                const allowances = Math.round(basic * Number(salaryTemplate.allowancePercent) / 100)
                const hra = Math.round(allowances * Number(salaryTemplate.hraPercent) / 100)
                const special = Math.round(allowances * Number(salaryTemplate.specialPercent) / 100)
                const conveyance = Math.round(allowances * Number(salaryTemplate.conveyancePercent) / 100)
                const medical = allowances - hra - special - conveyance
                const deductions = Math.round(basic * Number(salaryTemplate.deductionPercent) / 100)
                const pf = Math.round(deductions * Number(salaryTemplate.pfPercent) / 100)
                const pt = Math.round(deductions * Number(salaryTemplate.ptPercent) / 100)
                const tds = deductions - pf - pt
                const bonus = Number(salaryTemplate.defaultBonus)
                const gross = basic + allowances + bonus
                const netPay = gross - deductions
                const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`
                return (
                  <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    {[
                      { label: "Basic", value: fmt(basic), color: "text-[#1A202C]" },
                      { label: "HRA", value: fmt(hra), color: "text-[#3B82F6]" },
                      { label: "Special", value: fmt(special), color: "text-[#3B82F6]" },
                      { label: "Conveyance", value: fmt(conveyance), color: "text-[#3B82F6]" },
                      { label: "Medical", value: fmt(medical), color: "text-[#3B82F6]" },
                      { label: "Bonus", value: fmt(bonus), color: "text-[#F59E0B]" },
                      { label: "PF", value: `-${fmt(pf)}`, color: "text-[#EF4444]" },
                      { label: "Prof. Tax", value: `-${fmt(pt)}`, color: "text-[#EF4444]" },
                      { label: "TDS", value: `-${fmt(tds)}`, color: "text-[#EF4444]" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-lg border border-[#E5E7EB] bg-white p-2.5 text-center">
                        <p className={`text-sm font-bold ${color}`}>{value}</p>
                        <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#9CA3AF] uppercase">{label}</p>
                      </div>
                    ))}
                    <div className="col-span-2 rounded-lg border border-[#22C55E] bg-[#DCFCE7] p-2.5 text-center sm:col-span-4">
                      <p className="text-sm font-bold text-[#22C55E]">Net Pay: {fmt(netPay)}</p>
                      <p className="mt-0.5 text-[10px] font-semibold tracking-wider text-[#16A34A] uppercase">Gross {fmt(gross)} − Deductions {fmt(deductions)}</p>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-[#E5E7EB] px-5 py-4">
            <motion.button
              onClick={handleSaveTemplate}
              disabled={templateSaving}
              className="flex items-center gap-2 rounded-lg bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6D28D9] disabled:bg-[#9CA3AF]"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {templateSaving ? (
                <IconLoader2 size={16} className="animate-spin" />
              ) : (
                <IconDeviceFloppy size={16} />
              )}
              {templateSaving ? "Saving..." : "Save Template"}
            </motion.button>
            <p className="text-xs text-[#9CA3AF]">These ratios apply to all payslips generated via Salary &amp; Payroll</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
