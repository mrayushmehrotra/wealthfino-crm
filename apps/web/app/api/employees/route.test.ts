import { beforeEach, expect, mock, test } from "bun:test";
import { mockAdmin, mockEmployee, readJson } from "../../../test/fixtures/api";

const prismaMock = {
  employee: {
    findMany: mock(async () => []),
    create: mock(async () => null),
  },
  user: {
    findUnique: mock(async () => null),
  },
  $queryRawUnsafe: mock(async () => []),
};

const authMock = {
  getUser: mock(async () => null),
  requireAdmin: mock(async () => mockAdmin),
};

mock.module("@/lib/db", () => ({ prisma: prismaMock }));
mock.module("@/lib/auth", () => authMock);
mock.module("bcryptjs", () => ({
  hash: mock(async () => "password-hash"),
  default: {
    hash: mock(async () => "password-hash"),
  },
}));

const { GET, POST } = await import("./route");

beforeEach(() => {
  prismaMock.employee.findMany.mockReset();
  prismaMock.employee.create.mockReset();
  prismaMock.user.findUnique.mockReset();
  prismaMock.$queryRawUnsafe.mockReset();
  authMock.getUser.mockReset();
  authMock.requireAdmin.mockReset();
  globalThis.fetch = mock(async () =>
    new Response(
      JSON.stringify([{ status: "success", query: "203.0.113.10", city: "Pune", country: "India" }]),
      { status: 200, headers: { "content-type": "application/json" } }
    )
  ) as typeof fetch;
});

test("returns unauthorized when no session exists", async () => {
  authMock.getUser.mockResolvedValueOnce(null);

  const response = await GET();

  expect(response.status).toBe(401);
  expect(await readJson(response)).toEqual({ success: false, error: "Unauthorized" });
});

test("returns employee list for authenticated users", async () => {
  authMock.getUser.mockResolvedValueOnce(mockAdmin);
  prismaMock.employee.findMany.mockResolvedValueOnce([mockEmployee]);
  prismaMock.$queryRawUnsafe.mockResolvedValueOnce([
    { employeeId: 1, checkIns: 4n, checkOuts: 3n },
  ]);

  const response = await GET();

  expect(response.status).toBe(200);
  const payload = await readJson(response);
  expect(payload.success).toBe(true);
  expect(payload.data[0]).toMatchObject({
    id: 1,
    userId: 10,
    firstName: "Aarav",
    lastName: "Sharma",
    location: "Pune, India",
    totalAttendance: 8,
    totalLeaves: 1,
    totalTasks: 5,
    totalCheckIns: 4,
    totalCheckOuts: 3,
  });
});

test("creates a new employee when admin submits valid data", async () => {
  authMock.requireAdmin.mockResolvedValueOnce(mockAdmin);
  prismaMock.user.findUnique.mockResolvedValueOnce(null);
  prismaMock.employee.create.mockResolvedValueOnce({
    id: 2,
    user: { email: "new.employee@example.com", role: "EMPLOYEE" },
  });

  const response = await POST(
    new Request("http://localhost/api/employees", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "new.employee@example.com",
        password: "secret",
        firstName: "New",
        lastName: "Employee",
        department: "Operations",
        designation: "Associate",
        phone: "9000000000",
      }),
    })
  );

  expect(response.status).toBe(201);
  expect(await readJson(response)).toEqual({
    success: true,
    data: {
      id: 2,
      user: { email: "new.employee@example.com", role: "EMPLOYEE" },
    },
  });
  expect(prismaMock.employee.create).toHaveBeenCalledWith({
    data: {
      firstName: "New",
      lastName: "Employee",
      phone: "9000000000",
      department: "Operations",
      designation: "Associate",
      user: {
        create: {
          email: "new.employee@example.com",
          passwordHash: "password-hash",
        },
      },
    },
    include: { user: { select: { email: true, role: true } } },
  });
});
