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

  // Check if admin has allowed this email (bypass for the master admin)
  if (!isAdminEmail) {
    const allowed = await prisma.allowedEmail.findUnique({
      where: { email },
    });

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "This email has not been authorized by an admin." } },
        { status: 403 }
      );
    }
  }

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

  // Create User and Employee, and delete the allowed email record in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        role: isAdminEmail ? "ADMIN" : "EMPLOYEE",
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
      await tx.allowedEmail.delete({ where: { email } });
    }

    return newUser;
  });

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
