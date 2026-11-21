import { createFileRoute } from "@tanstack/react-router";
import { Analytics } from "../admin";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/track")({
  head: () => ({
    meta: [
      { title: `Tracking | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Analytics,
});
