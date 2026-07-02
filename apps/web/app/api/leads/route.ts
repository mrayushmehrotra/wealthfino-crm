import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function GET() {
  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = sessionUser.role === "ADMIN";

  if (isAdmin) {
    const leads = await prisma.lead.findMany({
      include: {
        assignedEmployee: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: leads });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.userId },
    include: { employee: { select: { id: true } } },
  });

  if (!user?.employee) {
    return NextResponse.json({ success: true, data: [] });
  }

  const leads = await prisma.lead.findMany({
    where: { assignedTo: user.employee.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: leads });
}

export async function DELETE(request: Request) {
  const sessionUser = await getUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
  }

  await prisma.lead.delete({ where: { id: parseInt(id, 10) } });
  return NextResponse.json({ success: true, message: "Lead deleted" });
}
