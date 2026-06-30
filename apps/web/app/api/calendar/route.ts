import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? String(now.getMonth()));
  const year = parseInt(searchParams.get("year") ?? String(now.getFullYear()));
  const employeeId = searchParams.get("employeeId") ? parseInt(searchParams.get("employeeId")!) : null;

  let targetEmployeeId: number | null = null;

  if (user.role === "ADMIN") {
    targetEmployeeId = employeeId;
  } else {
    const emp = await prisma.employee.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    if (!emp) {
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }
    targetEmployeeId = emp.id;
  }

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const where: Record<string, unknown> = {
    status: { not: "CANCELLED" },
    OR: [
      { dueDate: { gte: startDate, lte: endDate } },
      { dueDate: null, createdAt: { gte: startDate, lte: endDate } },
    ],
  };
  if (targetEmployeeId) {
    where.employeeId = targetEmployeeId;
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      employee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  const days: Record<string, { total: number; completed: number; tasks: Array<{ id: number; title: string; status: string; priority: string }> }> = {};

  for (const task of tasks) {
    const date = task.dueDate || task.createdAt;
    if (!date) continue;
    const dateKey = new Date(date).getDate().toString();
    if (!days[dateKey]) {
      days[dateKey] = { total: 0, completed: 0, tasks: [] };
    }
    days[dateKey].total++;
    if (task.status === "DONE") days[dateKey].completed++;
    days[dateKey].tasks.push({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
    });
  }

  let employees: Array<{ id: number; firstName: string; lastName: string; department: string | null }> = [];
  if (user.role === "ADMIN") {
    employees = await prisma.employee.findMany({
      select: { id: true, firstName: true, lastName: true, department: true },
      orderBy: { firstName: "asc" },
    });
  }

  return NextResponse.json({
    success: true,
    data: { days, employees, role: user.role },
  });
}
