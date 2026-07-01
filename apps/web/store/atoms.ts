"use client"

import { atom } from "jotai"

// ─── Auth ────────────────────────────────────────────────────────────────
export interface SessionUser {
  id: number
  email: string
  role: "ADMIN" | "MANAGER" | "EMPLOYEE"
  employee: {
    id: number
    firstName: string
    lastName: string
    lastIp: string | null
  } | null
  todayAttendance: { checkIn: string | null; checkOut: string | null } | null
}

export const authAtom = atom<SessionUser | null>(null)
export const authLoadingAtom = atom(true)
export const isAdminAtom = atom((get) => get(authAtom)?.role === "ADMIN")

// ─── Employees ────────────────────────────────────────────────────────────
export interface Employee {
  id: number
  firstName: string
  lastName: string
  phone: string | null
  address: string | null
  aadharCard: string | null
  panNumber: string | null
  salary: number | null
  bonus: number
  department: string | null
  designation: string | null
  image: string | null
  joinedAt: string
  updatedAt: string | null
  location: string | null
  lastIp: string | null
  user: { email: string; role: string; frozen: boolean } | null
  totalAttendance: number
  totalLeaves: number
  totalTasks: number
  totalCheckIns: number
  totalCheckOuts: number
}

export const employeesAtom = atom<Employee[]>([])

export interface EmployeeDetail extends Employee {
  tasks: Array<{ id: number; title: string; description: string | null; status: string; priority: string }>
  attendance: Array<{ id: number; date: string; status: string }>
}

export const employeeDetailAtom = atom<EmployeeDetail | null>(null)
export const employeeDetailIdAtom = atom<number | null>(null)

// ─── Tasks ────────────────────────────────────────────────────────────────
export interface Task {
  id: number
  title: string
  description: string | null
  employee: { firstName: string; lastName: string }
  dueDate: string | null
  priority: "HIGH" | "MEDIUM" | "LOW"
  status: "TODO" | "IN_PROGRESS" | "DONE" | "CANCELLED"
}

export interface TasksResponse {
  stats: { total: number; inProgress: number; done: number }
  tasks: Task[]
  role: string
}

export const tasksAtom = atom<TasksResponse | null>(null)

// ─── Dashboard Stats ─────────────────────────────────────────────────────
export interface DashboardStats {
  role: string
  firstName: string
  totalEmployees?: number
  presentToday?: number
  absent?: number
  onLeave?: number
  workingHoursToday?: number
  tasksTotal: number
  tasksCompleted: number
  tasksPending: number
  productivityScore: number
  activeEmployees?: Array<{ id: number; name: string; checkIn: string }>
}

export const dashboardStatsAtom = atom<DashboardStats | null>(null)

// ─── Attendance ───────────────────────────────────────────────────────────
export interface AttendanceRecord {
  date: string | null
  employee: { id: number; firstName: string; lastName: string; department: string | null }
  attendance: { checkIn: string | null; checkOut: string | null } | null
  status: "PRESENT" | "ABSENT" | "ON_LEAVE"
}

export interface AttendanceResponse {
  stats: { present: number; absent: number; onLeave: number }
  role: string
  records: AttendanceRecord[]
}

export const attendanceAtom = atom<AttendanceResponse | null>(null)

// ─── Leave ────────────────────────────────────────────────────────────────
export interface LeaveRequest {
  id: number
  employee: { firstName: string; lastName: string }
  fromDate: string
  toDate: string
  days: number
  type: string
  reason: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
}

export interface LeaveResponse {
  stats: { total: number; pending: number; approved: number; rejected: number }
  requests: LeaveRequest[]
}

export const leaveAtom = atom<LeaveResponse | null>(null)

// ─── Calendar ─────────────────────────────────────────────────────────────
export interface CalendarDay {
  total: number
  completed: number
  tasks: Array<{ id: number; title: string; status: string; priority: string }>
}

