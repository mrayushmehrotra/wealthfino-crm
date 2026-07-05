import { beforeEach, expect, mock, test } from "bun:test";
import { jsonRequest, readJson } from "../../../../test/fixtures/api";

const loginEmployee = {
  id: 1,
  userId: 10,
  firstName: "Aarav",
  lastName: "Sharma",
  phone: "9876543210",
  address: "Pune",
  aadharCard: "111122223333",
  panNumber: "ABCDE1234F",
  salary: 50000,
  bonus: 2500,
  department: "Sales",
  designation: "Executive",
  image: null,
  joinedAt: "2026-01-10T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
  lastIp: "203.0.113.10",
  user: { email: "aarav@example.com", role: "EMPLOYEE" as const },
};

const prismaMock = {
  user: {
    findUnique: mock(async () => null),
  },
  employee: {
    update: mock(async () => ({})),
  },
};

mock.module("@/lib/db", () => ({ prisma: prismaMock }));
mock.module("jsonwebtoken", () => ({ sign: mock(() => "signed-token") }));
mock.module("bcryptjs", () => ({
  compare: mock(async () => true),
  default: {
    compare: mock(async () => true),
  },
}));

const { POST } = await import("./route");

beforeEach(() => {
  prismaMock.user.findUnique.mockReset();
  prismaMock.employee.update.mockReset();
});

test("returns validation error when credentials are missing", async () => {
  const response = await POST(jsonRequest({ email: "a@example.com" }));
  expect(response.status).toBe(400);
  expect(await readJson(response)).toEqual({
    success: false,
    error: { code: "VALIDATION_ERROR", message: "Email and password required" },
  });
});

test("rejects invalid credentials", async () => {
  prismaMock.user.findUnique.mockResolvedValueOnce(null);

  const response = await POST(jsonRequest({ email: "a@example.com", password: "wrong" }));

  expect(response.status).toBe(401);
  expect(await readJson(response)).toEqual({
    success: false,
    error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" },
  });
});

test("returns token cookie for an approved user", async () => {
  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: 1,
    email: "aarav@example.com",
    passwordHash: "hash",
    role: "EMPLOYEE",
    isApproved: true,
    frozen: false,
    employee: loginEmployee,
  });

  const response = await POST(
    jsonRequest(
      { email: "aarav@example.com", password: "secret" },
      { headers: { "x-forwarded-for": "198.51.100.12" } }
    )
  );

  expect(response.status).toBe(200);
  expect(await readJson(response)).toEqual({
    success: true,
    data: {
      id: 1,
      email: "aarav@example.com",
      role: "EMPLOYEE",
      employee: loginEmployee,
    },
  });
  expect(response.headers.get("set-cookie")).toContain("token=signed-token");
  expect(prismaMock.employee.update).toHaveBeenCalledWith({
    where: { id: 1 },
    data: { lastIp: "198.51.100.12" },
  });
});
