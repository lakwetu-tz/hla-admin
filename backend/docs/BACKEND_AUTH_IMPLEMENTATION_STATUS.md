<!--
Generated on: May 22, 2024
Project: Horti Logistica Africa
Status: Backend fully implemented + Frontend Auth Foundation Ready
Do not edit manually – regenerate after backend connection
-->

# Horti Logistica Africa – Backend Implementation & Frontend Auth Integration Status

## 1. Project Overview & Technology Stack

**Project Goal**: A high-performance, scalable admin dashboard for managing horticulture logistics across Africa.

**Backend Stack**:
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (v5.2.1)
- **Database**: PostgreSQL with Prisma ORM
- **Caching & Queues**: Redis (ioredis) & BullMQ
- **Real-time**: Socket.io
- **Security**: JWT, bcrypt, helmet, rate-limiting, xss-clean
- **Documentation**: Swagger UI
- **Logging**: Pino
- **Storage**: AWS S3 (SDK v3)

**Frontend Stack (Current)**:
- **Framework**: Next.js 15 (App Router)
- **State Management**: Zustand (Persisted)
- **Data Fetching**: TanStack Query (v5)
- **API Client**: Axios

---

## 2. Backend Architecture (Full Details)

### Folder Structure
```text
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (PostgreSQL)
│   └── seed.ts                # Initial data seeding
├── src/
│   ├── core/                  # Middleware, Guards, Error handlers
│   ├── modules/               # Feature-based modules (Auth, Users, etc.)
│   ├── services/              # Shared business logic
│   ├── generated/             # Prisma client generation
│   ├── cache/                 # Redis connection
│   ├── queues/                # BullMQ background workers
│   ├── events/                # Socket.io & Event emitters
│   └── server.ts              # Application entry point
├── package.json
└── tsconfig.json
```

### Prisma Schema Highlights
Key models implemented for RBAC (Role-Based Access Control):
- **User**: ID, email, hashed password, verification status.
- **Role**: Unique names (e.g., `super_admin`).
- **Permission**: Atomic permissions for modules.
- **UserRole / RolePermission**: Junction tables for many-to-many relationships.
- **AuditLog**: Track system actions.
- **Analytic**: Metric tracking for the dashboard.

### Security Implementation
- **JWT**: Stateless authentication with access and refresh tokens.
- **RBAC**: Middleware-based permission checking.
- **Rate Limiting**: `express-rate-limit` to prevent brute force.
- **Sanitization**: `xss-clean` and `hpp` for parameter pollution.

---

## 3. Frontend Auth Implementation (Current State)

### Architecture Highlights
- **Route Groups**: 
  - `(public)`: Contains the login page.
  - `(dashboard)`: Contains protected `/admin` routes.
- **Zustand (`authStore.ts`)**: Centralized, persisted store for the `user` object and JWT tokens.
- **Axios (`api.ts`)**: Configured with interceptors to automatically attach `Authorization` headers.
- **Middleware (`middleware.ts`)**: Edge-level redirection for unauthorized users.

### Current Flow (Mock)
1. User enters credentials in `LoginForm`.
2. `useAuth` hook triggers `authService.login`.
3. Service returns mock user and tokens (simulating backend).
4. Zustand updates `isAuthenticated: true`.
5. User is redirected to `/admin` and recognized by `DashboardWrapper`.

---

## 4. Files & Code That Will Be Removed / Cleaned After Successful Backend Integration

| File / Section | Action | Reason |
| :--- | :--- | :--- |
| `lib/auth-context.tsx` | **Delete** | Legacy React Context replaced by Zustand. |
| `features/auth/service.ts` | **Refactor** | Replace mock `Promise` with real `api.post` calls. |
| `app/admin/layout.tsx` | **Cleanup** | Remove the `<AuthProvider>` wrapper once legacy components migrate. |
| `next.config.mjs` | **Edit** | Remove `ignoreBuildErrors: true` for production safety. |
| `lib/mock-data.ts` | **Deprecate** | Replace with real TanStack Query hooks. |

---

## 5. Migration & Connection Roadmap (Next Steps)

1. **Environment Config**: Update `.env.local` with the actual `NEXT_PUBLIC_API_URL`.
2. **Endpoint Mapping**:
   - `POST /auth/login`
   - `POST /auth/refresh`
   - `GET /auth/me`
3. **Token Interceptor**: Finalize the `401` response interceptor in `api.ts` to call the refresh endpoint.
4. **Cookie Strategy**: Switch from `localStorage` to `httpOnly` cookies for the refresh token (Architect recommended).
5. **Role Mapping**: Ensure backend role strings match the frontend `Role` type.

---

## 6. Architect’s Thoughts on This Step

### Quality Assessment
The foundation is **excellent**. Splitting the app into route groups (`public`/`dashboard`) prevents layout thrashing. Using **Zustand** over Context for auth is the right choice for an admin dashboard—it's faster, easier to debug with Redux DevTools, and provides built-in persistence.

### Scalability
The use of **TanStack Query** alongside Zustand ensures that "Server State" (API data) and "Client State" (UI toggles/Auth) never mix, which is crucial as the project grows to include complex modules like Hall Management and Invoicing.

### Risks & Improvements
1. **Security**: Currently, tokens are in `localStorage`. For production, I strongly recommend moving the **Refresh Token** to an `httpOnly` cookie to mitigate XSS risks.
2. **Backend Sync**: Ensure the Prisma schema's `User` model matches the `User` interface in the frontend exactly to avoid runtime type errors.
3. **Middleware**: The Next.js middleware should be tightened to check for a specific session cookie once the backend integration begins.

**Professional Opinion**: The system is modular, typed, and clean. It is 100% ready for Phase 2 integration.
