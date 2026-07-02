"use client"

import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  IconMessage,
  IconSearch,
  IconX,
  IconLoader2,
  IconMenu2,
  IconX as IconXMark,
  IconLayoutDashboard,
  IconUsers,
  IconCalendarCheck,
  IconBeach,
  IconChecklist,
  IconFileReport,
  IconClock,
  IconChartBar,
  IconSpeakerphone,
  IconCash,
  IconCalendar,
  IconFolder,
  IconChartPie,
  IconSettings,
  IconHelp,
  IconLogout,
} from "@tabler/icons-react"
import { staggerContainer } from "@/lib/animation-variants"
import { useAuth } from "@/hooks/use-data"
import { useState, useEffect, useRef } from "react"
import { useAtom } from "jotai"
import { searchResultsAtom, searchQueryAtom } from "@/store/atoms"
import { useRouter } from "next/navigation"
import Image from "next/image"
import logoSrc from "@/app/logo.png"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/leave-management": "Leave Management",
  "/task-management": "Task Management",
  "/daily-reports": "Daily Reports",
  "/work-log": "Work Log",
  "/performance": "Performance",
  "/announcements": "Announcements",
  "/salary-payroll": "Salary & Payroll",
  "/calendar": "Calendar",
  "/documents": "Documents",
  "/reports": "Reports & Analytics",
  "/settings": "Settings",
  "/support": "Help & Support",
}

const sidebarNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "Access Requests", href: "/access-requests", icon: IconUsers },
  { label: "Employees", href: "/employees", icon: IconUsers },
  { label: "Attendance", href: "/attendance", icon: IconCalendarCheck },
  { label: "Leave Management", href: "/leave-management", icon: IconBeach },
  { label: "Task Management", href: "/task-management", icon: IconChecklist },
  { label: "Daily Reports", href: "/daily-reports", icon: IconFileReport },
  { label: "Work Log (Hourly)", href: "/work-log", icon: IconClock },
  { label: "Performance", href: "/performance", icon: IconChartBar },
  { label: "Announcements", href: "/announcements", icon: IconSpeakerphone },
  { label: "Salary & Payroll", href: "/salary-payroll", icon: IconCash },
  { label: "Calendar", href: "/calendar", icon: IconCalendar },
  { label: "Documents", href: "/documents", icon: IconFolder },
  { label: "Reports & Analytics", href: "/reports", icon: IconChartPie },
  { label: "Settings", href: "/settings", icon: IconSettings },
  { label: "Help & Support", href: "/support", icon: IconHelp },
]

