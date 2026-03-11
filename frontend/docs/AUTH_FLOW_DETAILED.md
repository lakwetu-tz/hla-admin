# Horti Logistica Africa – Detailed Auth Flow Documentation

This document describes the production-grade authentication flow implemented in Phase 1 and 2, including the fix for stale state and navigation loops.

## 1. The Architecture
The system uses a **Hybrid State Management** approach:
- **Zustand**: Handles global UI state and in-memory Access Tokens.
- **httpOnly Cookies**: Handles the session persistence (Refresh Token) on the server-side/edge.
- **TanStack Query**: Handles the asynchronous lifecycle of authentication requests.

---

## 2. Login Flow (Step-by-Step)

### A. UI Interaction (`LoginForm.tsx`)
1. User enters `email` and `password`.
2. `handleSubmit` calls `login({ email, password })` from the `useAuth` hook.

### B. Request Execution (`useAuth.ts` & `service.ts`)
1. The `loginMutation` is triggered.
2. `authService.login` makes a `POST /api/auth/login` request.
3. **Backend Response**:
   - `Set-Cookie`: `refreshToken` (httpOnly, Secure, SameSite=Lax).
   - `Body`: `{ accessToken, user: { id, email, name, roles: [...] } }`.

### C. State Update & Navigation
1. `onSuccess` in `useAuth.ts` calls `setAuth(user, accessToken)`.
2. **Zustand** stores the `user` in `localStorage` (persisted) and `accessToken` in memory (volatile).
3. **CRITICAL FIX**: Instead of `router.push`, we use `window.location.href = '/admin'`.
   - **Reason**: This forces a full browser reload, ensuring all legacy providers and middleware receive the new cookies and state immediately, preventing an empty sidebar.

---

## 3. Sidebar & Header Synchronization
The sidebar and header are legacy components using `useAuth` from `lib/auth-context.tsx`.

1. **The Bridge**: `lib/auth-context.tsx` contains an `useEffect` that listens to the Zustand store.
2. **The Sync**: When Zustand's `user` changes, the context's local state is updated.
3. **Role Mapping**: The backend returns `roles[]`. The bridge maps the first role (`user.roles[0]`) to the legacy `role` property.
   - This ensures the `canAccessModule(user.role, module)` helper correctly filters sidebar items.

---

## 4. Logout Flow (The "Clean Slate" Strategy)

To prevent the "Long Spinning Page" or "Redirect Loops":

1. **Mutation**: `useAuth.ts` calls `authService.logout()`.
2. **Backend**: `POST /api/auth/logout` clears the `refreshToken` cookie.
3. **Frontend Cleanup**:
   - `clearAuth()`: Resets Zustand store.
   - `queryClient.clear()`: Wipes all cached API data.
4. **Hard Reset**: `window.location.href = '/'`.
   - **Reason**: A hard redirect clears any remaining in-memory state and forces the `middleware.ts` to re-evaluate the session (which is now empty).

---

## 5. Security & Performance (Real-time Logging)

### Backend Logging (`morgan`)
The backend now uses `morgan('dev')`. Every request is logged in the console:
`POST /api/auth/login 200 15.432 ms - 248`

### Interceptors (`api.ts`)
- **Request**: Automatically attaches the `Authorization: Bearer <token>` header.
- **Response (401)**: If a token expires, the interceptor calls `/auth/refresh` silently to get a new one without interrupting the user.

---

## 6. Code Snippet: The Bridge (`lib/auth-context.tsx`)
```typescript
useEffect(() => {
  if (storeUser) {
    setUser({
      ...storeUser,
      role: storeUser.roles[0] as UserRole, // Map array to single role
      lastLogin: new Date().toISOString()
    });
  } else {
    setUser(null);
  }
}, [storeUser]);
```

---

## 7. How to Verify
1. Open Browser Console.
2. Observe backend logs for `POST /api/auth/login`.
3. Verify `refreshToken` is present in Cookies but NOT `accessToken`.
4. Verify Sidebar items appear immediately after login.
5. Verify Logout redirects instantly to the login screen.
