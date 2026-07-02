import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getUser } from "@/lib/auth"

export async function PATCH(request: Request) {
  const sessionUser = await getUser()
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()
    const { leadIds, employeeIds, employeeId } = body

    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "leadIds array is required" },
        { status: 400 }
      )
    }

    const krishnaEmployee = await prisma.employee.findFirst({
      where: {
        user: {
          email: "info@krishnapathak.com",
          role: "ADMIN",
        },
      },
      select: { id: true },
    })

    const targetEmployeeIds = Array.isArray(employeeIds)
      ? employeeIds
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id >= 0)
      : employeeId === undefined || employeeId === null
        ? []
        : [Number(employeeId)]

    const fallbackEmployeeId = krishnaEmployee?.id || 0
    const resolvedEmployeeIds =
      targetEmployeeIds.length > 0 ? targetEmployeeIds : [fallbackEmployeeId]

    for (const id of resolvedEmployeeIds) {
      if (id === 0) continue
      const employee = await prisma.employee.findUnique({ where: { id } })
      if (!employee) {
        return NextResponse.json(
          { success: false, error: "Employee not found" },
          { status: 404 }
        )
      }
    }

    if (resolvedEmployeeIds.length === 1) {
      const assignTo =
        resolvedEmployeeIds[0] === 0 ? null : resolvedEmployeeIds[0]
      await prisma.lead.updateMany({
        where: { id: { in: leadIds } },
        data: { assignedTo: assignTo },
      })
    } else {
      await prisma.$transaction(
        leadIds.map((leadId, index) =>
          prisma.lead.update({
            where: { id: leadId },
            data: {
              assignedTo:
                resolvedEmployeeIds[index % resolvedEmployeeIds.length] === 0
                  ? null
                  : resolvedEmployeeIds[index % resolvedEmployeeIds.length],
            },
          })
        )
      )
    }

    return NextResponse.json({
      success: true,
      message: `${leadIds.length} lead(s) assigned successfully`,
    })
  } catch (err) {
    console.error("Assign error:", err)
    return NextResponse.json(
      { success: false, error: "Failed to assign leads" },
      { status: 500 }
    )
  }
}
