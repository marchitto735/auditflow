import { redirect } from "next/navigation";

/** Default landing — Dashboard is the primary home destination. */
export default function Home() {
  redirect("/dashboard");
}
