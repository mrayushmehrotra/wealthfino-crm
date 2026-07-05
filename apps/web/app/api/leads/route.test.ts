import { beforeEach, expect, mock, test } from "bun:test";
import { mockAdmin, mockLeads, readJson } from "../../../test/fixtures/api";

const prismaMock = {
  lead: {
    findMany: mock(async () => []),
    deleteMany: mock(async () => ({})),
    delete: mock(async () => ({})),
  },
  user: {
    findUnique: mock(async () => null),
  },
};

const authMock = {
  getUser: mock(async () => null),
};

mock.module("@/lib/db", () => ({ prisma: prismaMock }));
mock.module("@/lib/auth", () => authMock);

const { GET, DELETE } = await import("./route");

beforeEach(() => {
  prismaMock.lead.findMany.mockReset();
  prismaMock.lead.deleteMany.mockReset();
  prismaMock.lead.delete.mockReset();
  prismaMock.user.findUnique.mockReset();
  authMock.getUser.mockReset();
});

test("returns unauthorized when no session exists", async () => {
  authMock.getUser.mockResolvedValueOnce(null);

  const response = await GET();

  expect(response.status).toBe(401);
  expect(await readJson(response)).toEqual({ success: false, error: "Unauthorized" });
});

test("returns all leads for admin users", async () => {
  authMock.getUser.mockResolvedValueOnce(mockAdmin);
  prismaMock.lead.findMany.mockResolvedValueOnce(mockLeads);

  const response = await GET();

  expect(response.status).toBe(200);
  expect(await readJson(response)).toEqual({
    success: true,
    data: mockLeads.map(lead => ({
      ...lead,
      createdAt: lead.createdAt.toISOString(),
    })),
  });
  expect(prismaMock.lead.findMany).toHaveBeenCalledWith({
    include: {
      assignedEmployee: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
});

test("deletes a single lead by id", async () => {
  authMock.getUser.mockResolvedValueOnce(mockAdmin);

  const response = await DELETE(new Request("http://localhost/api/leads?id=101"));

  expect(response.status).toBe(200);
  expect(await readJson(response)).toEqual({ success: true, message: "Lead deleted" });
  expect(prismaMock.lead.delete).toHaveBeenCalledWith({ where: { id: 101 } });
});

test("deletes all leads when all=true", async () => {
  authMock.getUser.mockResolvedValueOnce(mockAdmin);

  const response = await DELETE(new Request("http://localhost/api/leads?all=true"));

  expect(response.status).toBe(200);
  expect(await readJson(response)).toEqual({ success: true, message: "All leads deleted" });
  expect(prismaMock.lead.deleteMany).toHaveBeenCalledTimes(1);
});
