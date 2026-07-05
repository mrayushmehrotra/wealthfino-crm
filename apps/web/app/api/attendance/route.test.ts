import { beforeEach, expect, mock, test } from "bun:test";
import { mockAdminUser, mockAttendance, mockUser, readJson } from "../../../test/fixtures/api";

const prismaMock = {
  user: { findUnique: mock(async () => null) },
  employee: { findMany: mock(async () => []) },
  attendance: { findMany: mock(async () => []), upsert: mock(async () => mockAttendance) },
};

const authMock = {
  getUser: mock(async () => null),
};

mock.module("@/lib/db", () => ({ prisma: prismaMock }));
mock.module("@/lib/auth", () => authMock);

const { GET, POST } = await import("./route");

beforeEach(() => {
  prismaMock.user.findUnique.mockReset();
  prismaMock.employee.findMany.mockReset();
  prismaMock.attendance.findMany.mockReset();
  prismaMock.attendance.upsert.mockReset();
  authMock.getUser.mockReset();
});

test("returns employee attendance stats for employee sessions", async () => {
  authMock.getUser.mockResolvedValueOnce(mockUser);
  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: 10,
    role: "EMPLOYEE",
    employee: { id: 1 },
  });
  prismaMock.attendance.findMany.mockResolvedValueOnce([
    { ...mockAttendance, status: "PRESENT" },
    { ...mockAttendance, id: 302, status: "ON_LEAVE" },
    { ...mockAttendance, id: 303, status: "ABSENT" },
  ]);

  const response = await GET(new Request("http://localhost/api/attendance"));

  expect(response.status).toBe(200);
  const payload = await readJson(response);
  expect(payload.data.stats).toEqual({ present: 1, absent: 1, onLeave: 1, total: 3 });
});

test("returns admin attendance view for the selected date", async () => {
  authMock.getUser.mockResolvedValueOnce(mockAdminUser);
  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: 99,
    role: "ADMIN",
    employee: null,
  });
  prismaMock.employee.findMany.mockResolvedValueOnce([
    { id: 1, firstName: "Aarav", lastName: "Sharma", department: "Sales" },
    { id: 2, firstName: "Neha", lastName: "Singh", department: "Support" },
  ]);
  prismaMock.attendance.findMany.mockResolvedValueOnce([
    { employeeId: 1, status: "PRESENT" },
  ]);

  const response = await GET(new Request("http://localhost/api/attendance?date=2026-07-01"));

  expect(response.status).toBe(200);
  const payload = await readJson(response);
  expect(payload.data.stats).toEqual({ present: 1, absent: 1, onLeave: 0, total: 2 });
  expect(payload.data.records[0].status).toBe("PRESENT");
  expect(payload.data.records[1].status).toBe("ABSENT");
});

test("upserts attendance records", async () => {
  const response = await POST(
    new Request("http://localhost/api/attendance", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        employeeId: 1,
        date: "2026-07-01",
        checkIn: "2026-07-01T09:00:00.000Z",
        checkOut: null,
        status: "PRESENT",
      }),
    })
  );

  expect(response.status).toBe(201);
  expect(await readJson(response)).toEqual({ success: true });
  expect(prismaMock.attendance.upsert).toHaveBeenCalledWith({
    where: { employeeId_date: { employeeId: 1, date: new Date("2026-07-01") } },
    update: {
      checkIn: new Date("2026-07-01T09:00:00.000Z"),
      checkOut: null,
      status: "PRESENT",
    },
    create: {
      employeeId: 1,
      date: new Date("2026-07-01"),
      checkIn: new Date("2026-07-01T09:00:00.000Z"),
      status: "PRESENT",
    },
  });
});
