# Horti Logistica Africa - Frontend Documentation

## Project Overview
This is the administrative dashboard for **Horti Logistica Africa**, designed to manage exhibitors, stands, finances, and event operations for the horticulture trade fair platform.

## Technology Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/) (Icons)
- **State Management & Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Forms**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) validation
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [Sonner](https://react-sonner.com/)

## Directory Structure

```text
frontend/
├── app/                  # Next.js App Router (Pages and Layouts)
│   ├── admin/            # Admin dashboard routes (halls, users, reports, etc.)
│   ├── globals.css       # Global styles and Tailwind directives
│   ├── layout.tsx        # Root layout with providers and fonts
│   └── page.tsx          # Login / Entry page
├── components/           # Reusable UI components
│   ├── admin/            # Admin-specific layout components (Sidebar, etc.)
│   ├── ui/               # Shadcn/ui-like atomic components (Button, Input, etc.)
│   └── providers.tsx     # Global context providers (Theme, Auth, Query)
├── hooks/                # Custom React hooks (useAuth, useToast, etc.)
├── lib/                  # Shared utilities, contexts, and mock data
├── public/               # Static assets (images, icons)
├── styles/               # Additional CSS/Styling configuration
├── types/                # TypeScript interfaces and type definitions
├── features/             # (Future) Feature-based logic and components
├── services/             # (Future) API service definitions
├── next.config.mjs       # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Core Dependencies
- `@tanstack/react-query`: Efficient server-state management.
- `lucide-react`: Extensive icon library.
- `recharts`: For data visualization in the dashboard.
- `next-themes`: Light/Dark mode support.
- `@hookform/resolvers`: Integration between React Hook Form and Zod.

## Configuration Highlights

### Next.js Config (`next.config.mjs`)
Configured to ignore TypeScript build errors and use unoptimized images for flexibility.
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}
export default nextConfig
```

### Path Aliases (`tsconfig.json`)
The project uses `@/*` to map to the root directory, making imports cleaner:
```json
"paths": {
  "@/*": ["./*"]
}
```

## Key Components Example

### Dashboard Page (`app/admin/page.tsx`)
The dashboard utilizes `recharts` for visualization and `lucide-react` for iconography. It implements role-based conditional rendering for different administrative modules.

```typescript
export default function DashboardPage() {
  const { user } = useAuth();
  // ... stats and chart data fetching
  
  return (
    <div className="space-y-6">
      {/* Header with Refresh functionality */}
      {/* Dynamic Stats Cards */}
      {/* Charts: Applications by Country & Category */}
      {/* Role-specific Widgets (Recent Applications / Overdue Payments) */}
    </div>
  );
}
```

## Getting Started
1. Install dependencies: `npm install` or `pnpm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`
