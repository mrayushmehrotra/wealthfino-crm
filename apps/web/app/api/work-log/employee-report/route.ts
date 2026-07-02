import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUser } from "@/lib/auth";

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function generateEmployeeReportHTML(
  empName: string,
  email: string,
  department: string,
  designation: string,
  joinedAt: Date,
  entries: { date: string; time: string; task: string; status: string }[],
  totalHours: number,
  totalDays: number,
) {
  const tableRows = entries.map((e) => `
            <tr>
              <td class="date">${e.date}</td>
              <td class="time">${e.time}</td>
              <td class="task">${e.task}</td>
              <td class="status">${e.status}</td>
            </tr>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Work Report - ${empName}</title>
  <style>
    @page { margin: 12mm; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      color: #1A202C;
      padding: 32px 36px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 20px;
    }
    .header h1 { font-size: 22px; font-weight: 700; color: #0A2C72; }
    .header .sub { font-size: 12px; color: #57B947; font-weight: 600; margin-top: 2px; }
    .header .co { font-size: 14px; font-weight: 700; color: #0A2C72; text-align: right; }
    hr { border: none; border-top: 1px solid #D0D5DD; margin-bottom: 20px; }
    .info-card {
      border: 1px solid #D0D5DD; border-radius: 8px; padding: 16px 20px;
      margin-bottom: 20px; display: flex; gap: 32px;
    }
    .info-col { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 11px; color: #888; }
    .info-value { font-size: 14px; font-weight: 600; color: #0A2C72; }
    .summary {
      display: flex; gap: 16px; margin-bottom: 20px;
    }
    .summary-card {
      flex: 1; border: 1px solid #D0D5DD; border-radius: 8px;
      padding: 16px; text-align: center;
    }
    .summary-card .num { font-size: 28px; font-weight: 700; color: #0A2C72; }
    .summary-card .lbl { font-size: 11px; color: #888; text-transform: uppercase; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #D0D5DD; border-radius: 6px; overflow: hidden; }
    thead tr { background: #0A2C72; }
    thead th {
      padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600;
      color: #fff; text-transform: uppercase; letter-spacing: 0.5px;
    }
    thead th:last-child { text-align: right; }
    tbody td { padding: 9px 14px; font-size: 12px; border-bottom: 1px solid #E5E7EB; }
    td.date { color: #555; white-space: nowrap; width: 120px; }
    td.time { color: #555; white-space: nowrap; width: 140px; }
    td.task { color: #333; }
    td.status { text-align: right; font-weight: 500; }
    tbody tr:nth-child(even) { background: #F9FAFB; }
    .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Employee Work Report</h1>
      <div class="sub">${empName}</div>
    </div>
    <div>
      <div class="co">WealthFino Capital</div>
    </div>
  </div>
  <hr />
  <div class="info-card">
    <div class="info-col">
      <span class="info-label">Name</span>
      <span class="info-value">${empName}</span>
    </div>
    <div class="info-col">
      <span class="info-label">Email</span>
      <span class="info-value">${email}</span>
    </div>
    <div class="info-col">
      <span class="info-label">Department</span>
      <span class="info-value">${department || "—"}</span>
    </div>
    <div class="info-col">
      <span class="info-label">Designation</span>
      <span class="info-value">${designation || "—"}</span>
    </div>
    <div class="info-col">
      <span class="info-label">Joined</span>
      <span class="info-value">${fmtDate(joinedAt)}</span>
    </div>
  </div>
  <div class="summary">
    <div class="summary-card">
      <div class="num">${totalDays}</div>
      <div class="lbl">Days Worked</div>
    </div>
    <div class="summary-card">
      <div class="num">${totalHours.toFixed(1)}</div>
      <div class="lbl">Total Hours</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Time</th>
        <th>Task</th>
        <th style="text-align:right;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows || '<tr><td colspan="4" style="text-align:center;padding:20px;color:#999;">No work log entries found.</td></tr>'}
    </tbody>
  </table>
  <div class="footer">This is a system generated report and does not require any signature.</div>
</body>
</html>`;
}

export async function GET(request: Request) {
  const sessionUser = await getUser();
  if (!sessionUser) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const employeeId = searchParams.get("employeeId");
  if (!employeeId) {
    return NextResponse.json({ success: false, error: "employeeId is required" }, { status: 400 });
  }

  const empId = parseInt(employeeId, 10);
  const isAdmin = sessionUser.role === "ADMIN";

  const employee = await prisma.employee.findUnique({
    where: { id: empId },
    include: {
      user: { select: { email: true } },
      workLogs: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!employee) {
    return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
  }

  // Non-admin can only view their own report
  if (!isAdmin && employee.userId !== sessionUser.userId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const entries = employee.workLogs.map((wl) => ({
    date: fmtDate(wl.date),
    time: `${fmtTime(wl.startTime)} - ${fmtTime(wl.endTime)}`,
    task: wl.task,
    status: wl.status,
  }));

  const totalHours = employee.workLogs.reduce((s, wl) => s + wl.hours, 0);
  const uniqueDays = new Set(employee.workLogs.map((wl) => wl.date.toISOString().split("T")[0])).size;
  const empName = `${employee.firstName} ${employee.lastName}`;

  const html = generateEmployeeReportHTML(
    empName,
    employee.user?.email || "",
    employee.department || "",
    employee.designation || "",
    employee.joinedAt,
    entries,
    totalHours,
    uniqueDays,
  );

  const filename = `work-report-${employee.firstName.toLowerCase()}-${employee.lastName.toLowerCase()}.html`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
