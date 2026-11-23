import { createFileRoute } from "@tanstack/react-router";
import { SiteEditor, SocialLinksEditor, ThemeMediaStudio } from "../admin";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/edit")({
  head: () => ({
    meta: [
      { title: `Website Settings | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditPage,
});

function EditPage() {
  return (
    <div className="space-y-8">
      <SiteEditor />
      <SocialLinksEditor />
      <ThemeMediaStudio />
    </div>
  );
}
