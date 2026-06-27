import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: announcements });
}

export async function POST(request: Request) {
  const authResponse = await requireAdmin();
  if (authResponse instanceof Response) return authResponse;

  const body = await request.json();
  const { title, body: content, tag, authorId } = body;

  const announcement = await prisma.announcement.create({
    data: { title, body: content, tag, authorId: Number(authorId) },
  });
  return NextResponse.json({ success: true, data: announcement }, { status: 201 });
}
