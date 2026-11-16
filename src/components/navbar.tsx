import Link from "next/link";
import { createClient } from "../../supabase/server";
import { Button } from "./ui/button";
import UserProfile from "./user-profile";
import { ThemeToggle } from "./theme-toggle";
import { BrandLink } from "./app-shell/brand";
import '@/styles/components.css'

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="nav-container">
      <div className="nav-content">
        <BrandLink />
        <div className="nav-actions">
          <ThemeToggle />
          {user ? (
            <>
              <Link href="/dashboard">
                <Button className="btn btn-primary">Dashboard</Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="outline" className="btn btn-outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="btn btn-primary">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
