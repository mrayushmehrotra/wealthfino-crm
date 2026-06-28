import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ip } = body;

    if (!ip) {
      return NextResponse.json({ success: false, error: "IP address missing" }, { status: 400 });
    }

    // Update the employee's last known IP
    await prisma.employee.updateMany({
      where: { userId: user.userId },
      data: { lastIp: ip }
    });

    return NextResponse.json({ success: true, message: "IP updated" });
  } catch {
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