export interface CalendarResponse {
  days: Record<string, CalendarDay>
  employees: Array<{ id: number; firstName: string; lastName: string; department: string | null }>
  role: string
}

export const calendarDataAtom = atom<CalendarResponse | null>(null)

// ─── Announcements ────────────────────────────────────────────────────────
export interface Announcement {
  id: number
  title: string
  content: string
  body: string
  date: string
  author: string
  type: string
  tag: string | null
  tagColor: string | null
}

export const announcementsAtom = atom<Announcement[]>([])

// ─── Payroll ──────────────────────────────────────────────────────────────
export interface PayrollRecord {
  id: number
  employeeId: number
  name: string
  role: string
  department: string | null
  basic: number
  allowances: number
  deductions: number
  bonus: number
  netPay: number
  status: string
}

export const payrollAtom = atom<PayrollRecord[]>([])

// ─── Payroll Download Requests ────────────────────────────────────────────
export interface PayrollDownloadRequest {
  id: number
  payrollId: number
  employeeId: number
  status: "PENDING" | "APPROVED" | "REJECTED"
  requestedAt: string
  reviewedAt: string | null
  month: number
  year: number
  netPay: number
  employeeName: string
  department: string | null
}

export const payrollRequestsAtom = atom<PayrollDownloadRequest[]>([])

// ─── Performance ──────────────────────────────────────────────────────────
export interface PerfData {
  name: string
  role: string
  tasks: number
  completed: number
  attendance: string
  score: number
}

export interface PerfResponse {
  data: PerfData[]
  chartData: Array<{ date: string; "Tasks Completed": number }>
}

export const performanceAtom = atom<PerfResponse | null>(null)

// ─── Reports ──────────────────────────────────────────────────────────────
export interface Report {
  id: number
  name: string
  date: string
  tasks: number
  hours: number
  status: string
  summary: string | null
}

export interface EmployeeStat {
  employeeId: number
  name: string
  department: string | null
  attendancePercent: number
  tasksCompleted: number
  tasksTotal: number
  productivity: number
}

export interface ReportsResponse {
  reports: Report[]
  role: string
  stats: {
    totalEmployees: number
    avgAttendance: number
    tasksCompleted: number
    tasksTotal: number
    avgProductivity: number
  }
  employeeStats: EmployeeStat[]
}

export const reportsAtom = atom<ReportsResponse | null>(null)

// ─── Documents ────────────────────────────────────────────────────────────
export interface Document {
  id: number
  name: string
  type: string
  size: string
  uploadedAt: string
  category: string
  uploaded: string
  by: string
}

export const documentsAtom = atom<Document[]>([])

// ─── Support ──────────────────────────────────────────────────────────────
export interface Faq {
  q: string
  a: string
}

export const faqsAtom = atom<Faq[]>([])

// ─── Access Requests ──────────────────────────────────────────────────────
export interface AccessRequest {
  id: number
  email: string
  role: string
  createdAt: string
  employee: { firstName: string; lastName: string } | null
}

export const accessRequestsAtom = atom<AccessRequest[]>([])

// ─── Work Log ─────────────────────────────────────────────────────────────
export interface WorkLogEntry {
  startTime: string
  task: string
  status: string
}

export const workLogAtom = atom<WorkLogEntry[]>([])

// ─── Calendar UI State (existing) ─────────────────────────────────────────
export const calendarMonthState = atom<number>(new Date().getMonth())
export const calendarYearState = atom<number>(new Date().getFullYear())
export const calendarSelectedEmployeeIdState = atom<string>("")
export const calendarSelectedDayState = atom<number | null>(null)

// ─── Employee Search (Topbar) ─────────────────────────────────────────────
export interface SearchResult {
  id: number
  name: string
  email: string
  phone: string | null
  department: string | null
  salary: number | null
}

export const searchResultsAtom = atom<SearchResult[]>([])
export const searchQueryAtom = atom<string>("")
