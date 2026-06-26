import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const { id, action } = await params;

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "Action must be approve or reject" } },
      { status: 400 }
    );
  }

  const leave = await prisma.leaveRequest.update({
    where: { id: Number(id) },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, data: leave });
}
