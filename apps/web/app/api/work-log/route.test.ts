import { beforeEach, expect, mock, test } from "bun:test";
import { mockUser, mockWorkLog, readJson } from "../../../test/fixtures/api";

const prismaMock = {
  user: { findUnique: mock(async () => null) },
  workLog: {
    findMany: mock(async () => []),
    findFirst: mock(async () => null),
    delete: mock(async () => ({})),
    update: mock(async () => ({})),
    create: mock(async () => mockWorkLog),
  },
};

const authMock = {
  getUser: mock(async () => null),
};

mock.module("@/lib/db", () => ({ prisma: prismaMock }));
mock.module("@/lib/auth", () => authMock);

const { GET, POST } = await import("./route");

beforeEach(() => {
  prismaMock.user.findUnique.mockReset();
  prismaMock.workLog.findMany.mockReset();
  prismaMock.workLog.findFirst.mockReset();
  prismaMock.workLog.delete.mockReset();
  prismaMock.workLog.update.mockReset();
  prismaMock.workLog.create.mockReset();
  authMock.getUser.mockReset();
});

test("returns date validation error when query param is missing", async () => {
  authMock.getUser.mockResolvedValueOnce(mockUser);

  const response = await GET(new Request("http://localhost/api/work-log"));

  expect(response.status).toBe(400);
  expect(await readJson(response)).toEqual({ success: false, error: "Date is required" });
});

test("returns employee work logs for the selected date", async () => {
  authMock.getUser.mockResolvedValueOnce(mockUser);
  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: 10,
    employee: { id: 1 },
  });
  prismaMock.workLog.findMany.mockResolvedValueOnce([mockWorkLog]);

  const response = await GET(new Request("http://localhost/api/work-log?date=2026-07-01"));

  expect(response.status).toBe(200);
  expect(await readJson(response)).toEqual({
    success: true,
    data: [
      {
        ...mockWorkLog,
        date: mockWorkLog.date.toISOString(),
        startTime: mockWorkLog.startTime.toISOString(),
        endTime: mockWorkLog.endTime.toISOString(),
      },
    ],
  });
});

test("syncs logs by creating new entries", async () => {
  authMock.getUser.mockResolvedValueOnce(mockUser);
  prismaMock.user.findUnique.mockResolvedValueOnce({
    id: 10,
    employee: { id: 1 },
  });
  prismaMock.workLog.findFirst.mockResolvedValueOnce(null);

  const response = await POST(
    new Request("http://localhost/api/work-log", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        date: "2026-07-01",
        logs: [
          {
            startTime: "2026-07-01T09:00:00.000Z",
            endTime: "2026-07-01T10:00:00.000Z",
            task: "Client call",
            status: "Done",
          },
        ],
      }),
    })
  );

  expect(response.status).toBe(200);
  expect(await readJson(response)).toEqual({
    success: true,
    message: "Logs synced successfully",
  });
  expect(prismaMock.workLog.create).toHaveBeenCalledWith({
    data: {
      employeeId: 1,
      date: new Date("2026-07-01"),
      startTime: new Date("2026-07-01T09:00:00.000Z"),
      endTime: new Date("2026-07-01T10:00:00.000Z"),
      task: "Client call",
      status: "Done",
      hours: 1,
    },
  });
});
