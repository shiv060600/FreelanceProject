import { AuthPage } from "@/components/auth/auth-page";

export const metadata = { title: "Sign in · Freelance Flow" };

export default function SignInPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <AuthPage mode="sign-in" searchParams={searchParams} />;
}
