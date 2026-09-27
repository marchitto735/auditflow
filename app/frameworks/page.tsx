import { redirect } from "next/navigation";

/** Alias for `/regulations` (sidebar Frameworks route). */
export default function FrameworksAliasPage() {
  redirect("/regulations");
}
