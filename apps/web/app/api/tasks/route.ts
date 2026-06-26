import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const tasks = await prisma.task.findMany({
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: tasks });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, description, employeeId, dueDate, priority, status } = body;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      employeeId: Number(employeeId),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      status,
    },
  });
  return NextResponse.json({ success: true, data: task }, { status: 201 });
}
