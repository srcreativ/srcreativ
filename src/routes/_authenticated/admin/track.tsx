import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Analytics } from "../admin";
import { SITE } from "@/lib/site-config";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/track")({
  head: () => ({
    meta: [
      { title: `Tracking | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TrackingPage,
});

function TrackingPage() {
  const { data: events = [] } = useQuery({
    queryKey: ["visitor-event-stream"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("id, created_at, path, language, referrer")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30_000,
  });
  const mobile = events.filter((event) =>
    /android|ios|mobile/i.test(event.referrer ?? ""),
  ).length;
  const conversion = events.length
    ? (
        (events.filter((event) => event.path.includes("inquir")).length /
          events.length) *
        100
      ).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-8">
      <Analytics />
      <section className="grid gap-4 md:grid-cols-2">
        <Metric
          label="Top device platform"
          value={mobile ? "Mobile" : "Desktop"}
          detail={
            events.length
              ? `${Math.round((mobile / events.length) * 100)}% of observed visits`
              : "Awaiting visitor data"
          }
        />
        <Metric
          label="Inquiry conversion"
          value={`${conversion}%`}
          detail={`${events.filter((event) => event.path.includes("inquir")).length} inquiry-page views / ${events.length} events`}
        />
      </section>
      <section className="overflow-hidden rounded-3xl border border-[#d8b76c]/25 bg-card shadow-lg shadow-black/10">
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <h2 className="text-lg font-light">Live Visitor Event Stream</h2>
          <span className="inline-flex items-center gap-2 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400" /> Refreshes
            every 30s
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="border-b border-border bg-background/60 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Time (IST)</th>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Referrer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="transition-colors hover:bg-primary/5"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleTimeString("en-IN", {
                      hour12: false,
                      timeZone: "Asia/Kolkata",
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">
                    evt_{event.id.slice(0, 6)}
                  </td>
                  <td className="px-4 py-3 font-mono text-primary">
                    {event.path}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded border border-border bg-background px-2 py-1 font-mono text-xs">
                      page_view
                    </span>
                  </td>
                  <td className="px-4 py-3">{event.language || "Unknown"}</td>
                  <td className="max-w-48 truncate px-4 py-3 text-muted-foreground">
                    {event.referrer || "Direct"}
                  </td>
                </tr>
              ))}
              {!events.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No visitor events have been recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <section className="rounded-xl border border-[#d8b76c]/25 bg-card p-5 shadow-lg shadow-black/10">
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-3xl font-light text-[#f3d18a]">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
    </section>
  );
}
