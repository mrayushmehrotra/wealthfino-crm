import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  // Fetch all employees
  const employees = await prisma.employee.findMany({
    select: { id: true, firstName: true, lastName: true, department: true }
  });

  // Fetch attendance for today
  const attendanceRecords = await prisma.attendance.findMany({
    where: { date: new Date(date) }
  });

  // Map attendance to employees
  const records = employees.map(emp => {
    const record = attendanceRecords.find(a => a.employeeId === emp.id);
    return {
      employee: emp,
      attendance: record || null,
      status: record?.status || "ABSENT"
    };
  });

  const present = records.filter(r => r.status === "PRESENT").length;
  const onLeave = records.filter(r => r.status === "ON_LEAVE").length;
  const absent = records.length - present - onLeave;

  return NextResponse.json({ 
    success: true, 
    data: {
      stats: { present, absent, onLeave, total: records.length },
      records
    } 
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { employeeId, date, checkIn, checkOut, status } = body;

  const record = await prisma.attendance.upsert({
    where: { employeeId_date: { employeeId: Number(employeeId), date: new Date(date) } },
    update: { checkIn: checkIn ? new Date(checkIn) : undefined, checkOut: checkOut ? new Date(checkOut) : undefined, status },
    create: {
      employeeId: Number(employeeId),
      date: new Date(date),
      checkIn: checkIn ? new Date(checkIn) : undefined,
      status: status ?? "PRESENT",
    },
  });

  return NextResponse.json({ success: true, data: record }, { status: 201 });
}
