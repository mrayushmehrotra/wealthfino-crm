import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const employees = await prisma.employee.findMany({
    include: { user: { select: { email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

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

  const enrichedEmployees = employees.map(e => ({
    ...e,
    location: e.lastIp ? (ipLocations[e.lastIp] || "Unknown Location") : "N/A",
  }));

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
