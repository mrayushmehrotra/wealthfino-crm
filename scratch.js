const fs = require("fs")
const path = require("path")

const dir = "./apps/web/app/(dashboard)"
const mapping = {
  "support/page.tsx": { var: "FAQS", api: "/api/support" },
  "documents/page.tsx": { var: "DOCS", api: "/api/documents" },
  "calendar/page.tsx": { var: "EVENTS", api: "/api/calendar" },
  "salary-payroll/page.tsx": { var: "PAYROLL", api: "/api/payroll" },
  "performance/page.tsx": { var: "PERFORMANCE", api: "/api/performance" },
  "announcements/page.tsx": { var: "ANNOUNCEMENTS", api: "/api/announcements" },
  "work-log/page.tsx": { var: "LOGS", api: "/api/work-log" },
  "task-management/page.tsx": { var: "TASKS", api: "/api/tasks" },
  "leave-management/page.tsx": { var: "LEAVES", api: "/api/leave" },
  "attendance/page.tsx": { var: "ATTENDANCE", api: "/api/attendance" },
  "employees/page.tsx": { var: "EMPLOYEES", api: "/api/employees" },
  "daily-reports/page.tsx": { var: "REPORTS", api: "/api/reports" },
}

for (const [file, info] of Object.entries(mapping)) {
  const p = path.join(dir, file)
  if (!fs.existsSync(p)) continue

  let content = fs.readFileSync(p, "utf8")

  // Replace `const VAR = queryData?.data || []` with `const VAR: any[] = queryData?.data || []`
  const searchStr = `const ${info.var} = queryData?.data || []`
  const replaceStr = `const ${info.var}: any[] = queryData?.data || []`

  if (content.includes(searchStr)) {
    content = content.replace(searchStr, replaceStr)
    fs.writeFileSync(p, content)
  }
}
console.log("Fixed typescript inference for variables")
