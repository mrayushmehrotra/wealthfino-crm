export const mockEmployee = {
  id: 1,
  userId: 10,
  firstName: "Aarav",
  lastName: "Sharma",
  phone: "9876543210",
  address: "Pune",
  aadharCard: "111122223333",
  panNumber: "ABCDE1234F",
  salary: 50000n,
  bonus: 2500n,
  department: "Sales",
  designation: "Executive",
  image: null,
  joinedAt: new Date("2026-01-10T00:00:00.000Z"),
  updatedAt: new Date("2026-06-01T00:00:00.000Z"),
  lastIp: "203.0.113.10",
  user: { email: "aarav@example.com", role: "EMPLOYEE" as const },
  _count: { attendance: 8, leaveRequests: 1, tasks: 5 },
};

export const mockAdmin = {
  userId: 99,
  role: "ADMIN" as const,
};

export const mockLeads = [
  {
    id: 101,
    name: "Lead One",
    email: "lead.one@example.com",
    phone: "9000000001",
    source: "Website",
    status: "NEW",
    assignedTo: 1,
    createdAt: new Date("2026-06-20T10:00:00.000Z"),
    assignedEmployee: { id: 1, firstName: "Aarav", lastName: "Sharma" },
  },
  {
    id: 102,
    name: "Lead Two",
    email: "lead.two@example.com",
    phone: "9000000002",
    source: "Referral",
    status: "CONTACTED",
    assignedTo: 1,
    createdAt: new Date("2026-06-22T10:00:00.000Z"),
    assignedEmployee: { id: 1, firstName: "Aarav", lastName: "Sharma" },
  },
];

export const mockUser = {
  id: 10,
  role: "EMPLOYEE" as const,
  employee: { id: 1 },
};

export const mockAdminUser = {
  id: 99,
  role: "ADMIN" as const,
  employee: null,
};

export const mockAttendance = {
  id: 301,
  employeeId: 1,
  date: new Date("2026-07-01T00:00:00.000Z"),
  checkIn: new Date("2026-07-01T09:00:00.000Z"),
  checkOut: new Date("2026-07-01T18:00:00.000Z"),
  status: "PRESENT",
};

export const mockWorkLog = {
  id: 401,
  employeeId: 1,
  date: new Date("2026-07-01T00:00:00.000Z"),
  startTime: new Date("2026-07-01T09:00:00.000Z"),
  endTime: new Date("2026-07-01T10:00:00.000Z"),
  task: "Client call",
  status: "Done",
  hours: 1,
};

export const mockPayrollEmployee = {
  id: 1,
  firstName: "Aarav",
  lastName: "Sharma",
  department: "Sales",
  designation: "Executive",
  salary: 50000n,
  bonus: 2500n,
  user: { email: "aarav@example.com", role: "EMPLOYEE" as const },
};

export const mockPayrollRecord = {
  id: 501,
  employeeId: 1,
  month: 7,
  year: 2026,
  basic: 50000n,
  allowances: 5000n,
  deductions: 2500n,
  bonus: 2500n,
  netPay: 55000n,
  status: "PROCESSED",
  employee: mockPayrollEmployee,
};

export const mockPayrollRequest = {
  id: 601,
  payrollId: 501,
  employeeId: 1,
  status: "PENDING",
  requestedAt: new Date("2026-07-02T10:00:00.000Z"),
  reviewedAt: null,
  payroll: {
    month: 7,
    year: 2026,
    netPay: 55000,
    employee: { firstName: "Aarav", lastName: "Sharma" },
  },
  employee: {
    firstName: "Aarav",
    lastName: "Sharma",
    department: "Sales",
  },
};

export function jsonRequest(body: unknown, init?: RequestInit) {
  return new Request("http://localhost/api/test", {
    ...init,
    method: init?.method ?? "POST",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
  });
}

export async function readJson<T = unknown>(response: Response): Promise<T> {
  return (await response.json()) as T;
}
