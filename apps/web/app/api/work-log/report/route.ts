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

function generateReportHTML(
  dateLabel: string,
  rows: { name: string; entries: { time: string; task: string; status: string }[]; totalHours: number }[],
) {
  const totalHoursAll = rows.reduce((s, r) => s + r.totalHours, 0);

  const bodyRows = rows.map((r) => {
    const entries = r.entries.map((e) => `
              <tr class="entry">
                <td class="time">${e.time}</td>
                <td class="task">${e.task}</td>
                <td class="status">${e.status}</td>
              </tr>`).join("");

    return `
            <tr class="employee-row">
              <td class="name" rowspan="${Math.max(r.entries.length, 1)}">${r.name}</td>
              ${entries || '<td class="time" colspan="2">No entries</td><td class="status">—</td>'}
            </tr>
            <tr class="subtotal">
              <td colspan="2">Subtotal</td>
              <td>${r.totalHours.toFixed(1)}h</td>
            </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Work Report - ${dateLabel}</title>
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
      margin-bottom: 24px;
    }
    .header h1 { font-size: 22px; font-weight: 700; color: #0A2C72; }
    .header .date { font-size: 14px; color: #57B947; font-weight: 600; margin-top: 4px; }
    .header .co-name { font-size: 14px; font-weight: 700; color: #0A2C72; text-align: right; }
    .header .co-tag { font-size: 11px; color: #777; }
    hr { border: none; border-top: 1px solid #D0D5DD; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #D0D5DD; border-radius: 6px; overflow: hidden; }
    thead tr { background: #0A2C72; }
    thead th {
      padding: 10px 16px; text-align: left; font-size: 11px; font-weight: 600;
      color: #fff; text-transform: uppercase; letter-spacing: 0.5px;
    }
    thead th:last-child { text-align: right; }
    tbody td { padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #E5E7EB; }
    td.name { font-weight: 600; color: #0A2C72; vertical-align: top; width: 160px; }
    td.time { color: #555; width: 130px; white-space: nowrap; }
    td.task { color: #333; }
    td.status { text-align: right; font-weight: 500; }
    tr.subtotal td {
      background: #F4F5F7; font-weight: 700; font-size: 13px;
      text-align: right; border-bottom: 2px solid #D0D5DD;
    }
    tr.subtotal td:first-child { text-align: right; }
    tr.total td {
      background: #0A2C72; color: #fff; font-weight: 700; font-size: 14px;
      text-align: right; padding: 12px 16px;
    }
    tr.total td:first-child { text-align: right; }
    .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; font-style: italic; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Daily Work Report</h1>
      <div class="date">${dateLabel}</div>
    </div>
    <div>
      <div class="co-name">WealthFino Capital</div>
      <div class="co-tag">Bangalore, Karnataka, India</div>
    </div>
  </div>
  <hr />
  <table>
    <thead>
      <tr>
        <th>Employee</th>
        <th>Time</th>
        <th>Task</th>
        <th style="text-align:right;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${bodyRows}
      <tr class="total">
        <td colspan="3">Total Hours</td>
        <td>${totalHoursAll.toFixed(1)}h</td>
      </tr>
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
  const dateStr = searchParams.get("date");
  if (!dateStr) {
    return NextResponse.json({ success: false, error: "Date is required" }, { status: 400 });
  }

  const targetDate = new Date(dateStr);
  const isAdmin = sessionUser.role === "ADMIN";
  const dateLabel = fmtDate(targetDate);

  const employees = await prisma.employee.findMany({
    include: {
      user: { select: { email: true, role: true } },
      workLogs: {
        where: { date: targetDate },
        orderBy: { startTime: "asc" },
      },
    },
    orderBy: { firstName: "asc" },
  });

  const filtered = isAdmin
    ? employees
    : employees.filter((e) => e.userId === sessionUser.userId);

  const rows = filtered.map((emp) => {
    const entries = emp.workLogs.map((wl) => ({
      time: `${fmtTime(wl.startTime)} - ${fmtTime(wl.endTime)}`,
      task: wl.task,
      status: wl.status,
    }));
    const totalHours = emp.workLogs.reduce((s, wl) => s + wl.hours, 0);
    return {
      name: `${emp.firstName} ${emp.lastName}`,
      entries,
      totalHours,
    };
  });

  const html = generateReportHTML(dateLabel, rows);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="work-report-${dateStr}.html"`,
    },
  });
}
