import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const queryWhere = user.role === "ADMIN" ? {} : { employee: { userId: user.userId } };

  const tasks = await prisma.task.findMany({
    where: queryWhere,
    include: { employee: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: tasks.length,
    inProgress: tasks.filter(t => t.status === "IN_PROGRESS").length,
    done: tasks.filter(t => t.status === "DONE").length,
  };

  return NextResponse.json({ 
    success: true, 
    data: { stats, tasks, role: user.role } 
  });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, employeeId, dueDate, priority, status } = body;

  const task = await prisma.task.create({
    data: {
      title,
      description,
      employeeId: Number(employeeId),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      status: status || "TODO",
    },
  });
  return NextResponse.json({ success: true, data: task }, { status: 201 });
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { taskId, status } = body;

  const task = await prisma.task.update({
    where: { id: Number(taskId) },
    data: { status },
  });
  return NextResponse.json({ success: true, data: task });
}
