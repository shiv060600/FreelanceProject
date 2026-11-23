import { AuthPage } from "@/components/auth/auth-page";

export const metadata = { title: "Create your account · Freelance Flow" };

export default function SignUpPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  return <AuthPage mode="sign-up" searchParams={searchParams} />;
}
