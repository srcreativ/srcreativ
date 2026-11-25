import { createFileRoute } from "@tanstack/react-router";
import { Inquiries } from "../admin";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/inbox")({
  head: () => ({
    meta: [
      { title: `Inquiry inbox | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: InboxPage,
});

function InboxPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="eyebrow">Client communication</p>
        <h1 className="mt-1 text-3xl font-light">Inquiry inbox</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Review wedding inquiries, contact couples, and use the calendar to
          see requested dates.
        </p>
      </section>
      <Inquiries />
    </div>
  );
}
