import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const authResponse = await requireAdmin();
  if (authResponse instanceof Response) return authResponse;

  const pendingUsers = await prisma.user.findMany({
    where: { isApproved: false },
    include: { employee: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: pendingUsers });
}
