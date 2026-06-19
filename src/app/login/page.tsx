import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { BrandLogoSlot } from "@/components/brand/BrandLogoSlot";
import { login } from "@/app/actions/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-8">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <BrandLogoSlot variant="full" />
          </Link>
          <p className="mt-4 text-sm text-neutral-600">Sign in to your account</p>
        </div>
        <AuthForm
          action={login}
          submitLabel="Sign in"
          alternateHref="/signup"
          alternateLabel="Create an account"
        />
      </div>
    </div>
  );
}
