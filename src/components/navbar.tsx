import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import UserProfile from "./user-profile";
import { ThemeToggle } from "./theme-toggle";
import { BrandLink } from "./app-shell/brand";

const LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

/** Site header for public pages (landing, pricing, success). */
export default async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <BrandLink />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserProfile />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden sm:inline-flex">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="whitespace-nowrap">
                <Link href="/sign-up">
                  Get started<span className="hidden sm:inline">&nbsp;free</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
