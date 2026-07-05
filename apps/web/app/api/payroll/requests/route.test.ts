import { beforeEach, expect, mock, test } from "bun:test";
import { mockAdminUser, mockPayrollRequest, mockUser, readJson } from "../../../../test/fixtures/api";

const prismaMock = {
  employee: { findUnique: mock(async () => null) },
  payroll: { findUnique: mock(async () => null) },
  payrollDownloadRequest: {
    findMany: mock(async () => []),
    findFirst: mock(async () => null),
    create: mock(async () => mockPayrollRequest),
  },
};

const authMock = {
  getUser: mock(async () => null),
};

mock.module("@/lib/db", () => ({ prisma: prismaMock }));
mock.module("@/lib/auth", () => authMock);

const { GET, POST } = await import("./route");

beforeEach(() => {
  prismaMock.employee.findUnique.mockReset();
  prismaMock.payroll.findUnique.mockReset();
  prismaMock.payrollDownloadRequest.findMany.mockReset();
  prismaMock.payrollDownloadRequest.findFirst.mockReset();
  prismaMock.payrollDownloadRequest.create.mockReset();
  authMock.getUser.mockReset();
});

test("returns unauthorized when no session exists", async () => {
  authMock.getUser.mockResolvedValueOnce(null);

  const response = await GET(new Request("http://localhost/api/payroll/requests"));

  expect(response.status).toBe(401);
  expect(await readJson(response)).toEqual({ success: false, error: "Unauthorized" });
});

test("returns pending payroll requests for an employee", async () => {
  authMock.getUser.mockResolvedValueOnce(mockAdminUser);
  prismaMock.payrollDownloadRequest.findMany.mockResolvedValueOnce([mockPayrollRequest]);

  const response = await GET(new Request("http://localhost/api/payroll/requests"));

  expect(response.status).toBe(200);
  expect((await readJson(response)).data[0]).toMatchObject({
    id: 601,
    payrollId: 501,
    employeeId: 1,
    status: "PENDING",
    month: 7,
    year: 2026,
    netPay: 55000,
    employeeName: "Aarav Sharma",
    department: "Sales",
  });
});

test("creates a payroll download request for own payslip", async () => {
  authMock.getUser.mockResolvedValueOnce(mockUser);
  prismaMock.employee.findUnique.mockResolvedValueOnce({ id: 1 });
  prismaMock.payroll.findUnique.mockResolvedValueOnce({ id: 501, employeeId: 1 });
  prismaMock.payrollDownloadRequest.findFirst.mockResolvedValueOnce(null);
  prismaMock.payrollDownloadRequest.create.mockResolvedValueOnce(mockPayrollRequest);

  const response = await POST(
    new Request("http://localhost/api/payroll/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payrollId: 501 }),
    })
  );

  expect(response.status).toBe(201);
  expect(await readJson(response)).toEqual({
    success: true,
    data: {
      ...mockPayrollRequest,
      requestedAt: mockPayrollRequest.requestedAt.toISOString(),
    },
  });
  expect(prismaMock.payrollDownloadRequest.create).toHaveBeenCalledWith({
    data: { payrollId: 501, employeeId: 1 },
  });
});
