import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const employeeId = parseInt(params.id);
  
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
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      attendance: {
        take: 7,
        orderBy: { date: "desc" },
      }
    },
  });

  if (!employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: employee });
}
