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


# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `pnpm dlx ultracite fix`
- **Check for issues**: `pnpm dlx ultracite check`
- **Diagnose setup**: `pnpm dlx ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**
- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**
- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**
- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `pnpm dlx ultracite fix` before committing to ensure compliance.
