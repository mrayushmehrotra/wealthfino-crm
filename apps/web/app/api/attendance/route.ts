import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET(request: Request) {
  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    include: { employee: true }
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get("date") ?? new Date().toISOString().split("T")[0]!;

  if (user.role === "EMPLOYEE" && user.employee) {
    // Return historical attendance for this employee
    const attendanceRecords = await prisma.attendance.findMany({
      where: { employeeId: user.employee.id },
      orderBy: { date: "desc" }
    });

    const records = attendanceRecords.map(a => ({
      date: a.date,
      employee: user.employee,
      attendance: a,
      status: a.status
    }));

    const present = records.filter(r => r.status === "PRESENT").length;
    const onLeave = records.filter(r => r.status === "ON_LEAVE").length;
    const absent = records.filter(r => r.status === "ABSENT").length;

    return NextResponse.json({ 
      success: true, 
      data: {
        role: "EMPLOYEE",
        stats: { present, absent, onLeave, total: records.length },
        records
      } 
    });
  }

  // Fetch all employees for ADMIN
  const employees = await prisma.employee.findMany({
    select: { id: true, firstName: true, lastName: true, department: true }
  });

  // Fetch attendance for today (Admin view)
  const attendanceRecords = await prisma.attendance.findMany({
    where: { date: new Date(dateStr) }
  });

  // Map attendance to employees
  const records = employees.map((emp: typeof employees[number]) => {
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
      role: "ADMIN",
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
    update: { 
      checkIn: checkIn ? new Date(checkIn) : undefined, 
      checkOut: checkOut === null ? null : (checkOut ? new Date(checkOut) : undefined), 
      status 
    },
    create: {
      employeeId: Number(employeeId),
      date: new Date(date),
      checkIn: checkIn ? new Date(checkIn) : undefined,
      status: status ?? "PRESENT",
    },
  });

  return NextResponse.json({ success: true, data: record }, { status: 201 });
}
