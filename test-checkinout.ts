import { prisma } from "./apps/web/lib/db";

async function test() {
  try {
    const employeeId = 2;
    const checkInOut = await prisma.$queryRawUnsafe<Array<{ checkIns: bigint; checkOuts: bigint }>>(
      `SELECT
         COUNT(CASE WHEN check_in IS NOT NULL THEN 1 END) AS checkIns,
         COUNT(CASE WHEN check_out IS NOT NULL THEN 1 END) AS checkOuts
       FROM attendance WHERE employee_id = ${employeeId}`
    );
    console.log("checkInOut:", checkInOut);
    console.log(JSON.stringify(checkInOut));
  } catch (e) {
    console.error("Query Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
