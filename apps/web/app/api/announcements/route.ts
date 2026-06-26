import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: announcements });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, body: content, tag, authorId } = body;

  const announcement = await prisma.announcement.create({
    data: { title, body: content, tag, authorId: Number(authorId) },
  });
  return NextResponse.json({ success: true, data: announcement }, { status: 201 });
}
