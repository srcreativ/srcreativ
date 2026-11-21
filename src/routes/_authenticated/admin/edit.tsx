import { createFileRoute } from "@tanstack/react-router";
import { SiteEditor, ThemeMediaStudio } from "../admin";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/edit")({
  head: () => ({
    meta: [
      { title: `Website Editor | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditPage,
});

function EditPage() {
  return (
    <div className="space-y-8">
      <SiteEditor />
      <ThemeMediaStudio />
    </div>
  );
}
