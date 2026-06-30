import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getUser, requireAdmin } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const employees = await prisma.employee.findMany({
    include: {
      user: { select: { email: true, role: true } },
      _count: {
        select: {
          attendance: true,
          leaveRequests: true,
          tasks: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const employeeIds = employees.map(e => e.id);

  const checkInOutCounts = employeeIds.length > 0
    ? await prisma.$queryRawUnsafe<Array<{ employeeId: number; checkIns: bigint; checkOuts: bigint }>>(
        `SELECT employee_id AS employeeId,
                COUNT(CASE WHEN check_in IS NOT NULL THEN 1 END) AS checkIns,
                COUNT(CASE WHEN check_out IS NOT NULL THEN 1 END) AS checkOuts
         FROM attendance WHERE employee_id IN (${employeeIds.join(",")})
         GROUP BY employee_id`
      )
    : [];

  const checkInMap = new Map(checkInOutCounts.map(c => [c.employeeId, { checkIns: Number(c.checkIns), checkOuts: Number(c.checkOuts) }]));

  // Extract IPs to fetch locations
  const ipsToFetch = employees.map(e => e.lastIp).filter((ip): ip is string => Boolean(ip) && ip !== "::1" && ip !== "127.0.0.1" && ip !== "localhost");
  const uniqueIps = Array.from(new Set(ipsToFetch));
  
  let ipLocations: Record<string, string> = {};
  if (uniqueIps.length > 0) {
    try {
      const res = await fetch("http://ip-api.com/batch", {
        method: "POST",
        body: JSON.stringify(uniqueIps),
      });
      if (res.ok) {
        const data = await res.json();
        data.forEach((loc: any) => {
          if (loc.status === "success" && loc.query) {
            ipLocations[loc.query] = `${loc.city}, ${loc.country}`;
          }
        });
      }
    } catch (e) {
      console.error("Failed to fetch IP locations", e);
    }
  }

  const enrichedEmployees = employees.map(e => {
    const counts = checkInMap.get(e.id);
    return {
      id: e.id,
      userId: e.userId,
      firstName: e.firstName,
      lastName: e.lastName,
      phone: e.phone,
      address: e.address,
      aadharCard: e.aadharCard,
      panNumber: e.panNumber,
      salary: e.salary ? Number(e.salary) : null,
      bonus: e.bonus ? Number(e.bonus) : 0,
      department: e.department,
      designation: e.designation,
      image: e.image,
      joinedAt: e.joinedAt,
      updatedAt: e.updatedAt,
      lastIp: e.lastIp,
      location: e.lastIp ? (ipLocations[e.lastIp] || "Unknown Location") : "N/A",
      user: e.user,
      totalAttendance: e._count.attendance,
      totalLeaves: e._count.leaveRequests,
      totalTasks: e._count.tasks,
      totalCheckIns: counts?.checkIns || 0,
      totalCheckOuts: counts?.checkOuts || 0,
    };
  });

  return NextResponse.json({ success: true, data: enrichedEmployees });
}

export async function POST(request: Request) {
  const authResponse = await requireAdmin();
  if (authResponse instanceof Response) return authResponse;

  const body = await request.json();
  const { email, password, firstName, lastName, department, designation, phone } = body;

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: "Missing required fields" } },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { success: false, error: { code: "CONFLICT", message: "Email already in use" } },
      { status: 409 }
    );
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  const employee = await prisma.employee.create({
    data: {
      firstName,
      lastName,
      phone,
      department,
      designation,
      user: { create: { email, passwordHash } },
    },
    include: { user: { select: { email: true, role: true } } },
  });

  return NextResponse.json({ success: true, data: employee }, { status: 201 });
}
