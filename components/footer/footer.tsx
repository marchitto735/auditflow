"use client";

/**
 * Site footer — brand only. Primary navigation lives exclusively in the sidebar.
 */
export default function Footer() {
  return (
    <footer className="w-full text-foreground">
      <div className="w-full min-w-0 px-6 md:px-8">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 py-4">
          <p className="text-caption m-0 text-muted-foreground">
            AuditFlow · Compliance made simple.
          </p>
        </div>
      </div>
    </footer>
  );
}
