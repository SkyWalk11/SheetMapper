# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start development server at http://localhost:3000
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

## Architecture

This is a Next.js 16 (App Router) project using React 19, TypeScript, and Tailwind CSS v4. The package manager is **pnpm**.

The `FOLDER_STRUCTURE.md` at the root defines the intended architecture. The project is currently a scaffold — follow the patterns described there as features are added.

### Intended structure

```
app/
├── (pages)/[feature]/
│   ├── _controllers/index.ts   # Business logic as use[Feature]Controller hook
│   ├── _context/               # Optional: wraps controller for state sharing
│   ├── _components/            # Feature-scoped components
│   └── page.tsx
├── api/[feature]/route.ts      # API routes
├── layout.tsx                  # Root layout (Geist fonts, Tailwind base)
└── page.tsx
src/
├── components/                 # Reusable UI components (buttons/, links/, forms/, layout/)
├── lib/
│   ├── configs/                # HTTP client setup
│   ├── constants/              # Routes, config, env, error codes
│   ├── services/               # API service classes (e.g. AuthService)
│   ├── types/                  # TypeScript types + Zod schemas
│   └── utils/                  # cn(), errorHandler, logger, helpers
├── hooks/                      # Global custom hooks
└── context/                    # Global React Context (AppContext, AuthContext)
```

### Key conventions

- **Controllers** (`_controllers/index.ts`) hold ALL business logic for a feature — validation, API calls, state. Named `use[Feature]Controller`.
- **Context** optionally wraps a controller to share its return value via React Context. Hook named `use[Feature]` (no "Context" suffix), provider named `[Feature]Provider`.
- **Services** (`lib/services/`) are classes that call API routes via the HTTP client.
- **Validation** uses Zod schemas in `lib/types/`.
- **`_` prefix** on feature subfolders (`_components/`, `_controllers/`, `_context/`) prevents Next.js from treating them as routes.
- **Naming**: components PascalCase, constants UPPER_SNAKE_CASE, feature folders lowercase.
