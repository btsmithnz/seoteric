import { Chat } from "@/src/components/chat";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-medium tracking-tight">Seoteric</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          AI-powered SEO insights
        </p>
      </header>
      <Chat />
      <footer className="mt-8 text-xs text-muted-foreground">
        No sign-in required to start
      </footer>
    </main>
  );
}