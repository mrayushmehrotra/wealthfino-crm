import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  // Check if current user is an admin
  const authResponse = await requireAdmin();
  if (authResponse instanceof Response) {
    return authResponse; // Unauthorized
  }

  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Email is required" } },
      { status: 400 }
    );
  }

  // Check if user already exists in the system
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { success: false, error: { code: "CONFLICT", message: "User already exists with this email." } },
      { status: 409 }
    );
  }

  // Add to AllowedEmail
  const allowed = await prisma.allowedEmail.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  return NextResponse.json({ success: true, data: allowed }, { status: 201 });
}

export async function GET() {
  const authResponse = await requireAdmin();
  if (authResponse instanceof Response) {
    return authResponse;
  }

  const allowedEmails = await prisma.allowedEmail.findMany({
    orderBy: { createdAt: "desc" },
  });
  
  return NextResponse.json({ success: true, data: allowedEmails });
}
