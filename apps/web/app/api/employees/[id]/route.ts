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
      }
    },
  });

  if (!employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: employee });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const employeeId = parseInt(id);
  if (isNaN(employeeId)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const { firstName, lastName, phone, address, aadharCard, panNumber, salary, bonus, department, designation } = body;

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
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
