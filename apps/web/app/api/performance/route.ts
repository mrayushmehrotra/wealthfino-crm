import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getUser();
  if (!sessionUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  // Get all employees
  const employees = await prisma.employee.findMany({
    include: {
      user: true,
      tasks: true,
      attendance: true,
    }
  });

  const performanceData = employees.map(emp => {
    const totalTasks = emp.tasks.length;
    const completedTasks = emp.tasks.filter(t => t.status === "DONE").length;
    const score = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const totalDays = emp.attendance.length;
    const presentDays = emp.attendance.filter(a => a.status === "PRESENT").length;
    const attendancePercent = totalDays === 0 ? 0 : Math.round((presentDays / totalDays) * 100);

    return {
      name: `${emp.firstName} ${emp.lastName}`,
      role: emp.user?.role || "EMPLOYEE",
      tasks: totalTasks,
      completed: completedTasks,
      attendance: `${attendancePercent}%`,
      score: score,
    };
  });

  // Calculate task completions over the last 7 days for the chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0]!;
  });

  // We can count all completed tasks updated in those days (mocking the "done in time" logic if we don't have completedAt).
  // We'll use tasks that are DONE and group them by updatedAt.
  
  const allTasks = await prisma.task.findMany({
    where: { status: "DONE" },
    include: { employee: true }
  });

  const chartData = last7Days.map(dateStr => {
    const dataPoint: any = { date: dateStr };
    
    // Total for the day
    let totalCompleted = 0;
    
    allTasks.forEach(t => {
      const taskDate = new Date(t.updatedAt).toISOString().split("T")[0]!;
      if (taskDate === dateStr) {
        totalCompleted++;
      }
    });
    
    dataPoint["Tasks Completed"] = totalCompleted;
    return dataPoint;
  });

  return NextResponse.json({ 
    success: true, 
    data: performanceData,
    chartData
  });
}
