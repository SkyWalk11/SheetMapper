# Next.js TypeScript Folder Structure - Best Practices

## 📁 Project Structure

```
src/
├── app/                         # Next.js 13+ App Router
│   ├── (pages)/                 # Page routes
│   │   ├── login/               # Login feature
│   │   │   ├── _controllers/    # Business logic
│   │   │   │   └── index.ts     # useLoginController
│   │   │   └── page.tsx
│   │   ├── dashboard/           # Dashboard feature
│   │   │   ├── _components/     # Feature components
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   └── StatsCard.tsx
│   │   │   ├── _controllers/    # Business logic
│   │   │   │   └── index.ts     # useDashboardController
│   │   │   ├── _context/        # State management
│   │   │   │   └── DashboardContext.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx             # Home page
│   ├── api/                     # API routes
│   │   ├── auth/login/route.ts
│   │   ├── dashboard/
│   │   └── hello/route.ts
│   ├── components/              # Demo components page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx               # Root layout
│   ├── error.tsx                # Error page
│   ├── not-found.tsx            # 404 page
│   └── page.tsx                 # Root page
├── components/                  # Reusable UI components
│   ├── buttons/                 # Button components
│   │   ├── Button.tsx
│   │   ├── IconButton.tsx
│   │   └── TextButton.tsx
│   ├── links/                   # Link components
│   │   ├── ArrowLink.tsx
│   │   ├── ButtonLink.tsx
│   │   ├── IconLink.tsx
│   │   ├── PrimaryLink.tsx
│   │   ├── UnderlineLink.tsx
│   │   └── UnstyledLink.tsx
│   ├── forms/                   # Form components
│   │   └── LoginForm.tsx
│   ├── layout/                  # Layout components
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── NextImage.tsx            # Image component
│   └── Skeleton.tsx             # Loading skeleton
├── lib/                         # Core utilities
│   ├── configs/                 # HTTP client configurations
│   │   ├── httpClient.ts        # HTTP client implementation
│   │   └── httpClient.interface.ts # HTTP client interfaces
│   ├── constants/               # Constants
│   │   ├── routes.ts            # Route constants
│   │   ├── config.ts            # App configuration
│   │   ├── env.ts               # Environment variables
│   │   └── errorCodes.ts        # Error code definitions
│   ├── middlewares/             # Middleware functions
│   │   ├── authMiddleware.ts    # Authentication middleware
│   │   └── index.ts             # Middleware utilities
│   ├── services/                # API service functions
│   │   ├── authService.ts       # Authentication services
│   │   └── dashboardService.ts  # Dashboard services
│   ├── styles/                  # Styles
│   │   ├── globals.css
│   │   └── colors.css
│   ├── types/                   # TypeScript types
│   │   ├── user.ts              # User type definitions
│   │   └── auth.schema.ts       # Zod validation schemas
│   └── utils/                   # Utility functions
│       ├── index.ts             # Main utilities (cn function)
│       ├── errorHandler.ts      # Error handling (API & Business)
│       ├── helper.ts            # Helper functions
│       ├── logger.ts            # Logging utilities
│       └── og.ts                # Open Graph utilities
├── hooks/                       # Global React hooks
│   └── useLocalStorage.ts       # localStorage hook
├── context/                     # Global React Context
│   ├── AppContext.tsx           # Global app state
│   └── AuthContext.tsx          # Global auth state (user, token)
├── __mocks__/                   # Test mocks
│   └── svg.tsx
├── __tests__/                   # Tests
│   └── pages/
│       └── HomePage.test.tsx
└── middleware.ts                # Next.js middleware (root level)
```

## 🎯 Key Principles

### Feature-Based Organization
- Each feature has its own folder with `_controllers/`, `_context/`, `_components/`
- Use `_` prefix for feature folders to avoid Next.js routing conflicts
- Controllers contain ALL business logic
- Context wraps controllers for state sharing

### State Management Architecture
- **Global Context** (`src/context/`) - Auth state, app-wide state
- **Feature Context** (`app/(pages)/[feature]/_context/`) - Feature-specific state
- **Controllers** (`_controllers/index.ts`) - Business logic, validation, API calls
- No external state management libraries needed

