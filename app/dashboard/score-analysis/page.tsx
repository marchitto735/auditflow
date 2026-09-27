import { redirect } from "next/navigation";

/** Legacy path — Compliance Analytics moved to /analytics. */
export default function ScoreAnalysisRedirectPage() {
  redirect("/analytics");
}
