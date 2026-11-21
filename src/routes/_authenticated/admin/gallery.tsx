import { createFileRoute } from "@tanstack/react-router";
import { GalleryManager } from "../admin";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  head: () => ({
    meta: [
      { title: `Gallery | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GalleryManager,
});
