import { LibraryShell } from "@/components/library/LibraryShell";

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LibraryShell>{children}</LibraryShell>;
}
