import { createFileRoute } from "@tanstack/react-router";
import { VdpManager } from "../admin";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/vdp")({
  head: () => ({
    meta: [
      { title: `VDP & Hall of Fame | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VdpManager,
});