export function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "Dashboard"

  const { data: user, isPending, refetch } = useAuth()
  const isAdmin = user?.role === "ADMIN"
  const fullName = user?.employee
    ? `${user.employee.firstName} ${user.employee.lastName}`
    : isPending
      ? "Loading..."
      : "Admin"
  const firstName = user?.employee?.firstName || ""
  const lastName = user?.employee?.lastName || ""
  const initials = user?.employee
    ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    : isPending
      ? ".."
      : "AD"
  const roleDisplay = user?.role || (isPending ? "..." : "admin")

  const todayAttendance = user?.todayAttendance
  const hasCheckedIn = !!todayAttendance?.checkIn
  const showCheckInModal: boolean | undefined = !!(
    user?.employee &&
    user?.role !== "ADMIN" &&
    !hasCheckedIn
  )

  const checkInTime = todayAttendance?.checkIn
    ? new Date(todayAttendance.checkIn).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  const hasCheckedOut = !!todayAttendance?.checkOut
  const checkOutTime = todayAttendance?.checkOut
    ? new Date(todayAttendance.checkOut).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom)
  const [searchResults, setSearchResults] = useAtom(searchResultsAtom)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `/api/employees/search?q=${encodeURIComponent(searchQuery.trim())}`
        )
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data.data || [])
        }
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [searchQuery])

  const handleCheckIn = async () => {
    if (!user?.employee?.id) return
    setIsCheckingIn(true)

    const now = new Date().toISOString()
    const payload = {
      employeeId: user.employee.id,
      date: now.split("T")[0],
      status: "PRESENT",
      checkIn: now,
      checkOut: null,
    }

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      await refetch()
    } catch (err) {
      console.error("Failed to check in", err)
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    if (!user?.employee?.id) return
    setIsCheckingOut(true)

    const now = new Date().toISOString()
    const payload = {
      employeeId: user.employee.id,
      date: now.split("T")[0],
      checkOut: now,
    }

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      await refetch()
    } catch (err) {
      console.error("Failed to check out", err)
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <motion.header
      className="fixed top-0 right-0 left-0 z-40 flex h-16 items-center gap-2 border-b border-[#E5E7EB] bg-white px-3 sm:gap-4 sm:px-6 md:left-[248px]"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[#F5F7FA] md:hidden"
        aria-label="Toggle sidebar"
      >
        {mobileSidebarOpen ? (
          <IconXMark size={20} className="text-[#6B7280]" stroke={1.8} />
        ) : (
          <IconMenu2 size={20} className="text-[#6B7280]" stroke={1.8} />
        )}
      </button>

      <span className="mr-auto truncate text-sm font-semibold text-[#1A202C]">
        {title}
      </span>

      {isAdmin && (
        <motion.button
          onClick={() => setSearchOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F5F7FA]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconSearch size={20} className="text-[#6B7280]" stroke={1.8} />
        </motion.button>
      )}

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {checkInTime && (
          <div className="mr-1 flex items-center gap-1 sm:mr-2 sm:gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-3 py-1.5 text-[#22C55E] sm:flex">
              {!hasCheckedOut && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22C55E]" />
              )}
              <span className="text-xs font-bold tracking-wider uppercase">
                In: {checkInTime}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-2 py-1 text-[#22C55E] sm:hidden">
              <span className="text-[10px] font-bold">{checkInTime}</span>
            </div>

            {hasCheckedOut && checkOutTime && (
              <>
                <div className="hidden items-center gap-2 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-3 py-1.5 text-[#EF4444] sm:flex">
                  <span className="text-xs font-bold tracking-wider uppercase">
                    Out: {checkOutTime}
                  </span>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-[#EF4444]/30 bg-[#EF4444]/10 px-2 py-1 text-[#EF4444] sm:hidden">
                  <span className="text-[10px] font-bold">{checkOutTime}</span>
                </div>
              </>
            )}

            {!hasCheckedOut && user?.employee && !isAdmin && (
              <motion.button
                onClick={handleCheckOut}
                disabled={isCheckingOut}
                className="rounded-full bg-[#1A202C] px-2 py-1.5 text-[10px] font-bold tracking-wider text-white uppercase transition-colors hover:bg-[#374151] disabled:opacity-50 sm:px-3 sm:text-xs"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCheckingOut ? "..." : "Out"}
              </motion.button>
            )}
          </div>
        )}

        {/* Check-In Modal overlay */}
        <Dialog open={showCheckInModal} onOpenChange={() => {}}>
          <DialogContent
            showCloseButton={false}
            className="border border-[#E5E7EB] bg-white p-6 text-center sm:max-w-[400px]"
          >
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-[#1A202C]">
                Good Morning, {user?.employee?.firstName}!
              </DialogTitle>
            </DialogHeader>
            <p className="mb-6 text-sm text-[#6B7280]">
              Please mark your attendance for today to continue to your
              dashboard.
            </p>
            <motion.button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="w-full rounded-xl bg-[#22C55E] py-3 font-bold text-white transition-colors hover:bg-[#16A34A] disabled:opacity-50"
              whileHover={!isCheckingIn ? { scale: 1.02 } : {}}
              whileTap={!isCheckingIn ? { scale: 0.98 } : {}}
            >
              {isCheckingIn ? "Checking In..." : "Check In Now ✓"}
            </motion.button>
          </DialogContent>
        </Dialog>

        <motion.button
          className="hidden h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F5F7FA] sm:flex"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconMessage size={20} className="text-[#6B7280]" stroke={1.8} />
        </motion.button>

        <div className="mx-0.5 h-5 w-px bg-[#E5E7EB] sm:mx-1 sm:h-6" />

        <div ref={userMenuRef} className="relative">
          <motion.button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-[#F5F7FA]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#22C55E]/30 bg-[#22C55E]/20">
              <span className="text-xs font-bold text-[#22C55E]">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm leading-none font-semibold text-[#1A202C]">
                {fullName}
              </p>
              <p className="mt-0.5 text-[11px] text-[#6B7280] capitalize">
                {roleDisplay.toLowerCase()}
              </p>
            </div>
          </motion.button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg"
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
              >
                <button
                  onClick={() => { router.push("/settings"); setUserMenuOpen(false) }}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#1A202C] transition-colors hover:bg-[#F5F7FA]"
                >
                  <IconSettings size={16} className="text-[#6B7280]" stroke={1.8} />
                  Settings
                </button>
                <div className="mx-3 h-px bg-[#E5E7EB]" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[#EF4444] transition-colors hover:bg-[#FEF2F2]"
                >
                  <IconLogout size={16} stroke={1.8} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col bg-[#0D1B2A]"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg">
                    <Image
                      src={logoSrc}
                      alt="WealthFino"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm leading-none font-bold text-white">
                      WealthFino
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#B8C4CC]">
                      HR & Productivity
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="text-white/60 hover:text-white"
                >
                  <IconXMark size={20} />
                </button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                {sidebarNavItems.map(({ label, href, icon: Icon }) => {
                  const active =
                    pathname === href || pathname.startsWith(href + "/")
                  return (
                    <button
                      key={href}
                      onClick={() => {
                        router.push(href)
                        setMobileSidebarOpen(false)
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-[#1A7A4A] text-white"
                          : "text-[#B8C4CC] hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={18} stroke={1.8} className="shrink-0" />
                      <span className="flex-1 truncate text-left">{label}</span>
                    </button>
                  )
                })}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="gap-0 border border-[#E5E7EB] bg-white p-0 sm:max-w-[500px]">
          <div className="flex items-center border-b border-[#E5E7EB] px-4">
            <IconSearch size={18} className="shrink-0 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or salary..."
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-3 py-4 text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSearchResults([])
                }}
                className="text-[#6B7280] hover:text-[#1A202C]"
              >
                <IconX size={16} />
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {searching && (
              <div className="flex items-center justify-center py-8">
                <IconLoader2
                  size={20}
                  className="animate-spin text-[#6B7280]"
                />
              </div>
            )}
            {!searching && searchResults.length === 0 && searchQuery.trim() && (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">
                No employees found.
              </p>
            )}
            {!searching &&
              searchResults.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    router.push(`/employees/${r.id}`)
                    setSearchOpen(false)
                    setSearchQuery("")
                    setSearchResults([])
                  }}
                  className="flex w-full items-center gap-3 border-b border-[#F3F4F6] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[#F9FAFB]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#22C55E]/30 bg-[#22C55E]/20">
                    <span className="text-xs font-bold text-[#22C55E]">
                      {r.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1A202C]">
                      {r.name}
                    </p>
                    <p className="truncate text-xs text-[#6B7280]">
                      {r.email}
                      {r.phone ? ` · ${r.phone}` : ""}
                      {r.salary
                        ? ` · ₹${r.salary.toLocaleString("en-IN")}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-[#6B7280] uppercase">
                    {r.department || "N/A"}
                  </span>
                </button>
              ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.header>
  )
}
