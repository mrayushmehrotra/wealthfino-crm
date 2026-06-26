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
