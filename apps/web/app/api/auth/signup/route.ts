import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Name, email, and password required" } },
      { status: 400 }
    );
  }

  const isAdminEmail = email.toLowerCase() === "info@krishnapathak.com";

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: { code: "CONFLICT", message: "User already exists." } },
      { status: 409 }
    );
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  const [firstName, ...lastNameParts] = name.split(" ");
  const lastName = lastNameParts.join(" ") || "";

  // Create User and Employee
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: isAdminEmail ? "ADMIN" : "EMPLOYEE",
      isApproved: isAdminEmail, // Only master admin is auto-approved
      employee: {
        create: {
          firstName,
          lastName,
        },
      },
    },
    include: { employee: true },
  });

  if (!isAdminEmail) {
    return NextResponse.json({
      success: true,
      pending: true,
      message: "Your account request has been submitted and is pending admin approval.",
    }, { status: 201 });
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
  }, { status: 201 });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
