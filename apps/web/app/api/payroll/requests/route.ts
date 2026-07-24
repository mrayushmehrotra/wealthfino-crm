import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const where: Record<string, unknown> = {};

  if (user.role !== "ADMIN") {
    const emp = await prisma.employee.findUnique({
      where: { userId: user.userId },
      select: { id: true },
    });
    if (!emp) return NextResponse.json({ success: false, data: [] });
    where.employeeId = emp.id;
  }

  const requests = await prisma.payrollDownloadRequest.findMany({
    where,
    include: {
      payroll: {
        select: {
          month: true,
          year: true,
          netPay: true,
          employee: { select: { firstName: true, lastName: true } },
        },
      },
      employee: { select: { firstName: true, lastName: true, department: true } },
    },
    orderBy: { requestedAt: "desc" },
  });

  const data = requests.map((r) => ({
    id: r.id,
    payrollId: r.payrollId,
    employeeId: r.employeeId,
    status: r.status,
    requestedAt: r.requestedAt,
    reviewedAt: r.reviewedAt,
    month: r.payroll.month,
    year: r.payroll.year,
    netPay: Number(r.payroll.netPay),
    employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
    department: r.employee.department,
  }));

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: user.userId },
    select: { id: true },
  });
  if (!employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  const body = await req.json();
  const { payrollId } = body;

  if (!payrollId) {
    return NextResponse.json({ success: false, error: "payrollId is required" }, { status: 400 });
  }

  const payroll = await prisma.payroll.findUnique({
    where: { id: Number(payrollId) },
    select: { id: true, employeeId: true },
  });
  if (!payroll) {
    return NextResponse.json({ success: false, error: "Payroll record not found" }, { status: 404 });
  }

  if (payroll.employeeId !== employee.id) {
    return NextResponse.json({ success: false, error: "You can only request your own payslips" }, { status: 403 });
  }

  const existing = await prisma.payrollDownloadRequest.findFirst({
    where: { payrollId: Number(payrollId), employeeId: employee.id, status: "PENDING" },
  });
  if (existing) {
    return NextResponse.json({ success: false, error: "A pending request already exists for this payslip" }, { status: 409 });
  }

  const created = await prisma.payrollDownloadRequest.create({
    data: {
      payrollId: Number(payrollId),
      employeeId: employee.id,
    },
  });

  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
