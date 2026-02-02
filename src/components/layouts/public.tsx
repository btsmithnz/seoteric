import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4">
        <Link className="font-semibold text-xl" href="/">
          Seoteric
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            nativeButton={false}
            render={<Link href="/pricing" />}
            variant="ghost"
          >
            Pricing
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            variant="ghost"
          >
            Login
          </Button>
          <Button nativeButton={false} render={<Link href="/onboarding" />}>
            Sign up
          </Button>
        </nav>
      </header>
      {children}
      <footer className="flex flex-col gap-4 border-t px-6 py-4 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
          <span className="font-semibold text-foreground">Seoteric</span>
          <span>
            © {new Date().getFullYear()} Seoteric. All rights reserved.
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-4">
          <Link className="hover:text-foreground" href="/pricing">
            Pricing
          </Link>
          <Link className="hover:text-foreground" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-foreground" href="/terms">
            Terms of Service
          </Link>
          <ThemeSwitcher />
        </nav>
      </footer>
    </div>
  );
}
