import Link from "next/link";
import { BrandLink } from "./app-shell/brand";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <BrandLink />
          <p className="max-w-xs text-sm text-muted-foreground">Invoices, clients, contracts and analytics for independent professionals.</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-2 text-sm">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground">Features</Link>
          <Link href="/#pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="/#faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
          <Link href="/sign-in" className="text-muted-foreground hover:text-foreground">Sign in</Link>
        </nav>
        <p className="text-xs leading-relaxed text-muted-foreground">
          FreelanceFlow is a software tool, not a law firm. AI-drafted contracts are starting points: they are not reviewed by us and are not legal advice.
          Have a lawyer check anything important before you send it.
        </p>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {year} FreelanceFlow</div>
    </footer>
  );
}
