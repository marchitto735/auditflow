import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import { Card, CardContent } from "@/components/ui/card";
import { DASHBOARD_CARD_CLASS, PAGE_CANVAS_CLASS } from "@/lib/page-layout";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Forgot password · AuditFlow",
  description: "Reset your AuditFlow password.",
};

export default function ForgotPasswordPage() {
  return (
    <div
      className={cn(
        "flex min-h-[100dvh] w-full items-center justify-center overflow-y-auto px-6 py-12",
        PAGE_CANVAS_CLASS,
      )}
    >
      <Card
        className={cn(
          "w-full max-w-[26rem] overflow-hidden shadow-none",
          DASHBOARD_CARD_CLASS,
        )}
      >
        <CardContent className="flex flex-col gap-8 p-8">
          <div className="flex flex-col gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- local SVG wordmark */}
            <img
              src="/images/auditflow-logo.svg"
              alt="AuditFlow"
              width={140}
              height={25}
              className="h-6 w-auto"
            />
            <div className="min-w-0">
              <h1 className="m-0 text-xl font-semibold tracking-tight text-neutral-950">
                Forgot password
              </h1>
              <p className="m-0 mt-1 text-sm text-neutral-500">
                We will email you a link to reset your password.
              </p>
            </div>
          </div>

          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
