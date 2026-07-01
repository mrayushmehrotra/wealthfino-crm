import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function POST() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const announcements = await prisma.announcement.findMany({
    select: { id: true },
    where: {
      reads: { none: { userId: user.userId } },
    },
  });

  if (announcements.length === 0) {
    return NextResponse.json({ success: true });
  }

  await prisma.announcementRead.createMany({
    data: announcements.map((a) => ({
      announcementId: a.id,
      userId: user.userId,
    })),
    skipDuplicates: true,
  });

  return NextResponse.json({ success: true });
}
