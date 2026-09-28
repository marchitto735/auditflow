"use client";

import { useState, useTransition, type FormEvent } from "react";
import { inviteDirectoryUser } from "@/app/actions/user-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AUDITFLOW_ROLES, type AuditFlowRole } from "@/lib/users";

type InviteUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited?: (message: string) => void;
};

export function InviteUserDialog({
  open,
  onOpenChange,
  onInvited,
}: InviteUserDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AuditFlowRole>("Auditor");
  const [temporaryAccess, setTemporaryAccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function resetForm() {
    setEmail("");
    setRole("Auditor");
    setTemporaryAccess(false);
    setExpiresAt("");
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (!next) resetForm();
    onOpenChange(next);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await inviteDirectoryUser({
        email,
        role,
        expiresAt: temporaryAccess && expiresAt ? expiresAt : null,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onInvited?.(result.message);
      handleOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 md:max-w-md"
        showCloseButton
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border/60 p-4 text-left">
            <DialogTitle className="m-0 text-lg font-medium text-neutral-900">
              Invite user
            </DialogTitle>
            <DialogDescription className="m-0 mt-1 text-sm text-muted-foreground">
              Send a Supabase Auth invitation with an assigned AuditFlow role.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as AuditFlowRole)}
              >
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {AUDITFLOW_ROLES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-neutral-50 p-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-900">
                <Checkbox
                  checked={temporaryAccess}
                  onCheckedChange={(checked) =>
                    setTemporaryAccess(checked === true)
                  }
                />
                Temporary access with expiration
              </label>
              {temporaryAccess ? (
                <div className="flex flex-col gap-1.5 pl-6">
                  <Label htmlFor="invite-expires">Expires on</Label>
                  <Input
                    id="invite-expires"
                    type="date"
                    required={temporaryAccess}
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                  />
                </div>
              ) : null}
            </div>

            {error ? (
              <p className="m-0 text-sm text-neutral-900" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 border-t border-border/60 p-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="black" disabled={pending}>
              {pending ? "Sending…" : "Send invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
