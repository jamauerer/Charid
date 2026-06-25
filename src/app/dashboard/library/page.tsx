import { redirect } from "next/navigation";
import { libraryPath } from "@/lib/library-routes";

export default function LibraryIndexPage() {
  redirect(libraryPath("recent"));
}
