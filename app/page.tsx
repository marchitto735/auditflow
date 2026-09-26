import { redirect } from "next/navigation";

/** Default landing — Audits is the primary home destination. */
export default function Home() {
  redirect("/audits");
}
