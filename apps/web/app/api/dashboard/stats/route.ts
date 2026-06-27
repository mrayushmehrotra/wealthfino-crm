import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  // Fetch full user + employee profile
  const fullUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { employee: true },
  });

  if (!fullUser) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  const firstName = fullUser.employee?.firstName ?? "User";
  const role = fullUser.role;

  // --- ADMIN DASHBOARD ---
  if (role === "ADMIN") {
    const totalEmployees = await prisma.employee.count();

    const attendanceRecords = await prisma.attendance.findMany({
      where: { date: new Date(todayStr) }
    });
    const presentToday = attendanceRecords.filter(a => a.status === "PRESENT").length;
    const onLeave = attendanceRecords.filter(a => a.status === "ON_LEAVE").length;
    const absent = totalEmployees - presentToday - onLeave;

    const totalTasks = await prisma.task.count();
    const completedTasks = await prisma.task.count({ where: { status: "DONE" } });
    const pendingTasks = totalTasks - completedTasks;
    const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        role: "ADMIN",
        firstName,
        totalEmployees,
        presentToday,
        absent,
        onLeave,
        tasksTotal: totalTasks,
        tasksCompleted: completedTasks,
        tasksPending: pendingTasks,
        productivityScore,
        workingHoursToday: null,
      }
    });
  }

  // --- EMPLOYEE DASHBOARD ---
  const employee = fullUser.employee;
  if (!employee) {
    return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
  }

  // Employee task stats
  const tasksTotal = await prisma.task.count({ where: { employeeId: employee.id } });
  const tasksCompleted = await prisma.task.count({ where: { employeeId: employee.id, status: "DONE" } });
  const tasksInProgress = await prisma.task.count({ where: { employeeId: employee.id, status: "IN_PROGRESS" } });
  const tasksPending = tasksTotal - tasksCompleted;
  const productivityScore = tasksTotal > 0 ? Math.round((tasksCompleted / tasksTotal) * 100) : 0;

  // Today's working hours
  const todayAttendance = await prisma.attendance.findUnique({
    where: { employeeId_date: { employeeId: employee.id, date: new Date(todayStr) } }
  });

  let workingHoursToday = 0;
  if (todayAttendance?.checkIn) {
    const endTime = todayAttendance.checkOut ? new Date(todayAttendance.checkOut) : new Date();
    const diffMs = endTime.getTime() - new Date(todayAttendance.checkIn).getTime();
    workingHoursToday = Math.round((diffMs / 3600000) * 10) / 10; // round to 1 decimal
  }

  return NextResponse.json({
    success: true,
    data: {
      role: "EMPLOYEE",
      firstName,
      totalEmployees: null,
      presentToday: null,
      absent: null,
      onLeave: null,
      tasksTotal,
      tasksCompleted,
      tasksPending,
      tasksInProgress,
      productivityScore,
      workingHoursToday,
    }
  });
}
