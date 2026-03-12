# Horti Logistica Africa – Auth Implementation & Story

This document outlines the end-to-end authentication and authorization flow implemented for the HLA Admin Dashboard. It follows modern security standards, including **JWT Access/Refresh Tokens**, **httpOnly Cookies**, and **Token Rotation**.

---

## 🛡️ The Auth Story: From Login to Logout

### 1. The Gateway (Login)
The journey begins at the login screen. When a user submits their email and password:
- **Frontend**: `authService.login()` (in `frontend/features/auth/service.ts`) sends a POST request to `/auth/login`.
- **Backend**: The `login` controller (in `backend/src/modules/auth/controller.ts`) calls the auth service to verify the user via Prisma and `bcrypt`.
- **Token Generation**: If valid, the backend generates a short-lived **AccessToken** (15m) and a long-lived **RefreshToken** (7d).

```typescript
// backend/src/modules/auth/controller.ts
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await loginUser(email, password);
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Secure cookie for Refresh Token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ accessToken, user });
};
```

### 2. Guarding the State (Zustand)
Once the login is successful:
- **Frontend**: The `authStore.ts` (Zustand) stores the `user` object in `localStorage` (persisted), but the `accessToken` is kept **strictly in memory**.
- This hybrid approach ensures the user stays "logged in" visually across refreshes, but the sensitive token isn't easily accessible to XSS attacks via `localStorage`.

### 3. Traveling with Identity (API Interceptors)
Every time the dashboard needs data (e.g., listing users or analytics):
- **Frontend**: The Axios instance in `frontend/services/api.ts` uses a **Request Interceptor** to automatically inject the `accessToken` from the Zustand store into the `Authorization` header.
- **Backend**: The `auth.middleware.ts` intercepts the request, verifies the JWT, and attaches the user ID to the request object (`req.user`).

```typescript
// frontend/services/api.ts (Request Interceptor)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 4. The Invisible Hand (Token Refresh & Rotation)
When the 15-minute `accessToken` expires, the backend returns a `401 Unauthorized`.
- **Frontend**: The **Response Interceptor** in `api.ts` catches the 401 error.
- It automatically triggers a call to `/auth/refresh`. Since the `refreshToken` is in an `httpOnly` cookie, the browser sends it automatically.
- **Backend**: The `refresh` controller verifies the old refresh token and **rotates** it—issuing a brand new Refresh Token cookie and a new Access Token. This ensures that if a token is ever stolen, it becomes useless as soon as the legitimate user refreshes.
- **Frontend**: Retries the original failed request with the new token. The user experiences zero interruption.

### 5. Saying Goodbye (Logout)
When the user clicks logout:
- **Frontend**: `authStore.logout()` is called to clear the local state and `localStorage`.
- **Backend**: The `/auth/logout` endpoint is called.
- **Security**: The backend explicitly clears the `refreshToken` cookie by setting its expiration to the past.

```typescript
// backend/src/modules/auth/controller.ts
export const logout = (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
```

---

## 📂 Involved Files

### 🔙 Backend (Core Logic)
- `src/modules/auth/controller.ts`: Handles HTTP requests for login, logout, and refresh.
- `src/modules/auth/service.ts`: Business logic (Prisma queries, JWT signing, password hashing).
- `src/modules/auth/routes.ts`: Defines endpoint paths.
- `src/core/middleware/auth.middleware.ts`: Protects private routes by verifying AccessTokens.

### 🎨 Frontend (Client Logic)
- `store/authStore.ts`: Zustand store managing user state and memory-based tokens.
- `services/api.ts`: Axios configuration with interceptors for token injection and automatic 401 refreshing.
- `features/auth/service.ts`: Clean API wrappers for auth endpoints.
- `src/middleware.ts`: Next.js Edge middleware for initial route protection based on cookie presence.

---

## ✅ Implementation Status: PRODUCTION READY
The current implementation adheres to the **"Security-First"** architecture:
1. **XSS Protection**: AccessToken is in-memory; RefreshToken is httpOnly.
2. **CSRF Protection**: Cookies use `SameSite=Lax`.
3. **Replay Protection**: Refresh Token Rotation is active.
4. **UX**: Seamless silent refreshing.
