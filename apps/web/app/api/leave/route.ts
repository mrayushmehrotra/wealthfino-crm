import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const requests = await prisma.leaveRequest.findMany({
    include: {
      employee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: requests });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { employeeId, type, fromDate, toDate, days, reason } = body;

  const leave = await prisma.leaveRequest.create({
    data: {
      employeeId: Number(employeeId),
      type,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      days: Number(days),
      reason,
    },
  });
  return NextResponse.json({ success: true, data: leave }, { status: 201 });
}
