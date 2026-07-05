import { beforeEach, expect, mock, test } from "bun:test";
import { mockAdminUser, mockPayrollEmployee, mockPayrollRecord, readJson } from "../../../test/fixtures/api";

const prismaMock = {
  employee: { findUnique: mock(async () => null), findMany: mock(async () => []) },
  payroll: { findMany: mock(async () => []), upsert: mock(async () => mockPayrollRecord) },
};

const authMock = {
  getUser: mock(async () => null),
};

mock.module("@/lib/db", () => ({ prisma: prismaMock }));
mock.module("@/lib/auth", () => authMock);

const { GET, POST } = await import("./route");

beforeEach(() => {
  prismaMock.employee.findUnique.mockReset();
  prismaMock.employee.findMany.mockReset();
  prismaMock.payroll.findMany.mockReset();
  prismaMock.payroll.upsert.mockReset();
  authMock.getUser.mockReset();
});

test("returns employee payroll records filtered by user", async () => {
  authMock.getUser.mockResolvedValueOnce({ id: 10, userId: 10, role: "EMPLOYEE" });
  prismaMock.employee.findUnique.mockResolvedValueOnce({ id: 1 });
  prismaMock.payroll.findMany.mockResolvedValueOnce([
    {
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
      employee: {
        id: 1,
        firstName: "Aarav",
        lastName: "Sharma",
        department: "Sales",
        designation: "Executive",
        salary: 50000n,
        user: { email: "aarav@example.com", role: "EMPLOYEE" as const },
      },
    },
  ]);

  const response = await GET(new Request("http://localhost/api/payroll?month=7&year=2026"));

  expect(response.status).toBe(200);
  expect(await readJson(response)).toMatchObject({
    success: true,
    data: [
      {
        id: 501,
        employeeId: 1,
        name: "Aarav Sharma",
        role: "Executive",
        department: "Sales",
        basic: 50000,
        allowances: 5000,
        deductions: 2500,
        bonus: 2500,
        netPay: 55000,
        status: "PROCESSED",
      },
    ],
  });
});

test("processes payroll for selected employees", async () => {
  authMock.getUser.mockResolvedValueOnce(mockAdminUser);
  prismaMock.employee.findMany.mockResolvedValueOnce([mockPayrollEmployee]);

  const response = await POST(
    new Request("http://localhost/api/payroll", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        month: 7,
        year: 2026,
        employees: [{ employeeId: 1, bonus: 2500 }],
      }),
    })
  );

  expect(response.status).toBe(200);
  expect(await readJson(response)).toMatchObject({ success: true });
  expect(prismaMock.payroll.upsert).toHaveBeenCalledWith({
    where: { employeeId_month_year: { employeeId: 1, month: 7, year: 2026 } },
    update: {
      basic: 50000,
      allowances: 5000,
      deductions: 2500,
      bonus: 2500,
      netPay: 55000,
      status: "PROCESSED",
    },
    create: {
      employeeId: 1,
      month: 7,
      year: 2026,
      basic: 50000,
      allowances: 5000,
      deductions: 2500,
      bonus: 2500,
      netPay: 55000,
      status: "PROCESSED",
    },
  });
});
