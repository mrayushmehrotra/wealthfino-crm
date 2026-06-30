import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin, getUser } from "@/lib/auth";

export async function GET() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });

  const authorIds = announcements.map(a => a.authorId);
  const users = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    include: { employee: true }
  });

  const userMap = new Map();
  users.forEach(u => {
    userMap.set(u.id, u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : "Admin");
  });

  const data = announcements.map(a => {
    let tagColor = "bg-[#DBEAFE] text-[#1D4ED8]"; // default blue
    if (a.tag?.toLowerCase() === "important") tagColor = "bg-[#FEE2E2] text-[#EF4444]";
    if (a.tag?.toLowerCase() === "event") tagColor = "bg-[#FEF3C7] text-[#D97706]";
    
    return {
      id: a.id,
      title: a.title,
      body: a.body,
      tag: a.tag || "General",
      tagColor,
      author: userMap.get(a.authorId) || "System",
      date: new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
  });

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const authResponse = await requireAdmin();
  if (authResponse instanceof Response) return authResponse;

  const user = authResponse;
  const body = await request.json();
  const { title, body: content, tag } = body;

  if (!title || !content) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  const announcement = await prisma.announcement.create({
    data: { 
      title, 
      body: content, 
      tag: tag || "Announcement", 
      authorId: user.userId 
    },
  });
  return NextResponse.json({ success: true, data: announcement }, { status: 201 });
}
