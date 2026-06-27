import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    include: { employee: true },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  // Remove passwordHash
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _pw, ...safeUser } = user;
  
  let todayAttendance = null;
  if (user.employee) {
    const todayStr = new Date().toISOString().split("T")[0];
    const today = new Date(todayStr);
    
    todayAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.employee.id,
          date: today
        }
      }
    });

    if (!todayAttendance) {
      todayAttendance = await prisma.attendance.create({
        data: {
          employeeId: user.employee.id,
          date: today,
          checkIn: new Date(),
          status: "PRESENT",
        }
      });
    }
  }

  return NextResponse.json({ success: true, data: { ...safeUser, todayAttendance } });
}
