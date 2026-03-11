# Horti Logistica Africa – Detailed Logout Flow & State Management

This document provides a technical deep-dive into the logout mechanism, explaining how we transitioned from a bug-prone "soft" logout to a secure, stable "hard" logout that clears both server-side cookies and client-side memory.

## 1. Overview
The logout process is a synchronized operation between the Frontend (React/Zustand) and the Backend (Express/Cookies). Its primary goal is to reach a "Clean Slate" where no sensitive data remains in the browser.

---

## 2. Step-by-Step Flow

### Step A: User Interaction
The user clicks the "Log out" button in the `AdminHeader` component.

### Step B: The Frontend Mutation (`useAuth.ts`)
The `logout` function from our custom hook is called. It uses TanStack Query to manage the asynchronous lifecycle.

**Previous State (Logged In):**
- `user`: `{ id: "...", name: "Enock Okonkwo", roles: ["super_admin"] }`
- `accessToken`: `"eyJhbG..."` (In memory)
- `isAuthenticated`: `true`

**The Code:**
```typescript
// frontend/hooks/useAuth.ts
const logoutMutation = useMutation({
  mutationFn: authService.logout,
  onSuccess: () => {
    clearAuth(); // Wipes Zustand Store
    queryClient.clear(); // Wipes React Query Cache
    toast.success('Logged out successfully');
    
    // THE FIX: Hard redirect to clear all stale memory/state
    window.location.href = '/'; 
  },
});
```

### Step C: The API Call (`authService.ts`)
The service sends a request to the backend. It must include `withCredentials: true` to allow the browser to send the `refreshToken` cookie for identification.

```typescript
// frontend/features/auth/service.ts
async logout(): Promise<void> {
  await api.post('/auth/logout'); // withCredentials is set globally in api.ts
}
```

### Step D: Backend Execution (`controller.ts`)
The backend receives the request and must clear the `httpOnly` cookie.

**CRITICAL DETAIL**: To clear a cookie, the server must send the **exact same options** (domain, path, security) used when it was created.

```typescript
// backend/src/modules/auth/controller.ts
export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
```

### Step E: Final State Transition (Frontend)
Once the backend responds with 200 OK, the `onSuccess` callback executes.

**New State (Logged Out):**
- `user`: `null`
- `accessToken`: `null`
- `isAuthenticated`: `false`
- **Cookies**: `refreshToken` is deleted/expired.

---

## 3. Why the "Spinner Bug" Happened
Before this fix, the logout was failing for two reasons:
1. **Cookie Mismatch**: The backend tried to clear the cookie without specifying `path: '/'`. The browser ignored the request, and the cookie stayed alive.
2. **Middleware Loop**: Since the cookie was still present, the Next.js `middleware.ts` saw a "valid" session and redirected the user back to `/admin`. However, the UI (Zustand) was empty, so the Dashboard layout showed a spinner while waiting for a user that didn't exist.

---

## 4. Recommendations for Future Development

1. **Prefer `window.location.href` for Auth**: Unlike `router.push`, a hard reload ensures that global variables, singleton services, and legacy providers are completely re-initialized.
2. **Centralized Cookie Options**: Store your `COOKIE_OPTIONS` in a constant file shared between `login` and `logout` to prevent mismatch errors.
3. **Traceability**: Always check the "Network" tab in DevTools. A successful logout should show a `Set-Cookie` header in the response with an expiration date in the past (e.g., `1970-01-01`).

✅ **Status**: The logout flow is now production-grade and protected against stale state loops.
