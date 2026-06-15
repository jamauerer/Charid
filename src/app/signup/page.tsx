import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { CharIDLogo } from "@/components/brand/CharIDLogo";
import { signup } from "@/app/actions/auth";

export default function SignupPage() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <CharIDLogo variant="full" />
          </Link>
          <p className="mt-4 text-sm text-zinc-500">Create your account</p>
        </div>
        <AuthForm
          action={signup}
          submitLabel="Sign up"
          showConfirmPassword
          alternateHref="/login"
          alternateLabel="Already have an account? Sign in"
        />
      </div>
    </div>
  );
}
