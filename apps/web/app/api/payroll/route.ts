import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month") ?? new Date().getMonth() + 1);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());

  const where: Record<string, unknown> = { month, year };

  if (user.role !== "ADMIN") {
    const emp = await prisma.employee.findUnique({ where: { userId: user.userId }, select: { id: true } });
    if (!emp) return NextResponse.json({ success: false, data: [] });
    where.employeeId = emp.id;
  }

  const payroll = await prisma.payroll.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          department: true,
          designation: true,
          salary: true,
          user: { select: { email: true, role: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = payroll.map((p) => ({
    id: p.id,
    employeeId: p.employeeId,
    name: `${p.employee.firstName} ${p.employee.lastName}`,
    role: p.employee.designation || p.employee.user.role,
    department: p.employee.department,
    basic: Number(p.basic),
    allowances: Number(p.allowances),
    deductions: Number(p.deductions),
    bonus: Number(p.bonus),
    netPay: Number(p.netPay),
    status: p.status,
  }));

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const month = Number(body.month ?? new Date().getMonth() + 1);
  const year = Number(body.year ?? new Date().getFullYear());
  const selected: Array<{ employeeId: number; bonus?: number }> = body.employees;

  let employees;
  if (selected && selected.length > 0) {
    const ids = selected.map((s) => s.employeeId);
    employees = await prisma.employee.findMany({
      where: { id: { in: ids }, salary: { not: null } },
    });
  } else {
    employees = await prisma.employee.findMany({
      where: { salary: { not: null } },
    });
  }

  const results = [];
  for (const emp of employees) {
    const basic = Number(emp.salary);
    const sel = selected?.find((s) => s.employeeId === emp.id);
    const bonus = sel?.bonus ?? Number(emp.bonus ?? 0);
    const allowances = Math.round(basic * 0.1 * 100) / 100;
    const deductions = Math.round(basic * 0.05 * 100) / 100;
    const netPay = Math.round((basic + allowances + bonus - deductions) * 100) / 100;

    const record = await prisma.payroll.upsert({
      where: { employeeId_month_year: { employeeId: emp.id, month, year } },
      update: { basic, allowances, deductions, bonus, netPay, status: "PROCESSED" },
      create: {
        employeeId: emp.id,
        month,
        year,
        basic,
        allowances,
        deductions,
        bonus,
        netPay,
        status: "PROCESSED",
      },
    });
    results.push(record);
  }

  return NextResponse.json({ success: true, data: results });
}
