import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const authResponse = await requireAdmin();
  if (authResponse instanceof Response) return authResponse;

  const { id, action } = await params;
  const userId = parseInt(id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ success: false, error: "Invalid user ID" }, { status: 400 });
  }

  if (action === "approve") {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });
    return NextResponse.json({ success: true, data: user });
  } else if (action === "reject") {
    // If rejected, we might want to delete the user and employee record entirely
    await prisma.user.delete({
      where: { id: userId },
    });
    return NextResponse.json({ success: true, message: "User request rejected and deleted" });
  }

  return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
}
