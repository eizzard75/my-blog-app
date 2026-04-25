import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/">
            <h1 className="text-2xl font-bold">SaaS App</h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to get started.
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
