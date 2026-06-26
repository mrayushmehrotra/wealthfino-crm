import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? new Date().toISOString().split("T")[0];

  const records = await prisma.attendance.findMany({
    where: { date: new Date(date) },
    include: {
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
    orderBy: { employee: { firstName: "asc" } },
  });

  return NextResponse.json({ success: true, data: records });
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
