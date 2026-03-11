<!--
Generated on: May 22, 2024
After: Phase 1 – Authentication foundation
Do not manually edit – regenerate when structure changes
-->

# Horti Logistica Africa – Frontend Architecture (Post Phase 1)

## Project Status
- **Next.js version**: 15.0+ (App Router)
- **Authentication status**: Foundation established. Uses **Zustand** for persistent state and **Axios interceptors** for JWT handling. Current implementation uses mock services prepared for real API integration.
- **Protection mechanism**: Route-level protection implemented via `middleware.ts` and component-level protection via `(dashboard)/layout.tsx`.

## Current Directory Structure

```text
frontend/
├── app/
│   ├── (public)/              # Public route group
│   │   └── page.tsx           # Login page (moved from root)
│   ├── (dashboard)/           # Protected route group
│   │   ├── admin/             # Dashboard routes (moved from root)
│   │   └── layout.tsx         # Dashboard auth wrapper & state check
│   ├── globals.css
│   └── layout.tsx             # Root layout with global providers
├── features/
│   └── auth/                  # Auth-specific business logic
│       └── service.ts         # Mock/Real Auth API methods
├── services/
│   └── api.ts                 # Axios instance with JWT interceptors
├── store/
│   └── authStore.ts           # Zustand store (User, Token, Persist)
├── providers/
│   └── QueryProvider.tsx      # TanStack Query configuration
├── types/
│   └── auth.ts                # TypeScript interfaces for User/Auth
├── hooks/
│   └── useAuth.ts             # Auth mutations (login/logout) via React Query
├── middleware.ts              # Next.js edge-middleware for route guarding
└── (all other folders)
```

## Key Architectural Decisions

- **Route Groups**: Implementation of `(public)` and `(dashboard)` groups allows for clean separation of concerns without altering the URL structure. `/` remains the login page, and `/admin` remains the dashboard entry.
- **Auth Flow**: 
  - **Zustand**: Handles global authentication state with `persist` middleware to survive page refreshes.
  - **Axios Interceptors**: Automatically attaches the Bearer token to requests and is structured to handle future 401 token refreshes.
  - **Middleware**: Intercepts requests to `/admin/*` to ensure unauthorized users are redirected.
- **Role Support**: The system is typed and prepared to handle `super_admin`, `event_manager`, and `finance_manager` roles, with placeholder logic for role-based UI filtering.
- **Data Layer Readiness**: The logic for login and user fetching is abstracted into a service layer, making the switch from mock data to real API endpoints a single-file change.

## Important Files & Their Responsibilities

1.  **`services/api.ts`**: Centralized HTTP client using Axios. Handles base URL configuration and automatic Authorization header injection.
2.  **`store/authStore.ts`**: The "Source of Truth" for user session state. Persists user profile and tokens to `localStorage`.
3.  **`middleware.ts`**: Server-side guard that prevents unauthorized navigation to dashboard routes.
4.  **`app/(dashboard)/layout.tsx`**: Client-side guard that ensures the Zustand state is hydrated and valid before rendering dashboard content.
5.  **`hooks/useAuth.ts`**: Custom hooks leveraging TanStack Query for standardized login, logout, and loading states.
6.  **`features/auth/service.ts`**: Contains the logic for authentication API calls (currently mocked with `DEMO_USERS`).
7.  **`types/auth.ts`**: Centralized TypeScript definitions to ensure type safety across the auth lifecycle.
8.  **`providers/QueryProvider.tsx`**: Configures global settings for TanStack Query (staleTime, retries).

## Migration Status (Compared to Original Structure)

| File / Folder | Original Location | New Location | Status |
| :--- | :--- | :--- | :--- |
| **Login Page** | `app/page.tsx` | `app/(public)/page.tsx` | Moved |
| **Admin Dashboard** | `app/admin/` | `app/(dashboard)/admin/` | Moved |
| **Auth Logic** | `lib/auth-context.tsx` | `hooks/useAuth.ts` / `store/authStore.ts` | Refactored |
| **API Client** | N/A | `services/api.ts` | Created |
| **User Types** | `lib/auth-context.tsx` | `types/auth.ts` | Centralized |
| **Middleware** | N/A | `middleware.ts` | Created |

## Next Steps (Phase 2 Preview)

- **Provider Cleanup**: Removal of legacy `auth-context.tsx` once all components migrate to the new `useAuth` hook.
- **Layout Refinement**: Standardizing the Sidebar and Header as global dashboard components.
- **Feature Modules**: Beginning migration of the "Exhibitors" and "Halls" logic into the `features/` directory.

## Warnings & TODOs

> [!WARNING]
> The `middleware.ts` currently allows access to continue the demo experience. Strict token checking should be enabled once the backend is live.

- **TODO**: Replace `authService` mock functions with real Axios calls in `features/auth/service.ts`.
- **TODO**: Implement 401 interceptor logic for token refreshing in `services/api.ts`.
- **TODO**: Update `next.config.mjs` to remove `ignoreBuildErrors` once TS migration is 100% clean.
