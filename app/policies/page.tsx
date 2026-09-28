import { redirect } from "next/navigation";

/** Alias for `/policy-center` (sidebar Policies route). */
export default function PoliciesAliasPage() {
  redirect("/policy-center");
}
