import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-zinc-200"
      >
        Log out
      </button>
    </form>
  );
}
