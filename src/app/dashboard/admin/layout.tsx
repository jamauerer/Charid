import { forbidden } from "next/navigation";
import { isFounderAdmin } from "@/lib/founder-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isFounderAdmin())) {
    forbidden();
  }

  return children;
}
