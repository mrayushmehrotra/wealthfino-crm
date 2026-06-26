import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const employee = await prisma.employee.findUnique({
    where: { id: Number(id) },
    include: { user: { select: { email: true, role: true } } },
  });
  if (!employee) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Employee not found" } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: employee });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { firstName, lastName, phone, department, designation } = body;

  const employee = await prisma.employee.update({
    where: { id: Number(id) },
    data: { firstName, lastName, phone, department, designation },
  });
  return NextResponse.json({ success: true, data: employee });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.employee.delete({ where: { id: Number(id) } });
  return new NextResponse(null, { status: 204 });
}
