import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getUser();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (session.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden: Admins only" }, { status: 403 });
  }

  const { id } = await params;
  const employeeId = parseInt(id);
  if (isNaN(employeeId)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { userId: true, firstName: true, lastName: true },
  });

  if (!employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: employee.userId },
    select: { frozen: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  const newFrozen = !user.frozen;

  await prisma.user.update({
    where: { id: employee.userId },
    data: { frozen: newFrozen },
  });

  return NextResponse.json({
    success: true,
    data: { frozen: newFrozen },
    message: newFrozen
      ? `${employee.firstName} ${employee.lastName}'s account has been frozen.`
      : `${employee.firstName} ${employee.lastName}'s account has been unfrozen.`,
  });
}
