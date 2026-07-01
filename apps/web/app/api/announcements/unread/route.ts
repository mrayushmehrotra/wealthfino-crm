import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const total = await prisma.announcement.count();

  const readCount = await prisma.announcementRead.count({
      where: { userId: user.userId },
  });

  return NextResponse.json({ success: true, data: { unread: total - readCount } });
}
