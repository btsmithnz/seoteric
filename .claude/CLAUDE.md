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

- **App Router** (`src/app/`) - React Server Components by default
- **Convex** - Backend/database (schema and functions in `convex/`)
- **Better Auth** - Authentication via `@convex-dev/better-auth` integration
- **Shadcn UI** - Component library using base-lyra style with Base UI primitives (`src/components/ui/`)
- **Tailwind CSS v4** - Styling with CSS variables for theming

### Key Patterns

- **UI Components**: Use `shadcn/ui` with `class-variance-authority` for variants
- **Styling**: Use `cn()` from `@/lib/utils` to merge Tailwind classes
- **Icons**: Use `lucide-react`
- **Path aliases**: `@/*` maps to `/src/*`
- **Button Links**: Pass Link as render prop with `nativeButton={false}`:
  ```tsx
  <Button render={<Link href="/path" />} nativeButton={false}>Text</Button>
  ```

### Route Structure (`src/app/`)

- **`(dash)/`** - Authenticated routes (post-signin/signup). Sites use `/sites/[domain]` URL structure.
- **`(public)/`** - Public/landing pages
- **`(auth)/`** - Login and onboarding pages

### Authentication

Uses Better Auth with `@convex-dev/better-auth` Convex integration.

**Key files:**
- `convex/auth.ts` - Server auth config with `createAuth` and `authComponent`
- `src/lib/auth-client.ts` - Client auth via `authClient`
- `src/lib/auth-server.ts` - Next.js server utilities

**Server Components (RSC):**

```ts
import { preloadAuthQuery } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

// Preload auth data in server components
const preloadedUser = await preloadAuthQuery(api.auth.getCurrentUser);
```

**Server Actions:**

```ts
import { fetchAuthMutation } from "@/lib/auth-server";

// Call authenticated mutations from server actions
await fetchAuthMutation(api.someModule.someMutation, { args });
```

**Client Components:**

```ts
import { authClient } from "@/lib/auth-client";

// Sign in/out, get session, etc.
authClient.signIn.email({ email, password });
authClient.signOut();
```

### AI Agents (`src/ai/`)

Uses Vercel AI SDK v6 `ToolLoopAgent` for agentic workflows:

```ts
import { ToolLoopAgent, tool } from "ai";
import { z } from "zod";

export const myAgent = new ToolLoopAgent({
  model: "anthropic/claude-haiku-4.5",
  instructions: "...",
  tools: { myTool },
  callOptionsSchema: z.object({ ... }),  // Optional typed options
  prepareCall: ({ options, ...settings }) => ({ ...settings }),  // Inject options into call
});

// Streaming response
const res = await myAgent.stream({ messages, options });
return res.toUIMessageStreamResponse();
```

**AI chat endpoints** use Convex HTTP actions (`convex/http.ts`) for streaming, not Next.js API routes. Simple non-streaming endpoints can use Next.js routes (`src/app/api/`).

**AI tools** are defined in `src/ai/tools/` using `tool()` with Zod schemas. Website inspection tools use Cheerio for HTML parsing.

Do not import provider packages (e.g., `@ai-sdk/anthropic`) - use string model identifiers like `"anthropic/claude-haiku-4.5"` or `"openai/gpt-5-mini"`.

### AI Elements (`src/components/ai-elements/`)

Pre-built chat UI components that compose Shadcn UI primitives:

- **`conversation`** - Auto-scrolling message container with `StickToBottom`
- **`message`** - Message rendering with `MessageResponse` (markdown via Streamdown)
- **`prompt-input`** - Chat input with submit button, status handling, stop functionality

Use `SeotericMessages` (`src/components/chat/seoteric-messages.tsx`) for consistent message rendering with tool call visualization.
