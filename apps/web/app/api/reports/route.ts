import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = sessionUser.role === "ADMIN";

  const employees = await prisma.employee.findMany({
    include: {
      user: { select: { email: true, role: true } },
      tasks: true,
      attendance: true,
    },
    orderBy: { firstName: "asc" },
  });

  let targetEmployees;
  if (isAdmin) {
    targetEmployees = employees;
  } else {
    targetEmployees = employees.filter((e) => e.userId === sessionUser.userId);
  }

  const dailyReports = await prisma.dailyReport.findMany({
    where: isAdmin ? {} : { employeeId: { in: targetEmployees.map((e) => e.id) } },
    include: {
      employee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { date: "desc" },
    take: 50,
  });

  const reports = dailyReports.map((r) => ({
    id: r.id,
    name: `${r.employee.firstName} ${r.employee.lastName}`,
    date: r.date.toISOString().split("T")[0]!,
    tasks: 0,
    hours: r.hoursLogged,
    status: "Submitted",
    summary: r.summary,
  }));

  const employeeStats = targetEmployees.map((emp) => {
    const totalTasks = emp.tasks.length;
    const completedTasks = emp.tasks.filter((t) => t.status === "DONE").length;
    const score = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const totalDays = emp.attendance.length;
    const presentDays = emp.attendance.filter((a) => a.status === "PRESENT").length;
    const attendancePercent = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

    return {
      employeeId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      attendancePercent,
      tasksCompleted: completedTasks,
      tasksTotal: totalTasks,
      productivity: score,
    };
  });

  const totalEmployees = targetEmployees.length;
  const avgAttendance = totalEmployees
    ? Math.round(employeeStats.reduce((s, e) => s + e.attendancePercent, 0) / totalEmployees)
    : 0;
  const totalTasksDone = employeeStats.reduce((s, e) => s + e.tasksCompleted, 0);
  const totalTasksAll = employeeStats.reduce((s, e) => s + e.tasksTotal, 0);
  const avgProductivity = totalEmployees
    ? Math.round(employeeStats.reduce((s, e) => s + e.productivity, 0) / totalEmployees)
    : 0;

  return NextResponse.json({
    success: true,
    data: {
      reports,
      role: sessionUser.role,
      stats: {
        totalEmployees,
        avgAttendance,
        tasksCompleted: totalTasksDone,
        tasksTotal: totalTasksAll,
        avgProductivity,
      },
      employeeStats,
    },
  });
}
