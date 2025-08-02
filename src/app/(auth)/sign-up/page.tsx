import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { signUpAction } from "@/app/actions";
import Navbar from "@/components/navbar";


export default async function Signup(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;

  const errorMessage = searchParams.error as string;
  const generalMessage = searchParams.message as string;
  
  const hasError = errorMessage || generalMessage?.includes('error');

  const message = errorMessage 
    ? { error: errorMessage }
    : generalMessage
    ? { message: generalMessage }
    : undefined;

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
          <form action={signUpAction} className="flex flex-col space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  className="text-primary font-medium hover:underline transition-all"
                  href="/sign-in"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Your password"
                  minLength={6}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="verify-password" className="text-sm font-medium">
                  Verify Password
                </Label>
                <Input
                  id="verify-password"
                  type="password"
                  name="verify-password"
                  placeholder="Your password"
                  minLength={6}
                  required
                  className="w-full"
                />
              </div>
            </div>
            <SubmitButton
              formAction={signUpAction}
              pendingText="Signing up..."
              className="w-full"
            >
              Sign up
            </SubmitButton>

            {message && <FormMessage message={message} />}
          </form>
        </div>
      </div>
    </>
  );
}