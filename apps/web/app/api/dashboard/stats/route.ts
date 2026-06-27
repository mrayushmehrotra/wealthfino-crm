import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Fetch real-time data from database
  const totalEmployees = await prisma.employee.count();
  
  // Real task metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalTasks = await prisma.task.count({
    where: { createdAt: { gte: today } }
  });

  const completedTasks = await prisma.task.count({
    where: { 
      createdAt: { gte: today },
      status: "DONE" 
    }
  });

  const pendingTasks = totalTasks - completedTasks;
  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return NextResponse.json({
    success: true,
    data: {
      totalEmployees,
      presentToday: 0,
      absent: 0,
      onLeave: 0,
      tasksTotal: totalTasks,
      tasksCompleted: completedTasks,
      tasksPending: pendingTasks,
      productivityScore,
    }
  });
}
