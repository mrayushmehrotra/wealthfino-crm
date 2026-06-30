import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function PUT(
  _request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  const auth = await requireAdmin();
  if (auth instanceof Response) return auth;

  const { id, action } = await params;

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  }

  const requestId = parseInt(id);
  if (isNaN(requestId)) {
    return NextResponse.json({ success: false, error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.payrollDownloadRequest.findUnique({
    where: { id: requestId },
  });
  if (!existing) {
    return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
  }
  if (existing.status !== "PENDING") {
    return NextResponse.json({ success: false, error: "Request already reviewed" }, { status: 400 });
  }

  const admin = await prisma.employee.findUnique({
    where: { userId: auth.userId },
    select: { id: true },
  });

  const updated = await prisma.payrollDownloadRequest.update({
    where: { id: requestId },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      reviewedAt: new Date(),
      reviewedBy: admin?.id ?? null,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
