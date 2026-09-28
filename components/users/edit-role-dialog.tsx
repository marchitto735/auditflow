"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { updateDirectoryUserRole } from "@/app/actions/user-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AUDITFLOW_ROLES,
  type AuditFlowRole,
  type DirectoryUser,
} from "@/lib/users";

type EditRoleDialogProps = {
  user: DirectoryUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated?: (userId: string, role: AuditFlowRole, message: string) => void;
};

export function EditRoleDialog({
  user,
  open,
  onOpenChange,
  onUpdated,
}: EditRoleDialogProps) {
  const [role, setRole] = useState<AuditFlowRole>("Viewer");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setError(null);
    }
  }, [user]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError(null);
    startTransition(async () => {
      const result = await updateDirectoryUserRole({
        userId: user.id,
        role,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onUpdated?.(user.id, role, result.message);
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden p-0 md:max-w-md"
        showCloseButton
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-neutral-200 p-4 pr-12 text-left">
            <DialogTitle className="m-0 text-lg font-medium text-neutral-900">
              Edit role
            </DialogTitle>
            <DialogDescription className="m-0 mt-1 text-sm text-muted-foreground">
              {user
                ? `Update RBAC assignment for ${user.name}.`
                : "Update RBAC assignment."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-role">Assigned role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as AuditFlowRole)}
              >
                <SelectTrigger id="edit-role" className="w-full">
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
            {error ? (
              <p className="m-0 text-sm text-neutral-900" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="border-t border-neutral-200 p-4">
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="black" disabled={pending || !user}>
              {pending ? "Saving…" : "Save role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
