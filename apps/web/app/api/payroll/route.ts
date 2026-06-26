import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());

  const payroll = await prisma.payroll.findMany({
    where: { month, year },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, data: payroll });
}
