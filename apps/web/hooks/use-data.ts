"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import {
  authAtom,
  authLoadingAtom,
  isAdminAtom,
  employeesAtom,
  employeeDetailAtom,
  employeeDetailIdAtom,
  tasksAtom,
  dashboardStatsAtom,
  attendanceAtom,
  leaveAtom,
  calendarDataAtom,
  announcementsAtom,
  payrollAtom,
  performanceAtom,
  reportsAtom,
  documentsAtom,
  faqsAtom,
  accessRequestsAtom,
  workLogAtom,
} from "@/store/atoms"

// ─── Auth ─────────────────────────────────────────────────────────────────

export function useAuth() {
  const [data, setData] = useAtom(authAtom)
  const [isLoading, setIsLoading] = useAtom(authLoadingAtom)

  const query = useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me")
      if (!res.ok) throw new Error("Failed to fetch profile")
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) {
      setData(query.data.data)
      setIsLoading(false)
    }
    if (query.isError) setIsLoading(false)
  }, [query.data, query.isError, setData, setIsLoading])

  return { data, isPending: isLoading && query.isPending, refetch: query.refetch }
}

export function useIsAdmin() {
  return useAtomValue(isAdminAtom)
}

// ─── Employees ────────────────────────────────────────────────────────────

export function useEmployees() {
  const [data, setData] = useAtom(employeesAtom)

  const query = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await fetch("/api/employees")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending, refetch: query.refetch }
}

export function useEmployeeDetail() {
  const employeeId = useAtomValue(employeeDetailIdAtom)
  const [data, setData] = useAtom(employeeDetailAtom)

  const query = useQuery({
    queryKey: ["employeeDetail", employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/employees/${employeeId}`)
      if (!res.ok) throw new Error("Failed to fetch employee")
      return res.json()
    },
    enabled: !!employeeId,
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending, error: query.error }
}

// ─── Tasks ────────────────────────────────────────────────────────────────

export function useTasks() {
  const [data, setData] = useAtom(tasksAtom)

  const query = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) return { data: { stats: { total: 0, inProgress: 0, done: 0 }, tasks: [], role: "EMPLOYEE" } }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending, refetch: query.refetch }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────

export function useDashboardStats() {
  const [data, setData] = useAtom(dashboardStatsAtom)

  const query = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats")
      if (!res.ok) return { data: null }
      return res.json()
    },
    refetchInterval: 5000,
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending }
}

// ─── Attendance ───────────────────────────────────────────────────────────

export function useAttendance() {
  const [data, setData] = useAtom(attendanceAtom)

  const query = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => {
      const res = await fetch("/api/attendance")
      if (!res.ok) return { data: { stats: { present: 0, absent: 0, onLeave: 0 }, role: "EMPLOYEE", records: [] } }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending }
}

// ─── Leave ────────────────────────────────────────────────────────────────

export function useLeave() {
  const [data, setData] = useAtom(leaveAtom)

  const query = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      const res = await fetch("/api/leave")
      if (!res.ok) return { data: { stats: { total: 0, pending: 0, approved: 0, rejected: 0 }, requests: [] } }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending, refetch: query.refetch }
}

// ─── Calendar ─────────────────────────────────────────────────────────────

export function useCalendarData(month: number, year: number, employeeId: string, role?: string) {
  const [data, setData] = useAtom(calendarDataAtom)

  const query = useQuery({
    queryKey: ["calendar", month, year, employeeId, role],
    queryFn: async () => {
      const params = new URLSearchParams({ month: String(month), year: String(year) })
      if (employeeId) params.set("employeeId", employeeId)
      const res = await fetch(`/api/calendar?${params}`)
      if (!res.ok) return { data: { days: {}, employees: [], role } }
      return res.json()
    },
    enabled: !!role,
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending }
}

// ─── Announcements ────────────────────────────────────────────────────────

export function useAnnouncements() {
  const [data, setData] = useAtom(announcementsAtom)

  const query = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await fetch("/api/announcements")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending, refetch: query.refetch }
}

// ─── Payroll ──────────────────────────────────────────────────────────────

export function usePayroll(month: number, year: number) {
  const [data, setData] = useAtom(payrollAtom)

  const query = useQuery({
    queryKey: ["payroll", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/payroll?month=${month}&year=${year}`)
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending, refetch: query.refetch }
}

// ─── Performance ──────────────────────────────────────────────────────────

export function usePerformance() {
  const [data, setData] = useAtom(performanceAtom)

  const query = useQuery({
    queryKey: ["performance"],
    queryFn: async () => {
      const res = await fetch("/api/performance")
      if (!res.ok) return { data: [], chartData: [] }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data) setData(query.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending }
}

// ─── Reports ──────────────────────────────────────────────────────────────

export function useReports() {
  const [data, setData] = useAtom(reportsAtom)

  const query = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending }
}

// ─── Documents ────────────────────────────────────────────────────────────

export function useDocuments() {
  const [data, setData] = useAtom(documentsAtom)

  const query = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await fetch("/api/documents")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending }
}

// ─── Support / FAQs ───────────────────────────────────────────────────────

export function useFaqs() {
  const [data, setData] = useAtom(faqsAtom)

  const query = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await fetch("/api/support")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending }
}

// ─── Access Requests ──────────────────────────────────────────────────────

export function useAccessRequests() {
  const [data, setData] = useAtom(accessRequestsAtom)

  const query = useQuery({
    queryKey: ["accessRequests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/access-requests")
      if (!res.ok) return { data: [] }
      return res.json()
    },
  })

  useEffect(() => {
    if (query.data?.data) setData(query.data.data)
  }, [query.data, setData])

  return { data, isPending: query.isPending, refetch: query.refetch }
}
