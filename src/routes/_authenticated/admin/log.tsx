import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Inquiries } from "../admin";
import { SITE } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";

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
  const [query, setQuery] = useState("");
  const { data: views = [] } = useQuery({
    queryKey: ["audit-log-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("id, created_at, path, language, referrer")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return views;
    return views.filter((view) =>
      [view.path, view.language, view.referrer, view.id]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [query, views]);
  const exportLogs = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sr-studio-visitor-log-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">Audit trail & edge worker diagnostics</p>
            <h1 className="mt-1 text-3xl font-light">System & Admin Logs</h1>
          </div>
          <button
            type="button"
            onClick={exportLogs}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground"
          >
            <Download className="h-4 w-4" /> Export JSON logs
          </button>
        </div>
        <div className="mt-6 rounded-2xl border border-[#d8b76c]/25 bg-card p-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search logs by route, language, referrer, or ID…"
            className="w-full rounded-full border border-input bg-background px-5 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#d8b76c]/25 bg-card">
          {filtered.map((view) => (
            <article
              key={view.id}
              className="border-b border-border px-5 py-4 last:border-0"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded border border-primary/50 bg-primary/10 px-2 py-1 font-mono text-[11px] text-primary">
                    INFO
                  </span>
                  <span className="font-mono text-xs text-primary">
                    LOG-{view.id.slice(0, 6).toUpperCase()}
                  </span>
                  <strong className="font-normal">
                    Recorded public page view{" "}
                    <code className="font-mono text-primary">{view.path}</code>
                  </strong>
                </div>
                <time className="font-mono text-xs text-muted-foreground">
                  {new Date(view.created_at).toLocaleString("en-IN")}
                </time>
              </div>
              <div className="mt-3 flex flex-wrap justify-between gap-3 text-xs text-muted-foreground">
                <span>Language: {view.language || "Unknown"}</span>
                <span className="rounded border border-border px-2 py-1 font-mono">
                  {view.referrer || "Direct visit"}
                </span>
              </div>
            </article>
          ))}
          {!filtered.length && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No log events match this search.
            </p>
          )}
        </div>
      </section>
      <Inquiries />
    </div>
  );
}
