import { PrismaClient, Prisma, Role, AttendanceStatus, LeaveType, LeaveStatus, TaskPriority, TaskStatus, PayrollStatus, RequestStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const PASSWORD = 'Demo@123'
const NOW = new Date()

function daysAgo(n: number) {
  const d = new Date(NOW)
  d.setDate(d.getDate() - n)
  d.setHours(0, 0, 0, 0)
  return d
}

function hoursAgo(n: number) {
  const d = new Date(NOW)
  d.setHours(d.getHours() - n, 0, 0, 0)
  return d
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

const EMPLOYEES_DATA = [
  { firstName: 'Aarav', lastName: 'Sharma', department: 'Sales', designation: 'Executive', salary: 50000, phone: '9876543210' },
  { firstName: 'Priya', lastName: 'Verma', department: 'Marketing', designation: 'Manager', salary: 75000, phone: '9876543211' },
  { firstName: 'Rohit', lastName: 'Singh', department: 'Engineering', designation: 'Developer', salary: 60000, phone: '9876543212' },
  { firstName: 'Neha', lastName: 'Gupta', department: 'HR', designation: 'Executive', salary: 45000, phone: '9876543213' },
  { firstName: 'Vikram', lastName: 'Patel', department: 'Engineering', designation: 'Senior Developer', salary: 80000, phone: '9876543214' },
  { firstName: 'Ananya', lastName: 'Reddy', department: 'Sales', designation: 'Executive', salary: 48000, phone: '9876543215' },
  { firstName: 'Rahul', lastName: 'Kumar', department: 'Engineering', designation: 'Junior Developer', salary: 35000, phone: '9876543216' },
  { firstName: 'Sneha', lastName: 'Joshi', department: 'Marketing', designation: 'Executive', salary: 42000, phone: '9876543217' },
  { firstName: 'Arjun', lastName: 'Nair', department: 'Operations', designation: 'Manager', salary: 70000, phone: '9876543218' },
  { firstName: 'Kavita', lastName: 'Desai', department: 'Finance', designation: 'Accountant', salary: 55000, phone: '9876543219' },
  { firstName: 'Deepak', lastName: 'Pillai', department: 'Engineering', designation: 'DevOps Engineer', salary: 90000, phone: '9876543220' },
  { firstName: 'Meera', lastName: 'Iyer', department: 'HR', designation: 'Manager', salary: 72000, phone: '9876543221' },
  { firstName: 'Suresh', lastName: 'Rao', department: 'Sales', designation: 'Manager', salary: 78000, phone: '9876543222' },
  { firstName: 'Pooja', lastName: 'Mehta', department: 'Operations', designation: 'Executive', salary: 40000, phone: '9876543223' },
  { firstName: 'Amit', lastName: 'Chopra', department: 'Finance', designation: 'Manager', salary: 82000, phone: '9876543224' },
]

const DEPARTMENTS = ['Sales', 'Marketing', 'Engineering', 'HR', 'Operations', 'Finance']
const TASK_TEMPLATES = [
  { title: 'Review quarterly report', description: 'Analyze Q3 metrics and prepare summary' },
  { title: 'Update client documentation', description: 'Revise onboarding docs for new clients' },
  { title: 'Fix login page bug', description: 'Users report 500 error on login with special chars' },
  { title: 'Prepare team meeting agenda', description: 'Collect updates from each team member' },
  { title: 'Audit database queries', description: 'Optimize slow queries in reporting module' },
  { title: 'Design new landing page', description: 'Create mockup for product launch page' },
  { title: 'Process expense reports', description: 'Review and approve pending expense claims' },
  { title: 'Run security scan', description: 'Weekly vulnerability scan on staging environment' },
  { title: 'Send newsletter', description: 'Draft and send monthly newsletter to clients' },
  { title: 'Update employee handbook', description: 'Incorporate new policy changes in handbook' },
]

const WORK_TASKS = [
  'Working on dashboard UI improvements',
  'Code review for pull request #142',
  'Client call — requirements gathering',
  'Database migration for new schema',
  'Writing unit tests for attendance module',
  'Debugging payroll calculation issue',
  'Preparing monthly sales report',
  'Team standup and sprint planning',
  'Researching new CRM integrations',
  'Updating API documentation',
]

const LEAVE_REASONS = [
  'Not feeling well',
  'Family function',
  'Personal work',
  'Medical appointment',
  'Traveling out of town',
]

const LEAD_NAMES = [
  { name: 'Sunil Agarwal', email: 'sunil@example.com', phone: '9988776655', source: 'Website' },
  { name: 'Ritu Jain', email: 'ritu@example.com', phone: '9988776656', source: 'Referral' },
  { name: 'Manoj Tiwari', email: 'manoj@example.com', phone: '9988776657', source: 'LinkedIn' },
  { name: 'Anjali Kapoor', email: 'anjali@example.com', phone: '9988776658', source: 'Website' },
  { name: 'Karan Malhotra', email: 'karan@example.com', phone: '9988776659', source: 'Trade Show' },
  { name: 'Divya Saxena', email: 'divya@example.com', phone: '9988776660', source: 'Cold Call' },
  { name: 'Rajesh Khanna', email: 'rajesh@example.com', phone: '9988776661', source: 'Referral' },
  { name: 'Swati Mishra', email: 'swati@example.com', phone: '9988776662', source: 'Website' },
  { name: 'Vivek Oberoi', email: 'vivek@example.com', phone: '9988776663', source: 'LinkedIn' },
  { name: 'Pallavi Bhat', email: 'pallavi@example.com', phone: '9988776664', source: 'Advertisement' },
  { name: 'Gaurav Yadav', email: 'gaurav@example.com', phone: '9988776665', source: 'Website' },
  { name: 'Nandini Rao', email: 'nandini@example.com', phone: '9988776666', source: 'Referral' },
  { name: 'Akash Sinha', email: 'akash@example.com', phone: '9988776667', source: 'Trade Show' },
  { name: 'Isha Patel', email: 'isha@example.com', phone: '9988776668', source: 'LinkedIn' },
  { name: 'Ravi Kishan', email: 'ravi@example.com', phone: '9988776669', source: 'Cold Call' },
]

const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost']

const ANNOUNCEMENTS = [
  { title: 'Diwali Celebration — Office Timings', body: 'Office will remain closed on Nov 1st for Diwali. All employees are encouraged to celebrate with family. Wishing everyone a safe and happy Diwali!', tag: 'holiday' },
  { title: 'New Health Insurance Policy', body: 'We have partnered with Max Bupa for a new health insurance plan. Please check your email for details and submit enrollment forms by the 15th.', tag: 'policy' },
  { title: 'Quarterly Town Hall Meeting', body: 'Join us on the 25th at 3 PM in the main conference room for the quarterly town hall. We will discuss Q2 achievements and Q3 roadmap.', tag: 'meeting' },
  { title: 'Team Outing — This Saturday', body: 'We have organized a team outing to Lonavala this Saturday. Bus will depart from the office at 8 AM. Please RSVP by Thursday.', tag: 'event' },
  { title: 'Employee Recognition — July', body: 'Congratulations to Aarav Sharma (Sales) and Vikram Patel (Engineering) for their outstanding performance this month! Keep up the great work!', tag: 'recognition' },
  { title: 'IT Security Reminder', body: 'Please ensure your passwords are updated and 2FA is enabled. Report any suspicious emails to the IT team immediately.', tag: 'it' },
  { title: 'New Leave Policy Effective Aug 1', body: 'The updated leave policy now includes 2 additional casual leaves per year. Also, the sick leave carry-forward limit has been increased to 10 days.', tag: 'policy' },
  { title: 'Office Closed — Independence Day', body: 'The office will remain closed on August 15th on account of Independence Day.', tag: 'holiday' },
]

const PAYROLL_MONTHS = [
  { month: 4, year: 2026 },
  { month: 5, year: 2026 },
  { month: 6, year: 2026 },
]

async function main() {
  console.log('🌱 Seeding database...\n')

  // 1. Allowed emails
  const emails = ['info@krishnapathak.com', ...EMPLOYEES_DATA.map((e, i) => `${e.firstName.toLowerCase()}.${e.lastName.toLowerCase()}@wealthfino.com`)]
  const managerEmails = ['priya.verma@wealthfino.com', 'arjun.nair@wealthfino.com', 'meera.iyer@wealthfino.com', 'suresh.rao@wealthfino.com', 'amit.chopra@wealthfino.com']

  for (const email of emails) {
    await prisma.allowedEmail.upsert({ where: { email }, update: {}, create: { email } })
  }
  console.log(`✅ ${emails.length} allowed emails created`)

  // 2. Users & Employees
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'info@krishnapathak.com' },
    update: { role: Role.ADMIN, isApproved: true },
    create: { email: 'info@krishnapathak.com', passwordHash, role: Role.ADMIN, isApproved: true, employee: { create: { firstName: 'Krishna', lastName: 'Pathak', department: 'Management', designation: 'Admin' } } },
    include: { employee: true },
  })
  console.log(`  Admin: info@krishnapathak.com / ${PASSWORD}`)

  // Employees
  const createdEmployees: { id: number; email: string }[] = []
  for (const data of EMPLOYEES_DATA) {
    const email = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@wealthfino.com`
    const role = managerEmails.includes(email) ? Role.MANAGER : Role.EMPLOYEE
    const user = await prisma.user.upsert({
      where: { email },
      update: { role, isApproved: true },
      create: { email, passwordHash, role, isApproved: true, employee: { create: { ...data, salary: data.salary, phone: data.phone, joinedAt: daysAgo(randomInt(60, 365)) } } },
      include: { employee: true },
    })
    createdEmployees.push({ id: user.employee!.id, email })
  }
  console.log(`  ${EMPLOYEES_DATA.length} employees created`)

  // 3. Attendance (last 30 days for each employee, skip weekends)
  const attendanceStatuses: AttendanceStatus[] = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.HALF_DAY, AttendanceStatus.ABSENT, AttendanceStatus.ON_LEAVE]
  const attendanceData: { employeeId: number; date: Date; checkIn: Date | null; checkOut: Date | null; status: AttendanceStatus }[] = []

  for (const emp of createdEmployees) {
    for (let d = 1; d <= 30; d++) {
      const date = daysAgo(d)
      if (date.getDay() === 0 || date.getDay() === 6) continue
      if (Math.random() < 0.15) continue

      const status = pick(attendanceStatuses)
      const checkIn = status === AttendanceStatus.ABSENT ? null : new Date(date.getFullYear(), date.getMonth(), date.getDate(), randomInt(8, 10), randomInt(0, 59))
      const checkOut = checkIn ? new Date(checkIn.getTime() + randomInt(7, 10) * 3600000 + randomInt(0, 59) * 60000) : null
      attendanceData.push({ employeeId: emp.id, date, checkIn, checkOut, status })
    }
  }

  for (let i = 0; i < attendanceData.length; i += 100) {
    await prisma.attendance.createMany({ data: attendanceData.slice(i, i + 100), skipDuplicates: true })
  }
  console.log(`✅ ${attendanceData.length} attendance records created`)

  // 4. Work Logs (last 7 days for each employee)
  const workLogData: { employeeId: number; date: Date; task: string; startTime: Date; endTime: Date; hours: number; status: string }[] = []

  for (const emp of createdEmployees) {
    for (let d = 1; d <= 7; d++) {
      if (Math.random() < 0.2) continue
      const date = daysAgo(d)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      const tasksForDay = randomInt(1, 3)
      for (let t = 0; t < tasksForDay; t++) {
        const startHour = 9 + t * 3 + randomInt(0, 1)
        const endHour = startHour + randomInt(1, 3)
        workLogData.push({
          employeeId: emp.id,
          date,
          task: pick(WORK_TASKS),
          startTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, randomInt(0, 59)),
          endTime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, randomInt(0, 59)),
          hours: endHour - startHour,
          status: pick(['Completed', 'In Progress', 'Not Yet Started']),
        })
      }
    }
  }

  for (let i = 0; i < workLogData.length; i += 100) {
    await prisma.workLog.createMany({ data: workLogData.slice(i, i + 100) })
  }
  console.log(`✅ ${workLogData.length} work logs created`)

  // 5. Daily Reports (last 7 days)
  const reportData: { employeeId: number; date: Date; summary: string; hoursLogged: number }[] = []

  for (const emp of createdEmployees) {
    for (let d = 1; d <= 7; d++) {
      if (Math.random() < 0.25) continue
      const date = daysAgo(d)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      reportData.push({
        employeeId: emp.id,
        date,
        summary: `Completed ${randomInt(2, 5)} tasks including ${pick(WORK_TASKS).toLowerCase()}. Attended team standup and client meetings.`,
        hoursLogged: randomInt(6, 9),
      })
    }
  }

  for (let i = 0; i < reportData.length; i += 100) {
    await prisma.dailyReport.createMany({ data: reportData.slice(i, i + 100), skipDuplicates: true })
  }
  console.log(`✅ ${reportData.length} daily reports created`)

  // 6. Leave Requests
  const leaveTypes: LeaveType[] = [LeaveType.ANNUAL, LeaveType.SICK, LeaveType.CASUAL, LeaveType.UNPAID]
  const leaveStatuses: LeaveStatus[] = [LeaveStatus.APPROVED, LeaveStatus.APPROVED, LeaveStatus.APPROVED, LeaveStatus.PENDING, LeaveStatus.REJECTED]
  const leaveData: { employeeId: number; type: LeaveType; fromDate: Date; toDate: Date; days: number; reason: string; status: LeaveStatus; reviewedBy: number; reviewedAt: Date }[] = []

  for (const emp of createdEmployees) {
    const numLeaves = randomInt(1, 3)
    for (let l = 0; l < numLeaves; l++) {
      const fromDate = daysAgo(randomInt(10, 60))
      const days = randomInt(1, 3)
      const toDate = new Date(fromDate)
      toDate.setDate(fromDate.getDate() + days)

      leaveData.push({
        employeeId: emp.id,
        type: pick(leaveTypes),
        fromDate,
        toDate,
        days,
        reason: pick(LEAVE_REASONS),
        status: pick(leaveStatuses),
        reviewedBy: adminUser.employee!.id,
        reviewedAt: daysAgo(randomInt(5, 30)),
      })
    }
  }

  for (let i = 0; i < leaveData.length; i += 100) {
    await prisma.leaveRequest.createMany({ data: leaveData.slice(i, i + 100) })
  }
  console.log(`✅ ${leaveData.length} leave requests created`)

  // 7. Tasks
  const taskData: { employeeId: number; title: string; description: string | null; dueDate: Date | null; priority: TaskPriority; status: TaskStatus }[] = []

  for (const emp of createdEmployees) {
    const numTasks = randomInt(2, 5)
    for (let t = 0; t < numTasks; t++) {
      const template = pick(TASK_TEMPLATES)
      taskData.push({
        employeeId: emp.id,
        title: template.title,
        description: template.description,
        dueDate: daysAgo(randomInt(-5, 15)),
        priority: pick([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.MEDIUM, TaskPriority.HIGH]),
        status: pick([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.DONE, TaskStatus.CANCELLED]),
      })
    }
  }

  for (let i = 0; i < taskData.length; i += 100) {
    await prisma.task.createMany({ data: taskData.slice(i, i + 100) })
  }
  console.log(`✅ ${taskData.length} tasks created`)

  // 8. Payroll (last 3 months)
  const payrollData: { employeeId: number; month: number; year: number; basic: Prisma.Decimal; allowances: Prisma.Decimal; deductions: Prisma.Decimal; bonus: Prisma.Decimal; netPay: Prisma.Decimal; status: PayrollStatus }[] = []

  for (const emp of createdEmployees) {
    for (const pm of PAYROLL_MONTHS) {
      const basicVal = (emp.email.includes('manager') || emp.email.includes('Admin') || emp.email.includes('senior') ? randomInt(60000, 90000) : randomInt(30000, 55000))
      const basic = new Prisma.Decimal(basicVal)
      const allowances = basic.mul(0.2).toDecimalPlaces(2)
      const deductions = basic.mul(0.1).toDecimalPlaces(2)
      const bonus = basic.mul(randomInt(0, 15) / 100).toDecimalPlaces(2)
      const netPay = basic.plus(allowances).plus(bonus).minus(deductions)

      payrollData.push({
        employeeId: emp.id,
        month: pm.month,
        year: pm.year,
        basic,
        allowances,
        deductions,
        bonus,
        netPay,
        status: pick([PayrollStatus.DRAFT, PayrollStatus.PROCESSED, PayrollStatus.PAID]),
      })
    }
  }

  for (let i = 0; i < payrollData.length; i += 100) {
    await prisma.payroll.createMany({ data: payrollData.slice(i, i + 100), skipDuplicates: true })
  }
  console.log(`✅ ${payrollData.length} payroll records created`)

  // 9. Leads
  const leadStatuses = ['New', 'Contacted', 'Qualified', 'Proposal']
  const leadData: { name: string; email: string; phone: string; source: string; status: string; notes: string; assignedTo: number | null }[] = []

  for (const ld of LEAD_NAMES) {
    leadData.push({
      name: ld.name,
      email: ld.email,
      phone: ld.phone,
      source: ld.source,
      status: pick(leadStatuses),
      notes: `Lead from ${ld.source}. Follow up required.`,
      assignedTo: randomInt(0, 10) < 7 ? pick(createdEmployees).id : null,
    })
  }

  for (let i = 0; i < leadData.length; i += 100) {
    await prisma.lead.createMany({ data: leadData.slice(i, i + 100) })
  }
  console.log(`✅ ${LEAD_NAMES.length} leads created`)

  // 10. Announcements
  for (const ann of ANNOUNCEMENTS) {
    const announcement = await prisma.announcement.create({
      data: {
        title: ann.title,
        body: ann.body,
        tag: ann.tag,
        authorId: adminUser.id,
        createdAt: daysAgo(randomInt(1, 60)),
      },
    })

    // Mark some as read by some employees
    const readers = createdEmployees.filter(() => Math.random() < 0.6)
    for (const emp of readers) {
      const user = await prisma.user.findFirst({ where: { employee: { id: emp.id } } })
      if (user) {
        await prisma.announcementRead.upsert({
          where: { announcementId_userId: { announcementId: announcement.id, userId: user.id } },
          update: {},
          create: { announcementId: announcement.id, userId: user.id, readAt: daysAgo(randomInt(1, 5)) },
        })
      }
    }
  }
  console.log(`✅ ${ANNOUNCEMENTS.length} announcements created`)

  console.log('\n🎉 Database seeding complete!')
  console.log(`\nLogin credentials:`)
  console.log(`  Admin:    info@krishnapathak.com / ${PASSWORD}`)
  console.log(`  Manager:  priya.verma@wealthfino.com / ${PASSWORD}`)
  console.log(`  Employee: aarav.sharma@wealthfino.com / ${PASSWORD}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
