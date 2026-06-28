import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Email and password required" } },
      { status: 400 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || null;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { employee: true },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
      { status: 401 }
    );
  }

  if (!user.isApproved) {
    return NextResponse.json(
      { success: false, error: { code: "FORBIDDEN", message: "Your account is currently pending admin approval." } },
      { status: 403 }
    );
  }

  const bcrypt = await import("bcryptjs");
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
      { status: 401 }
    );
  }

  const jwt = await import("jsonwebtoken");
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  if (user.employee) {
    const todayStr = new Date().toISOString().split("T")[0]!;
    const today = new Date(todayStr);
    const now = new Date();

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: user.employee.id,
          date: today,
        },
      },
    });

    if (!existingAttendance) {
      await prisma.attendance.create({
        data: {
          employeeId: user.employee.id,
          date: today,
          checkIn: now,
          status: "PRESENT",
        },
      });
    }

    if (ip) {
      await prisma.employee.update({
        where: { id: user.employee.id },
        data: { lastIp: ip },
      });
    }
  }

  const response = NextResponse.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      role: user.role,
      employee: user.employee,
    },
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
