import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  const authResponse = await requireAdmin()
  if (authResponse instanceof Response) return authResponse

  const payload = await request.json().catch(() => null)
  const endpoints = Array.isArray(payload?.endpoints) ? payload.endpoints : []

  if (endpoints.length === 0) {
    return NextResponse.json(
      { success: false, error: "No endpoints provided" },
      { status: 400 }
    )
  }

  const pushModel = prisma as typeof prisma & {
    pushSubscription: any
  }

  const result = await pushModel.pushSubscription.deleteMany({
    where: { endpoint: { in: endpoints } },
  })

  return NextResponse.json({
    success: true,
    data: { deleted: result.count },
  })
}
