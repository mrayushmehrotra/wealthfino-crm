import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { sendPushNotification } from "@/lib/push-notifications"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number(searchParams.get("limit") || "0")
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    take: limit > 0 ? limit : undefined,
  })

  const authorIds = announcements.map((a) => a.authorId)
  const users = await prisma.user.findMany({
    where: { id: { in: authorIds } },
    include: { employee: true },
  })

  const userMap = new Map()
  users.forEach((u) => {
    userMap.set(
      u.id,
      u.employee ? `${u.employee.firstName} ${u.employee.lastName}` : "Admin"
    )
  })

  const data = announcements.map((a) => {
    let tagColor = "bg-[#DBEAFE] text-[#1D4ED8]" // default blue
    if (a.tag?.toLowerCase() === "important")
      tagColor = "bg-[#FEE2E2] text-[#EF4444]"
    if (a.tag?.toLowerCase() === "event")
      tagColor = "bg-[#FEF3C7] text-[#D97706]"

    return {
      id: a.id,
      title: a.title,
      body: a.body,
      tag: a.tag || "General",
      tagColor,
      author: userMap.get(a.authorId) || "System",
      date: new Date(a.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }
  })

  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  const authResponse = await requireAdmin()
  if (authResponse instanceof Response) return authResponse

  const user = authResponse
  const body = await request.json()
  const { title, body: content, tag } = body

  if (!title || !content) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    )
  }

  const announcement = await prisma.announcement.create({
    data: {
      title,
      body: content,
      tag: tag || "Announcement",
      authorId: user.userId,
    },
  })

  const pushModel = prisma as typeof prisma & {
    pushSubscription: any
  }

  const subscriptions = await pushModel.pushSubscription.findMany({
    select: { endpoint: true },
  })

  await Promise.allSettled(
    subscriptions.map(async ({ endpoint }: { endpoint: string }) => {
      const res = await sendPushNotification(endpoint)
      if (res.status === 404 || res.status === 410) {
        await pushModel.pushSubscription.deleteMany({ where: { endpoint } })
      }
    })
  )

  return NextResponse.json(
    { success: true, data: announcement },
    { status: 201 }
  )
}
