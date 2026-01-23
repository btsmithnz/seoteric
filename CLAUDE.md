# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start development server (localhost:3000)
pnpm build        # Production build
pnpm lint         # Run ESLint
```

## Architecture

This is a Next.js 16 app with:

- **App Router** (`app/`) - React Server Components by default
- **Convex** - Backend/database (schema and functions in `convex/`)
- **Shadcn UI** - Component library using base-lyra style with Base UI primitives (`components/ui/`)
- **Tailwind CSS v4** - Styling with CSS variables for theming

### Key Patterns

- **UI Components**: Use `@base-ui/react` primitives with `class-variance-authority` for variants
- **Styling**: Use `cn()` from `@/lib/utils` to merge Tailwind classes
- **Icons**: Use `lucide-react`
- **Path aliases**: `@/*` maps to project root
