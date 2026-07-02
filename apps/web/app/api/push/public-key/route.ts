import { NextResponse } from "next/server"

import { getVapidPublicKey } from "@/lib/push-notifications"

export async function GET() {
  const publicKey = await getVapidPublicKey()
  return NextResponse.json({ success: true, data: { publicKey } })
}
