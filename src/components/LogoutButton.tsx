import { logout } from "@/app/actions/auth";

type LogoutButtonProps = {
  variant?: "default" | "sidebar";
};

export function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const className =
    variant === "sidebar"
      ? "w-full rounded-lg border border-[var(--brand-border)] px-3 py-2 text-left text-[13px] font-medium text-[var(--brand-text-secondary)] transition hover:border-[var(--brand-border)] hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text-secondary)]"
      : "rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--brand-text-secondary)] transition hover:border-white/20 hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text-secondary)]";

  return (
    <form action={logout} className={variant === "sidebar" ? "w-full" : undefined}>
      <button type="submit" className={className}>
        Log out
      </button>
    </form>
  );
}
