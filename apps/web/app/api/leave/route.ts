import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const queryWhere = user.role === "ADMIN" ? {} : { employee: { userId: user.id } };

  const requests = await prisma.leaveRequest.findMany({
    where: queryWhere,
    include: {
      employee: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = requests.filter(r => r.status === "PENDING").length;
  const approved = requests.filter(r => r.status === "APPROVED").length;
  const rejected = requests.filter(r => r.status === "REJECTED").length;

  return NextResponse.json({ 
    success: true, 
    data: {
      stats: { pending, approved, rejected },
      requests
    }
  });
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

export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { leaveId, status } = body; // status can be "APPROVED" or "REJECTED"

    if (!leaveId || !status) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status, reviewedAt: new Date() },
    });

    return NextResponse.json({ success: true, data: updatedLeave });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to update leave request" }, { status: 500 });
  }
}
