import { redirect } from "next/navigation";
import { getEditorEntryHref } from "@/app/actions/production/editor-entry";

export default async function EditorEntryPage() {
  const { href } = await getEditorEntryHref();
  redirect(href);
}
