import Link from "next/link";
import { dsBtnGhost } from "@/lib/design-system";

type AdminBackLinkProps = {
  href?: string;
  label?: string;
};

export function AdminBackLink({
  href = "/dashboard/admin",
  label = "Admin Dashboard",
}: AdminBackLinkProps) {
  return (
    <Link href={href} className={`${dsBtnGhost} -ml-3 gap-1 px-3`}>
      ← {label}
    </Link>
  );
}
