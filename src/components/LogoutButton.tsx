import { logout } from "@/app/actions/auth";

type LogoutButtonProps = {
  variant?: "default" | "sidebar";
};

export function LogoutButton({ variant = "default" }: LogoutButtonProps) {
  const className =
    variant === "sidebar"
      ? "w-full rounded-lg border border-white/[0.06] px-3 py-2 text-left text-[13px] font-medium text-zinc-400 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-200"
      : "rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-zinc-200";

  return (
    <form action={logout} className={variant === "sidebar" ? "w-full" : undefined}>
      <button type="submit" className={className}>
        Log out
      </button>
    </form>
  );
}
