# Full‑Stack School Management (Multi‑Tenant Dashboard)

A production-style **school management dashboard** built with **Next.js (App Router)**, **Clerk authentication**, **Prisma**, and **PostgreSQL** — featuring **multi-tenant data modeling** and **role-based access control (RBAC)**.

> If you’re hiring a full‑stack developer: this repo demonstrates end‑to‑end ownership — database design, authentication/authorization, multi‑tenancy, UI scaffolding, and deployment-ready structure.

---

## Highlights

###  Implemented
- **Next.js 14 (App Router)** dashboard architecture
- **Authentication with Clerk**
- **RBAC** (Admin / Teacher / Student / Parent / SuperAdmin)
  - Role checks via shared utilities (`requireRole`, `requireAnyRole`)
  - Route-level access enforcement via **middleware** + `routeAccessMap`
- **Multi‑tenant foundation**
  - `School` as the tenant boundary
  - Most domain entities scoped by `schoolId`
  - **SuperAdmin** supports **multi-school access**
- **Real domain modeling (Prisma + Postgres)**
  - Students, Teachers, Parents, Grades, Classes, Subjects, Lessons
  - Attendance, Exams, Assignments, Results
  - Events & Announcements

### 🔍 Notable engineering choices
- **Type-safe auth context** and role definitions
- **School isolation by design** at the schema level (tenant scoping fields + constraints)
- Clear separation between:
  - auth context (`src/lib/auth/*`)
  - service layer (`src/lib/services/*`)
  - settings/config (`src/lib/settings.ts`)

---

## Tech Stack
- **Frontend / Full-stack:** Next.js 14.2, React 18, TypeScript
- **Auth:** Clerk (`@clerk/nextjs`)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Styling:** TailwindCSS
- **Forms & Validation:** react-hook-form, zod
- **UI/Charts:** recharts, calendars
- **Notifications:** react-toastify

---

## Roles & Access Control (RBAC)

RBAC is enforced in two places:

1. **Route access via middleware**  
   `src/middleware.ts` reads the role from Clerk session claims metadata and validates access using:

   - `src/lib/settings.ts` → `routeAccessMap` (route pattern → allowed roles)

2. **Server-side role checks via utilities**  
   `src/lib/auth/user-context.ts` provides:
   - `requireRole(role)`
   - `requireAnyRole([roles])`

> Note: ensure role strings used in Clerk metadata match the role strings expected by the app.

---

## Multi‑Tenancy (School Context)

The app treats **School** as the tenant boundary.

- Users (Admin/Teacher/Student/Parent) are associated with **one school**
- **SuperAdmin** can access **multiple schools**
- `SchoolService.getContextualSchoolId()` supports both:
  - normal user school resolution
  - SuperAdmin “selected school” workflows

See:
- `src/lib/auth/school-context.ts`
- `src/lib/services/school-service.ts`

---

## Database Schema (Prisma)

Core models include:
- Tenant: `School`
- Users: `Admin`, `Teacher`, `Student`, `Parent`, `SuperAdmin`
- Academics: `Grade`, `Class`, `Subject`, `Lesson`
- Operations: `Attendance`, `Exam`, `Assignment`, `Result`
- Comms: `Event`, `Announcement`

Schema: `prisma/schema.prisma`

---

## Getting Started (Local)

### 1) Install dependencies
```bash
npm install
```

### 2) Configure environment variables
Create `.env`:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DBNAME"
```

Also configure Clerk keys (per Clerk docs):
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### 3) Prisma setup
```bash
npx prisma generate
npx prisma migrate dev
# optionally seed
npx prisma db seed
```

### 4) Run the app
```bash
npm run dev
```

Open http://localhost:3000

---

## Project Structure (high-level)

- `src/app/` — Next.js App Router pages/layout
- `src/middleware.ts` — role-based route protection
- `src/lib/auth/` — Clerk auth + role checks + school context
- `src/lib/services/` — business logic services (e.g., SchoolService)
- `prisma/` — schema, migrations, seed

---

## Why this project matters 

This repo demonstrates the ability to:
- design a relational domain model with tenant scoping
- integrate managed auth (Clerk) safely
- implement RBAC both at routing and server action layers
- structure a Next.js full-stack codebase for maintainability

---

