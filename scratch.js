const fs = require('fs');
const path = require('path');

const dir = './apps/web/app/(dashboard)';
const files = [
  'support/page.tsx', 'documents/page.tsx', 'calendar/page.tsx', 'salary-payroll/page.tsx',
  'performance/page.tsx', 'announcements/page.tsx', 'work-log/page.tsx', 'task-management/page.tsx',
  'leave-management/page.tsx', 'attendance/page.tsx', 'employees/page.tsx', 'daily-reports/page.tsx',
  'dashboard/page.tsx'
];

for (const f of files) {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  
  // Regex to match `const VAR = [ ... ]`
  // We need to match everything between `[` and `]` without being greedy.
  // Actually, some arrays have objects. This simple regex works if they are formatted conventionally.
  content = content.replace(/const (FAQS|DOCS|EVENTS|PAYROLL|PERFORMANCE|ANNOUNCEMENTS|LOGS|TASKS|LEAVES|ATTENDANCE|EMPLOYEES|REPORTS) = \[[\s\S]*?\n\]/g, 'const $1: any[] = []');
  
  fs.writeFileSync(p, content);
}
console.log('Cleared demo data from arrays');
