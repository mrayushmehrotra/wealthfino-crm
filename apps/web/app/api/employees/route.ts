import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const employees = await prisma.employee.findMany({
    include: { user: { select: { email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: employees });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, firstName, lastName, department, designation, phone } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: { code: "CONFLICT", message: "Email already in use" } },
      { status: 409 }
    );
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  const employee = await prisma.employee.create({
    data: {
      firstName,
      lastName,
      phone,
      department,
      designation,
      user: { create: { email, passwordHash } },
    },
    include: { user: { select: { email: true, role: true } } },
  });

  return NextResponse.json({ success: true, data: employee }, { status: 201 });
}
