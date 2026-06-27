import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  // Fetch real-time data from database
  const totalEmployees = await prisma.employee.count();
  
  // Since attendance models aren't fully built out yet, 
  // we will return real counts for employees and zeros/placeholders for the rest.
  return NextResponse.json({
    success: true,
    data: {
      totalEmployees,
      presentToday: 0,
      absent: 0,
      onLeave: 0,
    }
  });
}
