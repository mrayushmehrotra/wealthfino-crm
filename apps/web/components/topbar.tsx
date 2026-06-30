"use client"

import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { IconBell, IconMessage, IconSearch, IconX, IconLoader2 } from "@tabler/icons-react"
import { staggerContainer } from "@/lib/animation-variants"
import { useQuery } from "@tanstack/react-query"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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

const notificationVariants = {
  idle: { scale: 1 },
  ring: {
    scale: [1, 1.15, 1, 1.1, 1],
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 4 },
  },
}

const dotVariants = {
  idle: { scale: 1 },
  pulse: {
    scale: [1, 1.4, 1],
    transition: { duration: 1.5, repeat: Infinity, repeatDelay: 4 },
  },
}

export function Topbar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "Dashboard"

  const { data: queryData, isPending, refetch } = useQuery({
    queryKey: ["sidebarProfile"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json()
    },
  })

  const user = queryData?.data
  const isAdmin = user?.role === "ADMIN"
  const fullName = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : (isPending ? "Loading..." : "Admin")
  const firstName = user?.employee?.firstName || ""
  const lastName = user?.employee?.lastName || ""
  const initials = user?.employee ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() : (isPending ? ".." : "AD")
  const roleDisplay = user?.role || (isPending ? "..." : "admin")

  const todayAttendance = user?.todayAttendance
  const hasCheckedIn = !!todayAttendance?.checkIn
  const showCheckInModal = user?.employee && user?.role !== "ADMIN" && !hasCheckedIn

  const checkInTime = todayAttendance?.checkIn 
    ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : null

  const hasCheckedOut = !!todayAttendance?.checkOut
  const checkOutTime = todayAttendance?.checkOut
    ? new Date(todayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Array<{ id: number; name: string; email: string; phone: string | null; department: string | null; salary: number | null }>>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()
  const router = useRouter()

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/employees/search?q=${encodeURIComponent(searchQuery.trim())}`)
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
      checkOut: null
    }

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
      checkOut: now
    }

    try {
      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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
      className="fixed top-0 right-0 left-[248px] z-40 h-16 bg-white border-b border-[#E5E7EB] flex items-center px-6 gap-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <span className="text-sm font-semibold text-[#1A202C] mr-auto sm:hidden">
        {title}
      </span>

      {isAdmin && (
        <motion.button
          onClick={() => setSearchOpen(true)}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconSearch size={20} className="text-[#6B7280]" stroke={1.8} />
        </motion.button>
      )}

      <div className="ml-auto flex items-center gap-2">
        {checkInTime && (
          <div className="flex items-center gap-2 mr-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
              {!hasCheckedOut && <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />}
              <span className="text-xs font-bold uppercase tracking-wider">In: {checkInTime}</span>
            </div>
            
            {hasCheckedOut && checkOutTime && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
                <span className="text-xs font-bold uppercase tracking-wider">Out: {checkOutTime}</span>
              </div>
            )}

            {!hasCheckedOut && user?.employee && !isAdmin && (
              <motion.button
                onClick={handleCheckOut}
                disabled={isCheckingOut}
                className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#1A202C] hover:bg-[#374151] text-white transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isCheckingOut ? "..." : "Check Out"}
              </motion.button>
            )}
          </div>
        )}
        
        {/* Check-In Modal overlay */}
        <Dialog open={showCheckInModal} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[400px] bg-white border border-[#E5E7EB] p-6 text-center [&>button]:hidden">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-[#1A202C]">Good Morning, {user?.employee?.firstName}!</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-[#6B7280] mb-6">
              Please mark your attendance for today to continue to your dashboard.
            </p>
            <motion.button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              whileHover={!isCheckingIn ? { scale: 1.02 } : {}}
              whileTap={!isCheckingIn ? { scale: 0.98 } : {}}
            >
              {isCheckingIn ? "Checking In..." : "Check In Now"}
            </motion.button>
          </DialogContent>
        </Dialog>

        <motion.button
          className="relative h-9 w-9 rounded-full flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
          variants={notificationVariants}
          animate="ring"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconBell size={20} className="text-[#6B7280]" stroke={1.8} />
          <motion.span
            className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#EF4444]"
            variants={dotVariants}
            animate="pulse"
          />
        </motion.button>

        <motion.button
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-[#F5F7FA] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <IconMessage size={20} className="text-[#6B7280]" stroke={1.8} />
        </motion.button>

        <div className="h-6 w-px bg-[#E5E7EB] mx-1" />

        <motion.div
          className="flex items-center gap-2.5 cursor-pointer group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="h-8 w-8 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center">
            <span className="text-xs font-bold text-[#22C55E]">{initials}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#1A202C] leading-none">
              {fullName}
            </p>
            <p className="text-[11px] text-[#6B7280] mt-0.5 capitalize">{roleDisplay.toLowerCase()}</p>
          </div>
        </motion.div>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white border border-[#E5E7EB] p-0 gap-0">
          <div className="flex items-center border-b border-[#E5E7EB] px-4">
            <IconSearch size={18} className="text-[#9CA3AF] shrink-0" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or salary..."
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-3 py-4 text-sm text-[#1A202C] placeholder-[#9CA3AF] focus:outline-none bg-transparent"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchResults([]) }} className="text-[#6B7280] hover:text-[#1A202C]">
                <IconX size={16} />
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {searching && (
              <div className="flex items-center justify-center py-8">
                <IconLoader2 size={20} className="text-[#6B7280] animate-spin" />
              </div>
            )}
            {!searching && searchResults.length === 0 && searchQuery.trim() && (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">No employees found.</p>
            )}
            {!searching && searchResults.map((r) => (
              <button
                key={r.id}
                onClick={() => { router.push(`/employees/${r.id}`); setSearchOpen(false); setSearchQuery(""); setSearchResults([]) }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F9FAFB] transition-colors text-left border-b border-[#F3F4F6] last:border-0"
              >
                <div className="h-8 w-8 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#22C55E]">
                    {r.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A202C]">{r.name}</p>
                  <p className="text-xs text-[#6B7280] truncate">{r.email}{r.phone ? ` · ${r.phone}` : ""}{r.salary ? ` · ₹${r.salary.toLocaleString("en-IN")}` : ""}</p>
                </div>
                <span className="text-[10px] font-semibold text-[#6B7280] uppercase">{r.department || "N/A"}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </motion.header>
  )
}
