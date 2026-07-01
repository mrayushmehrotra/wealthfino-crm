import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ success: true, data: [] });
  }

  const searchTerm = `%${q}%`;

  const employees = await prisma.$queryRawUnsafe<Array<{
    id: number;
    first_name: string;
    last_name: string;
    phone: string | null;
    department: string | null;
    designation: string | null;
    salary: string | null;
    email: string;
    role: string;
  }>>(
    `SELECT e.id, e.first_name, e.last_name, e.phone, e.department, e.designation, CAST(e.salary AS TEXT),
            u.email, u.role
     FROM employees e
     JOIN users u ON u.id = e.user_id
     WHERE e.first_name ILIKE $1 OR e.last_name ILIKE $2
        OR e.phone ILIKE $3 OR CAST(e.salary AS TEXT) ILIKE $4
        OR u.email ILIKE $5
     LIMIT 20`,
    searchTerm, searchTerm, searchTerm, searchTerm, searchTerm
  );

  const data = employees.map((e) => ({
    id: e.id,
    firstName: e.first_name,
    lastName: e.last_name,
    phone: e.phone,
    department: e.department,
    designation: e.designation,
    salary: e.salary ? Number(e.salary) : null,
    email: e.email,
    role: e.role,
    name: `${e.first_name} ${e.last_name}`,
  }));

  return NextResponse.json({ success: true, data });
}
