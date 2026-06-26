# WealthFino CRM — Tech Stack & Architecture

> **⚠️ MANDATORY FOR ALL AI AGENTS:**
> Read this file in its entirety before writing a single line of code.
> This is the canonical reference for every architectural, tooling, and convention decision in this monorepo.
> Deviating from this document without explicit user approval is **not acceptable**.

---

## Table of Contents

1. [Monorepo Overview](#1-monorepo-overview)
2. [Directory Structure](#2-directory-structure)
3. [Frontend — apps/web](#3-frontend--appsweb)
4. [Backend — apps/api](#4-backend--appsapi)
5. [Shared Packages](#5-shared-packages)
6. [Database — MySQL](#6-database--mysql)
7. [Authentication](#7-authentication)
8. [Routing & Page Map](#8-routing--page-map)
9. [Testing Strategy (TDD)](#9-testing-strategy-tdd)
10. [API Design Standards](#10-api-design-standards)
11. [Environment Variables](#11-environment-variables)
12. [Tooling & Scripts](#12-tooling--scripts)
13. [Code Conventions](#13-code-conventions)
14. [Design System Reference](#14-design-system-reference)

---

## 1. Monorepo Overview

| Property | Value |
|---|---|
| **Monorepo Tool** | Turborepo v2 |
| **Package Manager** | Bun v1.3.13 |
| **Node Requirement** | ≥ 20 |
| **TypeScript** | v5 (strict mode, project-wide) |
| **Root Config** | `turbo.json`, `package.json`, `tsconfig.json` |

This is a **Turborepo monorepo** using Bun workspaces. All apps live in `apps/`, all shared internal packages in `packages/`.

### Turbo Pipeline Tasks

| Task | Behaviour |
|---|---|
| `bun run dev` | Starts all apps concurrently (persistent, no cache) |
| `bun run build` | Builds all apps in dependency order |
| `bun run lint` | Runs ESLint across the entire monorepo |
| `bun run typecheck` | Runs `tsc --noEmit` across all packages |
| `bun run format` | Prettier formats all `.ts` / `.tsx` files |

---

## 2. Directory Structure

```
wealthfino-crm/                        ← Monorepo root
├── apps/
│   ├── web/                           ← Next.js 16 frontend (port 3000)
│   │   ├── app/                       ← Next.js App Router pages
│   │   │   ├── (auth)/                ← Route group: login / signup (public)
│   │   │   │   ├── page.tsx           ← / → Login page
│   │   │   │   └── layout.tsx         ← Minimal auth layout
│   │   │   ├── (dashboard)/           ← Route group: protected dashboard
│   │   │   │   ├── layout.tsx         ← Sidebar + topbar shell
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx       ← /dashboard (main dashboard)
│   │   │   │   ├── employees/
│   │   │   │   │   └── page.tsx       ← /employees
│   │   │   │   ├── attendance/
│   │   │   │   │   └── page.tsx       ← /attendance
│   │   │   │   ├── leave-management/
│   │   │   │   │   └── page.tsx       ← /leave-management
│   │   │   │   ├── task-management/
│   │   │   │   │   └── page.tsx       ← /task-management
│   │   │   │   ├── daily-reports/
│   │   │   │   │   └── page.tsx       ← /daily-reports
│   │   │   │   ├── work-log/
│   │   │   │   │   └── page.tsx       ← /work-log (hourly)
│   │   │   │   ├── performance/
│   │   │   │   │   └── page.tsx       ← /performance
│   │   │   │   ├── announcements/
│   │   │   │   │   └── page.tsx       ← /announcements
│   │   │   │   ├── salary-payroll/
│   │   │   │   │   └── page.tsx       ← /salary-payroll
│   │   │   │   ├── calendar/
│   │   │   │   │   └── page.tsx       ← /calendar
│   │   │   │   ├── documents/
│   │   │   │   │   └── page.tsx       ← /documents
│   │   │   │   ├── reports/
│   │   │   │   │   └── page.tsx       ← /reports (Reports & Analytics)
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx       ← /settings
│   │   │   │   └── support/
│   │   │   │       └── page.tsx       ← /support (Help & Support)
│   │   │   └── layout.tsx             ← Root layout (fonts, ThemeProvider)
│   │   ├── components/                ← App-specific React components
│   │   │   ├── sidebar.tsx            ← Sidebar nav component
│   │   │   ├── topbar.tsx             ← Top navigation bar
│   │   │   ├── theme-provider.tsx     ← next-themes wrapper
│   │   │   └── ui/                    ← Local shadcn overrides (if any)
│   │   ├── hooks/                     ← Custom React hooks (app-level)
│   │   ├── lib/                       ← Client-side utils (api client, helpers)
│   │   ├── design.md                  ← 🎨 Design system (color tokens, typography)
│   │   ├── components.json            ← shadcn/ui config
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── api/                           ← Express + TypeScript backend (port 4000)
│       ├── src/
│       │   ├── index.ts               ← Entry point (bootstrap server)
│       │   ├── app.ts                 ← Express app factory (for testing)
│       │   ├── config/
│       │   │   ├── db.ts              ← Prisma client singleton
│       │   │   └── env.ts             ← Validated env config (zod)
│       │   ├── modules/               ← Feature modules (one per domain)
│       │   │   ├── auth/
│       │   │   │   ├── auth.router.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── auth.repository.ts
│       │   │   │   └── auth.test.ts
│       │   │   ├── employees/
│       │   │   │   ├── employees.router.ts
│       │   │   │   ├── employees.controller.ts
│       │   │   │   ├── employees.service.ts
│       │   │   │   ├── employees.repository.ts
│       │   │   │   └── employees.test.ts
│       │   │   ├── attendance/
│       │   │   ├── leave/
│       │   │   ├── tasks/
│       │   │   ├── reports/
│       │   │   ├── payroll/
│       │   │   └── announcements/
│       │   ├── middleware/
│       │   │   ├── auth.middleware.ts  ← JWT verification
│       │   │   ├── error.middleware.ts ← Global error handler
│       │   │   └── validate.middleware.ts ← Zod request validation
│       │   └── types/
│       │       └── index.ts           ← Shared TS types / Express augmentations
│       ├── prisma/
│       │   ├── schema.prisma          ← Prisma schema (datasource + models)
│       │   └── migrations/            ← Auto-generated migration files (prisma migrate dev)
│       ├── jest.config.ts
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── ui/                            ← Shared React component library
│   │   └── src/
│   │       ├── components/            ← shadcn-based primitives (button, input…)
│   │       ├── hooks/                 ← Shared React hooks
│   │       ├── lib/
│   │       │   └── utils.ts           ← cn() helper (clsx + tailwind-merge)
│   │       └── styles/
│   │           └── globals.css        ← Tailwind v4 base + CSS variables
│   ├── eslint-config/                 ← Shared ESLint config
│   └── typescript-config/             ← Shared tsconfig bases
│
├── TECHSTACK.md                       ← 📖 This file
├── turbo.json
├── package.json
└── bun.lock
```

---

## 3. Frontend — apps/web

### Core Stack

| Technology | Version | Role |
|---|---|---|
| **Next.js** | 16.2.6 | React framework (App Router) |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | v4 | Utility-first CSS |
| **shadcn/ui** | Latest | Component library (Radix-based) |
| **Radix UI** | 1.6.x | Headless primitives via `radix-ui` |
| **next-themes** | 0.4.x | Dark/light theme switching |
| **@tabler/icons-react** | 3.44.x | Icon system |
| **Zod** | 4.x | Form & schema validation |
| **class-variance-authority** | 0.7.x | Component variant logic |
| **tailwind-merge** | 3.x | Conflict-safe Tailwind class merging |

### Key Conventions

- **App Router only.** No Pages Router. All routes are in `apps/web/app/`.
- **Route Groups.** Use `(auth)` for public routes and `(dashboard)` for protected routes. This keeps layouts separate without affecting the URL.
- **Server Components by default.** Add `"use client"` only when necessary (event handlers, hooks, browser APIs).
- **Fonts.** `DM Sans` (body, `--font-sans`) · `Geist` (headings, `--font-heading`) · `Geist Mono` (code, `--font-mono`). Loaded via `next/font/google`.
- **Shared UI via `@workspace/ui`.** Never copy-paste components. Import from `@workspace/ui/components/<name>`.
- **Path aliases.** `@/` maps to `apps/web/` (components, hooks, lib). `@workspace/ui` maps to the shared package.
- **No inline styles.** All styles via Tailwind classes or CSS variables defined in `design.md`.

### shadcn Configuration

```json
{
  "style": "radix-luma",
  "iconLibrary": "tabler",
  "aliases": {
    "ui": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils"
  }
}
```

---

## 4. Backend — apps/api

### Core Stack

| Technology | Version | Role |
|---|---|---|
| **Node.js** | ≥ 20 | Runtime |
| **Express** | 5.x | HTTP framework |
| **TypeScript** | 5.x | Type safety |
| **Prisma** | 6.x | ORM — schema, type-safe queries, migrations |
| **Zod** | 4.x | Request validation & env parsing |
| **jsonwebtoken** | 9.x | JWT auth tokens |
| **bcryptjs** | 2.x | Password hashing |
| **helmet** | 8.x | Security headers |
| **cors** | 2.x | CORS middleware |
| **morgan** | 1.x | HTTP request logging |

### Architecture Pattern: Layered Architecture

Every feature module follows the same 4-layer pattern:

```
HTTP Request
     ↓
  Router          ← defines routes, applies middleware
     ↓
  Controller      ← parses request, calls service, sends response
     ↓
  Service         ← business logic, orchestration, throws domain errors
     ↓
  Repository      ← all Prisma client calls, returns typed domain objects
     ↓
  Prisma Client
     ↓
  MySQL Database
```

**Rules:**
- **Controllers** never contain SQL or business logic.
- **Services** never import from `req`/`res`. They are pure business logic.
- **Repositories** are the only layer that touches the database.
- **Validation** happens at the router/middleware level using Zod schemas **before** hitting the controller.

### Express App Factory Pattern

`app.ts` exports a factory function (not a running server) to allow clean test isolation:

```ts
// src/app.ts
export function createApp(): Express { ... }

// src/index.ts
const app = createApp();
app.listen(PORT);
```

### Error Handling

A single global error-handling middleware in `middleware/error.middleware.ts` catches all errors. Services throw typed `AppError` instances (with `statusCode` and `message`). Never send raw SQL errors to the client.

---

## 5. Shared Packages

### `@workspace/ui`

The **single source for all React components** shared across apps.

| Export Path | Contents |
|---|---|
| `@workspace/ui/components/<name>` | shadcn-based React components |
| `@workspace/ui/lib/utils` | `cn()` utility function |
| `@workspace/ui/hooks/<name>` | Shared React hooks |
| `@workspace/ui/globals.css` | Tailwind v4 base styles + CSS variables |

### `@workspace/eslint-config`

Shared ESLint rules. All apps and packages extend from this. Never configure ESLint independently per-app unless you have a **very** strong reason and must also update this package.

### `@workspace/typescript-config`

Shared `tsconfig` bases. Apps extend the appropriate base (e.g., `nextjs.json`, `node.json`).

---

## 6. Database — MySQL + Prisma

| Property | Value |
|---|---|
| **Database** | MySQL 8.x |
| **ORM** | Prisma 6.x |
| **Driver** | `mysql2` (used internally by Prisma) |
| **Migrations** | `prisma migrate dev` — auto-generated, tracked in `prisma/migrations/` |
| **Schema** | `apps/api/prisma/schema.prisma` |

### Why Prisma?

- **Type safety** — the Prisma client is fully typed from your schema. No manual `interface` mirroring of DB rows.
- **Auto-complete** — `prisma.employee.findMany({ where: { ... } })` is fully intellisense-aware.
- **Migration management** — `prisma migrate dev` diffs your schema and generates idempotent SQL migrations.
- **Prisma Studio** — visual DB browser at `localhost:5555` via `npx prisma studio` (great for dev UX).

### Prisma Client Singleton

Instantiate once and re-use. Never `new PrismaClient()` inside a module or request handler.

```ts
// src/config/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Schema Location & Datasource

```prisma
// apps/api/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Example model
model Employee {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  role      String   @default("employee")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Migration Workflow

```bash
# Create and apply a migration during development
bunx prisma migrate dev --name add_payroll_table

# Apply migrations in production (no schema drift, no prompts)
bunx prisma migrate deploy

# Regenerate the Prisma client after schema changes
bunx prisma generate

# Open Prisma Studio (visual DB browser)
bunx prisma studio
```

### Repository Pattern with Prisma

Repositories wrap Prisma calls and return typed domain objects. Never use the Prisma client directly in services or controllers.

```ts
// src/modules/employees/employees.repository.ts
import { prisma } from '@/config/db';
import type { Employee } from '@prisma/client';

export const employeesRepository = {
  findAll: (): Promise<Employee[]> =>
    prisma.employee.findMany({ orderBy: { createdAt: 'desc' } }),

  findById: (id: number): Promise<Employee | null> =>
    prisma.employee.findUnique({ where: { id } }),

  create: (data: { name: string; email: string }): Promise<Employee> =>
    prisma.employee.create({ data }),

  update: (id: number, data: Partial<Employee>): Promise<Employee> =>
    prisma.employee.update({ where: { id }, data }),

  delete: (id: number): Promise<Employee> =>
    prisma.employee.delete({ where: { id } }),
};
```

### Schema Conventions

- Model names: `PascalCase` singular (e.g., `Employee`, `LeaveRequest`).
- Field names: `camelCase` in schema (Prisma maps to `snake_case` in MySQL via `@map`).
- Always include `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
- Use `@unique` for email fields; `@relation` for all foreign keys.
- Use `@@map("table_name")` if you need explicit snake_case table names.

---

## 7. Authentication

| Aspect | Decision |
|---|---|
| **Strategy** | JWT (stateless) |
| **Token storage** | `httpOnly` cookie (no `localStorage`) |
| **Password hashing** | `bcryptjs`, salt rounds = 12 |
| **Token expiry** | Access: 15min · Refresh: 7 days |
| **Middleware** | `auth.middleware.ts` — verifies JWT, attaches `req.user` |

### Auth Flow

```
POST /api/auth/login
  → validate credentials
  → compare bcrypt hash
  → issue JWT (httpOnly cookie)
  → return user profile

Protected routes
  → auth.middleware reads cookie
  → verifies JWT
  → attaches req.user = { id, role, email }
  → calls next()
```

### Frontend Auth Guard

In `apps/web/app/(dashboard)/layout.tsx`, check for a valid session cookie. If not authenticated, redirect to `/`. Use Next.js `middleware.ts` at the root of `apps/web/` for server-side route protection.

---

## 8. Routing & Page Map

### Frontend Routes (`apps/web`)

| URL | File | Access | Notes |
|---|---|---|---|
| `/` | `app/(auth)/page.tsx` | Public | Login & Sign Up page |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Protected | Main dashboard (stats, quick actions) |
| `/employees` | `app/(dashboard)/employees/page.tsx` | Protected | Employee list & management |
| `/attendance` | `app/(dashboard)/attendance/page.tsx` | Protected | Daily attendance tracking |
| `/leave-management` | `app/(dashboard)/leave-management/page.tsx` | Protected | Leave requests & approvals |
| `/task-management` | `app/(dashboard)/task-management/page.tsx` | Protected | Task assignment & tracking |
| `/daily-reports` | `app/(dashboard)/daily-reports/page.tsx` | Protected | Daily report submissions |
| `/work-log` | `app/(dashboard)/work-log/page.tsx` | Protected | Hourly work log entries |
| `/performance` | `app/(dashboard)/performance/page.tsx` | Protected | Performance metrics |
| `/announcements` | `app/(dashboard)/announcements/page.tsx` | Protected | Company announcements |
| `/salary-payroll` | `app/(dashboard)/salary-payroll/page.tsx` | Protected | Salary & payroll management |
| `/calendar` | `app/(dashboard)/calendar/page.tsx` | Protected | Company calendar |
| `/documents` | `app/(dashboard)/documents/page.tsx` | Protected | Document storage |
| `/reports` | `app/(dashboard)/reports/page.tsx` | Protected | Reports & analytics |
| `/settings` | `app/(dashboard)/settings/page.tsx` | Protected | Account & app settings |
| `/support` | `app/(dashboard)/support/page.tsx` | Protected | Help & Support |

> **Sidebar → Route mapping:** Each sidebar item links directly to the route listed above. The sidebar's active state is determined by `usePathname()` from `next/navigation`.

### Backend API Routes (`apps/api`)

All routes are prefixed with `/api`.

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create new user account |
| `POST` | `/api/auth/login` | Login, receive JWT cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/employees` | List all employees |
| `POST` | `/api/employees` | Create employee |
| `GET` | `/api/employees/:id` | Get single employee |
| `PUT` | `/api/employees/:id` | Update employee |
| `DELETE` | `/api/employees/:id` | Delete employee |
| `GET` | `/api/attendance` | Get attendance records |
| `POST` | `/api/attendance/check-in` | Mark check-in |
| `POST` | `/api/attendance/check-out` | Mark check-out |
| `GET` | `/api/leave` | List leave requests |
| `POST` | `/api/leave` | Submit leave request |
| `PUT` | `/api/leave/:id/approve` | Approve leave |
| `PUT` | `/api/leave/:id/reject` | Reject leave |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Update task |
| `GET` | `/api/reports/daily` | Get daily reports |
| `POST` | `/api/reports/daily` | Submit daily report |
| `GET` | `/api/payroll` | Get payroll records |
| `GET` | `/api/announcements` | List announcements |
| `POST` | `/api/announcements` | Create announcement |

---

## 9. Testing Strategy (TDD)

> **Rule:** Write tests first, then implementation. No feature is "done" without passing tests.

### Test Framework

| Tool | Purpose |
|---|---|
| **Jest** | Test runner + assertion library |
| **Supertest** | HTTP integration testing (no real server needed) |
| **jest-mock-extended** | Mock generation for TypeScript |

### Three Layers of Tests

#### 1. Unit Tests — Services & Repositories

Test business logic in isolation. Mock the database/repository layer.

```ts
// employees.service.test.ts
describe('EmployeesService', () => {
  it('should throw NotFoundError when employee does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getEmployee(999)).rejects.toThrow(NotFoundError);
  });
});
```

#### 2. Integration Tests — API Endpoints

Test the full HTTP stack using Supertest + a real test database (separate MySQL DB named `wealthfino_test`).

```ts
// employees.test.ts
describe('GET /api/employees', () => {
  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
  });

  it('should return employee list for authenticated admin', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Cookie', [`token=${adminToken}`]);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});
```

#### 3. Schema Tests — Zod Validators

Validate that request schemas accept/reject correct inputs.

```ts
describe('CreateEmployeeSchema', () => {
  it('should reject missing email', () => {
    const result = CreateEmployeeSchema.safeParse({ name: 'John' });
    expect(result.success).toBe(false);
  });
});
```

### Test File Naming & Location

- Unit + integration tests co-located with the module: `src/modules/employees/employees.test.ts`
- Test database is seeded before each test suite and cleaned after.
- Use `beforeAll` to connect DB / seed fixtures, `afterAll` to clean up, `afterEach` to reset mutation state.

### Coverage Requirements

| Layer | Minimum Coverage |
|---|---|
| Services | 90% |
| Controllers | 80% |
| Repositories | 70% |
| Middleware | 90% |

Run coverage: `bun run test:coverage` inside `apps/api/`.

---

## 10. API Design Standards

### Response Envelope

All API responses use a consistent envelope:

```ts
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 42 }  // only on paginated responses
}

// Error
{
  "success": false,
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "No employee with ID 42 exists."
  }
}
```

### HTTP Status Code Rules

| Status | When |
|---|---|
| `200` | Successful GET / PUT |
| `201` | Successful POST (resource created) |
| `204` | Successful DELETE (no body) |
| `400` | Validation error (bad request body) |
| `401` | Not authenticated |
| `403` | Authenticated but not authorised |
| `404` | Resource not found |
| `409` | Conflict (e.g., duplicate email) |
| `500` | Internal server error |

### Validation

Every `POST` / `PUT` endpoint must have a corresponding Zod schema. Apply `validate(schema)` middleware on the router before the controller:

```ts
router.post('/', validate(CreateEmployeeSchema), employeesController.create);
```

---

## 11. Environment Variables

### `apps/api/.env`

```env
# Server
PORT=4000
NODE_ENV=development

# Database — single Prisma connection URL
DATABASE_URL="mysql://root:your_password@localhost:3306/wealthfino_crm"
DATABASE_URL_TEST="mysql://root:your_password@localhost:3306/wealthfino_test"

# Auth
JWT_SECRET=your_very_long_secret_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=another_long_secret
REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_DOMAIN=localhost
```

> **Note:** Prisma uses a single `DATABASE_URL` connection string — no separate host/user/password vars needed at runtime.

### `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> **Rule:** Never commit `.env` files. Always use `.env.example` files as templates.

---

## 12. Tooling & Scripts

### Root (run from monorepo root)

```bash
bun run dev          # Start all apps (web + api)
bun run build        # Production build
bun run lint         # Lint everything
bun run typecheck    # Type check everything
bun run format       # Format everything with Prettier
```

### apps/api specific

```bash
bun run dev              # nodemon + ts-node (watch mode)
bun run test             # jest
bun run test:watch       # jest --watch
bun run test:coverage    # jest --coverage
bun run migrate          # prisma migrate deploy (production)
bun run migrate:dev      # prisma migrate dev (development, creates migration files)
bun run db:generate      # prisma generate (regenerate client after schema change)
bun run db:studio        # prisma studio (visual database browser on :5555)
bun run db:seed          # prisma db seed (populate dev fixtures)
```

### apps/web specific

```bash
bun run dev          # next dev (port 3000)
bun run build        # next build
bun run start        # next start (production)
```

---

## 13. Code Conventions

### TypeScript

- `strict: true` everywhere.
- No `any`. Use `unknown` + type guards instead.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- All async functions must be typed with explicit return types.

### Imports

- Absolute imports using path aliases (`@/`, `@workspace/ui`).
- Group imports: external → internal → relative. Separate groups with a blank line.
- Never use default exports for utilities/services. Named exports only.

### Naming

| Entity | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `leave-management.tsx` |
| React Components | `PascalCase` | `LeaveManagementPage` |
| Functions / variables | `camelCase` | `getEmployeeById` |
| Types / Interfaces | `PascalCase` | `EmployeeRecord` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_LOGIN_ATTEMPTS` |
| DB columns | `snake_case` | `created_at`, `employee_id` |
| API routes | `kebab-case` | `/api/leave-management` |

### Git

- Branch naming: `feat/<ticket>`, `fix/<ticket>`, `chore/<ticket>`
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`

---

## 14. Design System Reference

The visual design — including all color tokens, typography, spacing, shadows, and component patterns — is documented in:

```
apps/web/design.md
```

**Every UI component must use the tokens defined there.** Key highlights:

- Sidebar: `#0D1B2A` (dark navy) with `#1A7A4A` (green) active state
- Brand green: `#22C55E`
- Page background: `#F5F7FA`
- Cards: white with `1px solid #E5E7EB` border
- Font: **Inter** (primary) with DM Sans / Geist as fallbacks
- Icons: `@tabler/icons-react` — the only icon library in this project

---

> **Final reminder for AI agents:** You now have the complete picture of this codebase.
> - Use **MySQL 8 + Prisma ORM**. Never write raw SQL. Always go through the Prisma client via the repository layer.
> - Write tests first (TDD).
> - Follow the layered architecture for the backend (Router → Controller → Service → Repository).
> - All frontend routes live under `(auth)` or `(dashboard)` route groups.
> - Sidebar items are `<Link>` components pointing to their respective routes.
> - Shared components go in `packages/ui`, app-specific ones in `apps/web/components`.
> - Design tokens are in `apps/web/design.md`. Never hardcode colors.
