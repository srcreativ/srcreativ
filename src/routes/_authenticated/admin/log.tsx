import { createFileRoute } from "@tanstack/react-router";
import { AdminLogs, Inquiries } from "../admin";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/log")({
  head: () => ({
    meta: [
      { title: `Logs | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  return (
    <div className="space-y-10">
      <AdminLogs />
      <Inquiries />
    </div>
  );
}
