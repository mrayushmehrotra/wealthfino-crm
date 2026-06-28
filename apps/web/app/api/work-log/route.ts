import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const sessionUser = await getUser();
  if (!sessionUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  
  if (!dateStr) {
    return NextResponse.json({ success: false, error: "Date is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    include: { employee: true },
  });

  if (!user || !user.employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  const logs = await prisma.workLog.findMany({
    where: {
      employeeId: user.employee.id,
      date: new Date(dateStr),
    },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json({ success: true, data: logs });
}

export async function POST(request: Request) {
  const sessionUser = await getUser();
  if (!sessionUser) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    include: { employee: true },
  });

  if (!user || !user.employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  const body = await request.json();
  const { date, logs } = body;

  if (!date || !Array.isArray(logs)) {
    return NextResponse.json({ success: false, error: "Missing date or logs array" }, { status: 400 });
  }

  const employeeId = user.employee.id;
  const targetDate = new Date(date);

  // We can process each log
  // To keep it simple, we could delete existing ones for this date and insert the new ones,
  // or we can use upsert logic. Upsert is safer.
  
  for (const log of logs) {
    const { startTime, endTime, task } = log;
    
    if (!startTime || !endTime) continue;
    
    const existing = await prisma.workLog.findFirst({
      where: {
        employeeId,
        date: targetDate,
        startTime: new Date(startTime),
      }
    });

    if (existing) {
      if (!task || task.trim() === "") {
        await prisma.workLog.delete({ where: { id: existing.id } });
      } else {
        await prisma.workLog.update({
          where: { id: existing.id },
          data: { task },
        });
      }
    } else {
      if (task && task.trim() !== "") {
        await prisma.workLog.create({
          data: {
            employeeId,
            date: targetDate,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            task,
            hours: 1, // Fixed to 1 hour per slot
          }
        });
      }
    }
  }

  return NextResponse.json({ success: true, message: "Logs synced successfully" });
}
