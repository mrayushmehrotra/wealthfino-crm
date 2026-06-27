import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export interface SessionUser {
  userId: number;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
}

export async function getUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<SessionUser | Response> {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return new Response(JSON.stringify({ success: false, error: { message: "Unauthorized: Admin access required" } }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return user;
}
