import { NextResponse } from "next/server"

import { getUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import type { SerializedPushSubscription } from "@/lib/push-notifications"

export async function POST(request: Request) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const payload = (await request.json()) as SerializedPushSubscription
  const endpoint = payload?.endpoint
  const p256dh = payload?.keys?.p256dh
  const auth = payload?.keys?.auth

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json(
      { success: false, error: "Invalid push subscription" },
      { status: 400 }
    )
  }

  const pushModel = prisma as typeof prisma & {
    pushSubscription: any
  }

  await pushModel.pushSubscription.upsert({
    where: { endpoint },
    update: {
      userId: user.userId,
      p256dh,
      auth,
    },
    create: {
      userId: user.userId,
      endpoint,
      p256dh,
      auth,
    },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    )
  }

  const payload = await request.json().catch(() => null)
  const endpoint = payload?.endpoint
  if (!endpoint) {
    return NextResponse.json(
      { success: false, error: "Missing endpoint" },
      { status: 400 }
    )
  }

  const pushModel = prisma as typeof prisma & {
    pushSubscription: any
  }

  await pushModel.pushSubscription.deleteMany({
    where: { userId: user.userId, endpoint },
  })

  return NextResponse.json({ success: true })
}
