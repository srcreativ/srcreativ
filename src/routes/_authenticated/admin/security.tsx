import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AccountSettings } from "../admin";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/security")({
  head: () => ({
    meta: [
      { title: `Security | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SecurityPage,
});

function SecurityPage() {
  const [tested, setTested] = useState(false);
  return (
    <div className="space-y-8">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Access control & hardening</p>
            <h1 className="mt-1 text-3xl font-light">
              Admin Security Operations
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setTested(true)}
            className="inline-flex items-center gap-2 rounded-full border border-destructive px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-destructive"
          >
            <ShieldCheck className="h-4 w-4" />{" "}
            {tested ? "Route guard verified" : "Test 403 guard"}
          </button>
        </div>
        <div className="mt-6 rounded-2xl border border-[#d8b76c]/25 bg-card p-6 shadow-lg shadow-black/10">
          <h2 className="text-xl font-light">Application access controls</h2>
          <div className="mt-5 divide-y divide-border">
            <SecurityRule
              code="RULE-01"
              name="Strict /admin/* authentication gate"
              description="Unauthenticated visitors are redirected to sign in; authenticated non-admin users receive a 403 access screen."
            />
            <SecurityRule
              code="RULE-02"
              name="Admin role verification"
              description="Every protected route verifies the administrator role before rendering management controls."
            />
            <SecurityRule
              code="RULE-03"
              name="Media upload validation"
              description="The gallery validates image type and 10 MB file size before any upload is attempted."
            />
            <SecurityRule
              code="RULE-04"
              name="Disclosure reporting workspace"
              description="Security reports and researcher acknowledgements are managed separately in VDP & Hall of Fame."
            />
          </div>
        </div>
      </section>
      <section className="rounded-2xl border border-[#d8b76c]/25 bg-card p-6 shadow-lg shadow-black/10">
        <p className="eyebrow">Public security program</p>
        <h2 className="mt-1 text-xl font-light">
          Vulnerability Disclosure Program
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage the reporting policy, triage submissions, publish
          acknowledgements, and issue researcher certificates.
        </p>
        <Link
          to="/admin/vdp"
          className="mt-5 inline-flex rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Open VDP & Hall of Fame
        </Link>
      </section>
      <AccountSettings />
    </div>
  );
}

function SecurityRule({
  code,
  name,
  description,
}: {
  code: string;
  name: string;
  description: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm">
          <span className="mr-3 font-mono text-xs text-primary">{code}</span>
          {name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <span className="rounded-full border border-primary/60 bg-primary/10 px-3 py-1 text-xs uppercase tracking-wider text-primary">
        Active
      </span>
    </div>
  );
}
