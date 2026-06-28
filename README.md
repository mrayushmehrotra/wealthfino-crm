# WealthFino CRM

A full-featured internal CRM and HR management platform for WealthFino. Built on Next.js 16 with a MySQL/Prisma backend, it gives admins and employees a unified dashboard to manage attendance, leaves, tasks, payroll, and more.

---

## ✨ Features

| Module | Description |
|---|---|
| **Authentication** | JWT-based login/signup with admin approval flow and role-based access (Admin / Manager / Employee) |
| **Dashboard** | Role-aware stats — active employees, productivity score, task completion, and working hours |
| **Attendance** | Auto check-in on login, manual check-out, real-time Online/Offline toggle in the topbar |
| **Leave Management** | Employees submit leave requests; admins approve or reject with full history |
| **Task Management** | Admins assign tasks with priority and due dates; employees update status (TODO → In Progress → Done) |
| **Work Log** | Hourly work-log entries per employee per day |
| **Daily Reports** | Employees submit daily summaries with hours logged |
| **Performance** | Per-employee task completion and attendance rates with 7-day chart |
| **Salary & Payroll** | Payroll records with basic, allowances, deductions, and net pay |
| **Employees** | Full employee directory with department, designation, IP address, and location |
| **Announcements** | Company-wide notice board |
| **Calendar** | Company events viewer |
| **Documents** | Company file storage |
| **Settings / Access Requests** | Admin-only: manage allowed email list and pending signup requests |

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: MySQL 8.4 via [Prisma ORM](https://www.prisma.io/)
- **Auth**: JWT (`jose` + `jsonwebtoken`) with HTTP-only cookies
- **Styling**: Tailwind CSS v4
- **UI**: Framer Motion, Tabler Icons, Recharts
- **State**: TanStack React Query
- **Monorepo**: Turborepo + Bun workspaces
- **Package Manager**: Bun

---

## 📁 Project Structure

```
wealthfino-crm/
├── apps/
│   └── web/                  # Next.js application
│       ├── app/
│       │   ├── (auth)/       # Login & signup pages
│       │   ├── (dashboard)/  # All dashboard pages
│       │   └── api/          # API route handlers
│       ├── components/       # Shared UI components (sidebar, topbar)
│       ├── hooks/            # Custom React hooks
│       ├── lib/              # Auth, DB client, utilities
│       ├── prisma/           # Prisma schema & migrations
│       └── proxy.ts          # Next.js proxy (middleware) for auth guards
├── packages/
│   ├── ui/                   # Shared component library
│   ├── eslint-config/        # Shared ESLint config
│   └── typescript-config/    # Shared tsconfig bases
├── docker-compose.yml        # MySQL dev database
└── turbo.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) ≥ 1.3
- [Docker](https://www.docker.com/) (for local MySQL)
- Node.js ≥ 20

### 1. Clone & install dependencies

```bash
git clone https://github.com/mrayushmehrotra/wealthfino-crm.git
cd wealthfino-crm
bun install
```

### 2. Start the database

```bash
docker compose up -d
```

This spins up MySQL 8.4 on port `3306` with:
- Database: `wealthfino_crm`
- Root password: `wealthfino_root`

### 3. Configure environment variables

```bash
cp apps/web/.env.example apps/web/.env
```

Edit `apps/web/.env`:

```env
# MySQL connection
DATABASE_URL="mysql://root:wealthfino_root@localhost:3306/wealthfino_crm"

# JWT secret — change this in production!
JWT_SECRET="change_this_to_a_long_random_secret_in_production"
```

### 4. Run database migrations

```bash
cd apps/web
bunx prisma migrate dev
```

### 5. Start the dev server

```bash
# From the repo root
bun dev
```

The app runs at **http://localhost:3000**.

---

## 🗄 Database Schema

Key models and their relationships:

```
User ─── Employee ─┬── Attendance
                   ├── LeaveRequest
                   ├── Task
                   ├── DailyReport
                   ├── WorkLog
                   └── Payroll

AllowedEmail   (admin-controlled signup whitelist)
Announcement
```

**Roles**: `ADMIN` | `MANAGER` | `EMPLOYEE`

---

## 🔐 Authentication Flow

1. Admin adds an email to the **AllowedEmail** whitelist via Settings
2. User signs up — account starts as `isApproved: false`
3. Admin approves from the **Access Requests** page
4. On login, a signed JWT is stored as an HTTP-only cookie
5. Attendance is automatically recorded on login/logout
6. The `proxy.ts` (Next.js middleware) guards admin-only routes at the edge

---

## 📜 Available Scripts

From the repo root:

```bash
bun dev          # Start all apps in development
bun build        # Production build (via Turborepo)
bun lint         # Run ESLint across all packages
bun typecheck    # Run tsc --noEmit across all packages
bun format       # Run Prettier
```

From `apps/web`:

```bash
bunx prisma studio          # Open Prisma Studio GUI
bunx prisma migrate dev     # Create & apply a migration
bunx prisma migrate reset   # Reset the database
bunx prisma generate        # Regenerate Prisma client
```

---

## 🌐 Deployment

The app is deployed on **Vercel**. The Vercel project should be configured with:

| Setting | Value |
|---|---|
| Root Directory | `apps/web` |
| Build Command | `cd ../.. && bun run build` |
| Install Command | `bun install` |

### Required Environment Variables on Vercel

```
DATABASE_URL      # Production MySQL connection string
JWT_SECRET        # Strong random secret (min 32 chars)
```

> **Note**: You will need a cloud MySQL provider (e.g. PlanetScale, Aiven, Railway) for production since Vercel is serverless and cannot connect to a local Docker container.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT © [WealthFino](https://github.com/mrayushmehrotra)
