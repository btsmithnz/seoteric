import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

const year = new Date().getFullYear();

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-white/5 border-b bg-background/30 px-6 py-3 backdrop-blur-md">
        <Link
          className="font-semibold text-xl tracking-tight transition-opacity hover:opacity-80"
          href="/"
        >
          Seoteric
        </Link>

        <nav className="flex items-center gap-1">
          <Button
            nativeButton={false}
            render={<Link href="/pricing" />}
            size="sm"
            variant="ghost"
          >
            Pricing
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            size="sm"
            variant="ghost"
          >
            Log in
          </Button>
          <Button
            className="glow-primary"
            nativeButton={false}
            render={<Link href="/onboarding" />}
            size="sm"
          >
            Get started free
          </Button>
        </nav>
      </header>

      {children}

      <footer className="border-t px-6 py-6 text-muted-foreground text-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="font-semibold text-foreground">Seoteric</span>
            <span>© {year} Seoteric. All rights reserved.</span>
          </div>
          <nav className="flex flex-wrap items-center gap-4">
            <Link
              className="transition-colors hover:text-foreground"
              href="/pricing"
            >
              Pricing
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="/privacy"
            >
              Privacy Policy
            </Link>
            <Link
              className="transition-colors hover:text-foreground"
              href="/terms"
            >
              Terms of Service
            </Link>
            <ThemeSwitcher />
          </nav>
        </div>
      </footer>
    </div>
  );
}
