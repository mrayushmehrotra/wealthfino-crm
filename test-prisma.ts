import { prisma } from "./apps/web/lib/db";

async function test() {
  try {
    const employeeId = 2;
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            isApproved: true,
          },
        },
        tasks: {
          orderBy: { createdAt: "desc" },
        },
        attendance: {
          orderBy: { date: "desc" },
        },
        payroll: {
          orderBy: [{ year: "desc" }, { month: "desc" }],
        },
        leaveRequests: {
          orderBy: { createdAt: "desc" },
        },
        dailyReports: {
          orderBy: { date: "desc" },
        },
        _count: {
          select: {
            attendance: true,
            leaveRequests: true,
            tasks: true,
          },
        },
      },
    });
    console.log("Success", !!employee);
  } catch (e) {
    console.error("Prisma Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
