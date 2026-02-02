# Seoteric

AI-powered SEO insights for your website. Get actionable advice on keyword research, on-page optimization, technical SEO, content strategy, and link building through a conversational interface.

## Try It

**Hosted version:** [seoteric.com](https://seoteric.com) — no setup required.

**Self-host:** Follow the instructions below to run your own instance.

## Features

- **AI Chat Interface** — Ask questions about your site's SEO and get instant, contextual advice
- **Website Analysis Tools** — Inspect page titles, meta descriptions, headings, and DOM structure
- **Multi-site Support** — Manage SEO insights for multiple websites from one dashboard

## Tech Stack

- [Next.js 16](https://nextjs.org) — React framework with App Router
- [Convex](https://convex.dev) — Backend and real-time database
- [Vercel AI SDK](https://sdk.vercel.ai) — Agentic AI workflows with tool calling
- [Better Auth](https://better-auth.com) — Authentication
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [Shadcn UI](https://ui.shadcn.com) — Component library

## Self-Hosting

### Prerequisites

- Node.js 20+
- pnpm
- A [Convex](https://convex.dev) account
- A [Vercel AI Gateway](https://vercel.com/ai-gateway) API key

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/btsmithnz/seoteric.git
   cd seoteric
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up Convex:
   ```bash
   pnpm dlx convex dev
   ```
   Follow the prompts to create a new Convex project.

4. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys and configuration.

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm dlx ultracite check  # Check for linting/formatting issues
pnpm dlx ultracite fix    # Auto-fix issues
```

## License

Open source under the [MIT License](LICENSE).
