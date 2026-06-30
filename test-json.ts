import { prisma } from "./apps/web/lib/db";
import { NextResponse } from "next/server"; // Can't easily use NextResponse in a pure node script

async function test() {
  try {
    const employeeId = 2;
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        payroll: true,
      },
    });
    console.log(JSON.stringify(employee));
  } catch (e) {
    console.error("Query Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
