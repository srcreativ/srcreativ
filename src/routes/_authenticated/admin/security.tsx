import { createFileRoute, Link } from "@tanstack/react-router";
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
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10">
        <p className="eyebrow">Security center</p>
        <h1 className="mt-1 text-2xl font-light">
          Account and disclosure controls
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Manage this administrator account here. Vulnerability reports,
          researcher acknowledgements, and the public disclosure policy are in
          the dedicated VDP workspace.
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
