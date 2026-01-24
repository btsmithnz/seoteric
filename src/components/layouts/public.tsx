import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-semibold">
          Seoteric
        </Link>
        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            render={<Link href="/pricing" />}
            nativeButton={false}
          >
            Pricing
          </Button>
          <Button
            variant="ghost"
            render={<Link href="/login" />}
            nativeButton={false}
          >
            Login
          </Button>
          <Button render={<Link href="/onboarding" />} nativeButton={false}>
            Sign up
          </Button>
        </nav>
      </header>
      {children}
      <footer className="flex items-center justify-between px-6 py-4 border-t text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-foreground">Seoteric</span>
          <span>
            © {new Date().getFullYear()} Seoteric. All rights reserved.
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <ThemeSwitcher />
        </nav>
      </footer>
    </div>
  );
}
