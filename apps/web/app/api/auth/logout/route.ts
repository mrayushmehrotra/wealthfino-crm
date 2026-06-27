import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number, role: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { employee: true },
      });

      if (user?.employee) {
        const todayStr = new Date().toISOString().split("T")[0];
        const today = new Date(todayStr);
        
        await prisma.attendance.updateMany({
          where: {
            employeeId: user.employee.id,
            date: today,
          },
          data: {
            checkOut: new Date(),
          }
        });
      }
    } catch (e) {
      // Ignore token verification errors on logout
      console.error("Logout attendance tracking error:", e);
    }
  }

  const response = NextResponse.json({ success: true });
  
  response.cookies.delete("token");
  
  return response;
}