### Clear Separation
- **Pages**: UI and routing in `/app/(pages)/`
- **API**: Backend logic in `/app/api/`
- **Components**: Reusable UI in `/components/`
- **Controllers**: Business logic in `_controllers/index.ts`
- **Services**: API calls in `/lib/services/`
- **Utilities**: Core logic in `/lib/`

## 📋 Folder Guide

| Folder | Purpose |
|--------|---------|
| `app/(pages)/` | Feature-based page routes |
| `app/(pages)/[feature]/_controllers/` | Business logic (use[Feature]Controller) |
| `app/(pages)/[feature]/_context/` | State management (optional) |
| `app/(pages)/[feature]/_components/` | Feature-specific components |
| `app/api/` | API endpoints |
| `components/` | Reusable UI components organized by type |
| `lib/services/` | API service classes |
| `lib/types/` | TypeScript types and Zod schemas |
| `lib/utils/` | Utility functions |
| `hooks/` | Global custom hooks |
| `context/` | Global React Context |

## 🚀 Implementation Examples

### Feature Structure
```typescript
// app/(pages)/login/_controllers/index.ts
import { useState } from 'react';
import { AuthService } from '@/lib/services/authService';
import { loginSchema } from '@/lib/types/auth.schema';
import { useAuth } from '@/context/AuthContext';

const authService = new AuthService();
const errorHandler = createErrorHandler();

export const useLoginController = () => {
  const { setUser, setToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    const validation = loginSchema.safeParse(credentials);
    if (!validation.success) {
      setError(validation.error.errors.map(e => e.message).join(', '));
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(validation.data);
      setUser(result.user);
      setToken(result.token);
    } catch (err: unknown) {
      setError(errorHandler.handle(err));
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, login };
};
```

### Context Wrapping Controller
```typescript
// app/(pages)/dashboard/_context/DashboardContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useDashboardController } from '../_controllers';

type DashboardContextType = ReturnType<typeof useDashboardController>;

const DashboardContext = createContext<DashboardContextType | null>(null);

export const DashboardProvider = ({ children }) => {
  const controller = useDashboardController();
  return <DashboardContext.Provider value={controller}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};
```

### Component Using Context
```typescript
// app/(pages)/dashboard/_components/DashboardHeader.tsx
'use client';

import { useDashboard } from '../_context/DashboardContext';

export const DashboardHeader = () => {
  const { user, logout } = useDashboard(); // From context, not controller
  
  return (
    <header>
      <h1>Welcome, {user?.name}</h1>
      <button onClick={logout}>Logout</button>
    </header>
  );
};
```

### Validation with Zod
```typescript
// lib/types/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
```

### Error Handling
```typescript
// lib/utils/errorHandler.ts
export class BusinessErrorHandler {
  static handle(error: unknown): string {
    if (this.isApiError(error)) {
      return ApiErrorHandler.getErrorMessage(error);
    }
    return this.getErrorMessage(error);
  }
}

export const createErrorHandler = () => new BusinessErrorHandler();
```

### Service Pattern
```typescript
// lib/services/authService.ts
export class AuthService {
  async login(credentials: LoginCredentials) {
    const response = await httpClient.post('/api/auth/login', credentials);
    return response.data;
  }
}
```

## 📝 Naming Conventions

- **Controllers**: `use[Feature]Controller` in `_controllers/index.ts`
- **Context Hooks**: `use[Feature]` (no "Context" suffix)
- **Context Providers**: `[Feature]Provider`
- **Components**: PascalCase (`DashboardHeader.tsx`)
- **Services**: PascalCase + Service (`AuthService.ts`)
- **Component folders**: lowercase (`buttons/`, `links/`, `forms/`)
- **Feature folders**: lowercase with `_` prefix (`_components/`, `_controllers/`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## ✅ Benefits

- **Scalable**: Easy to add new features following the same pattern
- **Maintainable**: Business logic separated from UI
- **Type-safe**: Full TypeScript with Zod validation
- **Clean**: Controllers handle logic, context shares state, components render UI
- **Testable**: Controllers can be tested independently
- **Organized**: Clear separation of concerns
- **Reusable**: Shared utilities in `/lib/`

## 📚 Related Documentation

See [DEVELOPMENT_PATTERNS.md](./DEVELOPMENT_PATTERNS.md) for detailed implementation patterns and guidelines.
