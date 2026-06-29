import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const employeeId = parseInt(id);
  
  if (isNaN(employeeId)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: {
        select: {
          email: true,
          role: true,
          isApproved: true,
        },
      },
      tasks: {
        orderBy: { createdAt: "desc" },
      },
      attendance: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: {
          attendance: true,
          leaveRequests: true,
          tasks: true,
        },
      },
    },
  });

  if (!employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  const checkInOut = await prisma.$queryRawUnsafe<Array<{ checkIns: bigint; checkOuts: bigint }>>(
    `SELECT
       COUNT(CASE WHEN check_in IS NOT NULL THEN 1 END) AS checkIns,
       COUNT(CASE WHEN check_out IS NOT NULL THEN 1 END) AS checkOuts
     FROM attendance WHERE employee_id = ${employeeId}`
  );

  const data = {
    ...employee,
    totalAttendance: employee._count.attendance,
    totalLeaves: employee._count.leaveRequests,
    totalTasks: employee._count.tasks,
    totalCheckIns: Number(checkInOut[0]?.checkIns || 0),
    totalCheckOuts: Number(checkInOut[0]?.checkOuts || 0),
  };

  return NextResponse.json({ success: true, data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const employeeId = parseInt(id);
  if (isNaN(employeeId)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  // Only admins can edit any employee; employees can only edit themselves
  if (session.role !== "ADMIN") {
    const ownEmployee = await prisma.employee.findUnique({ where: { userId: session.userId }, select: { id: true } });
    if (!ownEmployee || ownEmployee.id !== employeeId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
  }

  const body = await request.json();
  const { firstName, lastName, phone, address, aadharCard, panNumber, salary, bonus, department, designation, image } = body;

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(aadharCard !== undefined && { aadharCard }),
      ...(panNumber !== undefined && { panNumber }),
      ...(salary !== undefined && { salary }),
      ...(bonus !== undefined && { bonus }),
      ...(department !== undefined && { department }),
      ...(designation !== undefined && { designation }),
      ...(image !== undefined && { image }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
