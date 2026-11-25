import {
  createFileRoute,
  Link,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  Trash2,
  Upload,
  Eye,
  Users,
  Mail,
  Image as ImageIcon,
  Bell,
  BellRing,
  Check,
  LockKeyhole,
  Pencil,
  Smartphone,
  X,
  Download,
  Plus,
  Save,
  ShieldAlert,
  Palette,
  GripVertical,
  RotateCcw,
  ImagePlus,
  Video,
  ChevronDown,
  FileText,
  Settings,
  House,
  CalendarDays,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AppInstallPrompt } from "@/components/AppInstallPrompt";
import { SITE } from "@/lib/site-config";
import {
  DEFAULT_SITE_SETTINGS,
  siteSettingsFrom,
  type SiteSettings,
} from "@/lib/site-settings";
import {
  DEFAULT_VDP_HALL,
  DEFAULT_VDP_SETTINGS,
  vdpSettingsFrom,
  type VdpHallEntry,
  type VdpSettings,
} from "@/lib/vdp-settings";
import {
  downloadSecurityCertificate,
  previewSecurityCertificate,
} from "@/lib/security-certificate";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: `Admin Panel | ${SITE.name}` },
      {
        name: "description",
        content: `${SITE.name} analytics and gallery management.`,
      },
      { property: "og:title", content: `Admin Panel | ${SITE.name}` },
      {
        property: "og:description",
        content: `${SITE.name} analytics and gallery management.`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

const CATS = SITE.galleryCategories;
type GalleryImage = Database["public"]["Tables"]["gallery_images"]["Row"];
const MAX_GALLERY_FILE_SIZE = 10 * 1024 * 1024;

async function withUploadTimeout<T>(operation: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () =>
        reject(
          new Error(
            "The upload timed out. Check your connection and the configured media storage.",
          ),
        ),
      30_000,
    );
  });
  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const ADMIN_NAV = [
  { label: "Public website", to: "/", icon: House },
  { label: "Gallery", to: "/admin/gallery", icon: ImageIcon },
  { label: "Tracking", to: "/admin/track", icon: Eye },
  { label: "Calendar", to: "/admin/calendar", icon: CalendarDays },
  { label: "Inbox", to: "/admin/inbox", icon: MessageSquare },
  { label: "Logs", to: "/admin/log", icon: FileText },
  { label: "Security", to: "/admin/security", icon: ShieldAlert },
  { label: "VDP & HoF", to: "/admin/vdp", icon: LockKeyhole },
  { label: "Settings", to: "/admin/edit", icon: Settings },
] as const;

function Admin() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () =>
      (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }))
        .data === true,
  });

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-6 py-3">
          <Link to="/" className="font-semibold tracking-[0.25em]">
            {SITE.name.toUpperCase()}{" "}
            <span className="text-primary">ADMIN</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <nav
              aria-label="Admin navigation"
              className="flex items-center gap-1"
            >
              {ADMIN_NAV.map(({ label, to, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  aria-label={label}
                  activeProps={{
                    className:
                      "border-primary/60 bg-primary/15 text-primary hover:text-primary",
                  }}
                  className="group relative inline-flex size-9 items-center justify-center rounded-full border border-transparent text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary focus-visible:border-primary/60 focus-visible:bg-primary/15 focus-visible:text-primary"
                >
                  <Icon aria-hidden="true" className="size-4" />
                  <span className="pointer-events-none absolute right-0 top-full z-50 mt-2 hidden whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[11px] font-medium text-foreground shadow-lg group-hover:block group-focus-visible:block">
                    {label}
                  </span>
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="inline-flex size-9 items-center justify-center rounded-full border border-primary/70 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 27.517 27.517"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                className="size-4"
              >
                <path
                  d="M6.59 4.072c-9.9528 9.4883-2.6196 21.355 7.1756 21.513 10.452.16815 16.639-12.574 7.4898-21.37"
                  strokeWidth="3"
                />
                <path d="m13.71 2.025.10537 10.999" strokeWidth="4" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !isAdmin ? (
          <section className="rounded-3xl border border-destructive/50 bg-card p-8">
            <p className="eyebrow text-destructive">403 · Forbidden</p>
            <h1 className="mt-2 text-3xl font-light">Admin access required</h1>
            <p className="mt-3 text-muted-foreground">
              This account is authenticated, but it does not have permission to
              open the SR Studio administration tools.
            </p>
          </section>
        ) : (
          <>
            <InquiryAlerts />
            <MobileAdminTools />
            <Outlet />
          </>
        )}
      </main>
    </div>
  );
}

function MobileAdminTools() {
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(
    typeof Notification === "undefined"
      ? "unsupported"
      : Notification.permission,
  );
  const [open, setOpen] = useState(true);

  const enableNotifications = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Notifications are not supported by this browser");
      return;
    }
    const next = await Notification.requestPermission();
    setPermission(next);
    if (next === "granted") toast.success("Inquiry notifications enabled");
    else toast.error("Notification permission was not granted");
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Studio app</p>
          <h2 className="mt-2 flex items-center gap-2 text-xl font-light">
            <Smartphone className="h-5 w-5 text-primary" /> Manage SR Studio
            from Android
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {open ? "Hide app tools" : "Show app tools"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && (
        <div className="mt-5 border-t border-border pt-5">
          <p className="max-w-2xl text-sm text-muted-foreground">
            Install this admin panel as an app to upload, edit, delete, and
            manage gallery work from your phone.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <AppInstallPrompt />
            <button
              type="button"
              onClick={enableNotifications}
              disabled={
                permission === "granted" || permission === "unsupported"
              }
              className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {permission === "granted" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              {permission === "granted"
                ? "Alerts enabled"
                : "Enable inquiry alerts"}
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Alerts appear while this installed app or admin page is open. Keep
            this page open to receive live browser notifications.
          </p>
        </div>
      )}
    </section>
  );
}

function InquiryAlerts() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("admin-inquiry-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "inquiries" },
        (payload) => {
          const inquiry = payload.new as { name?: string; email?: string };
          const title = "New wedding inquiry";
          const body = inquiry.name
            ? `${inquiry.name}${inquiry.email ? ` · ${inquiry.email}` : ""}`
            : "Open the admin panel to review it.";
          qc.invalidateQueries({ queryKey: ["inquiries"] });
          qc.invalidateQueries({ queryKey: ["analytics"] });
          toast.success(title, {
            description: body,
            icon: <BellRing className="h-4 w-4" />,
          });
          if (
            typeof Notification !== "undefined" &&
            Notification.permission === "granted"
          ) {
            new Notification(title, { body, icon: "/sr-studio-mark.svg" });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return null;
}

export function SiteEditor() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("data")
        .eq("id", "default")
        .maybeSingle();
      if (error) throw error;
      return data?.data;
    },
    retry: false,
  });
  const [draft, setDraft] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [lastLoaded, setLastLoaded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const next = siteSettingsFrom(data);
    const snapshot = JSON.stringify(next);
    if (snapshot !== lastLoaded) {
      setDraft(next);
      setLastLoaded(snapshot);
    }
  }, [data, isLoading, lastLoaded]);

  const updateGroup = <
    Group extends "brand" | "hero" | "artist" | "inquiry" | "footer",
    Key extends keyof SiteSettings[Group],
  >(
    group: Group,
    key: Key,
    value: SiteSettings[Group][Key],
  ) =>
    setDraft((current) => ({
      ...current,
      [group]: { ...current[group], [key]: value },
    }));

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      {
        id: "default",
        data: draft,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLastLoaded(JSON.stringify(draft));
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["public-site-settings"] });
    toast.success("Website changes published");
  };

  const restoreDefaults = async () => {
    try {
      const response = await fetch("/default-site-settings.json", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Default settings file is unavailable");
      setDraft(siteSettingsFrom(await response.json()));
      toast.success("Default settings loaded. Save & publish to apply them.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const updateService = (
    index: number,
    key: "title" | "description" | "points",
    value: string,
  ) =>
    setDraft((current) => ({
      ...current,
      services: current.services.map((service, position) =>
        position === index
          ? {
              ...service,
              [key]:
                key === "points"
                  ? value
                      .split("\n")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  : value,
            }
          : service,
      ),
    }));

  const updateTestimonial = (
    index: number,
    key: "name" | "place" | "text",
    value: string,
  ) =>
    setDraft((current) => ({
      ...current,
      testimonials: current.testimonials.map((item, position) =>
        position === index ? { ...item, [key]: value } : item,
      ),
    }));

  return (
    <section className="rounded-3xl border border-primary/40 bg-card p-6 shadow-lg shadow-black/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Reusable website editor</p>
          <h2 className="mt-1 text-2xl font-light">Client website settings</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Edit your website using simple fields. Changes appear in the preview
            immediately and publish when you save.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Open live site
        </a>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <SettingsGroup title="Brand & contact details">
            <SettingsInput
              label="Business name"
              value={draft.brand.name}
              onChange={(value) => updateGroup("brand", "name", value)}
            />
            <SettingsInput
              label="Short description"
              value={draft.brand.description}
              onChange={(value) => updateGroup("brand", "description", value)}
              textarea
            />
            <SettingsInput
              label="Email"
              value={draft.brand.email}
              onChange={(value) => updateGroup("brand", "email", value)}
              type="email"
            />
            <SettingsInput
              label="Phone"
              value={draft.brand.phone}
              onChange={(value) => updateGroup("brand", "phone", value)}
              type="tel"
            />
            <SettingsInput
              label="Base city"
              value={draft.brand.location}
              onChange={(value) => updateGroup("brand", "location", value)}
            />
          </SettingsGroup>
          <SettingsGroup title="Hero section">
            <SettingsInput
              label="Small heading"
              value={draft.hero.eyebrow}
              onChange={(value) => updateGroup("hero", "eyebrow", value)}
            />
            <SettingsInput
              label="Main heading"
              value={draft.hero.title}
              onChange={(value) => updateGroup("hero", "title", value)}
            />
            <SettingsInput
              label="Gold highlighted words"
              value={draft.hero.highlight}
              onChange={(value) => updateGroup("hero", "highlight", value)}
            />
            <SettingsInput
              label="Introduction"
              value={draft.hero.subtitle}
              onChange={(value) => updateGroup("hero", "subtitle", value)}
              textarea
            />
            <SettingsInput
              label="Portfolio button"
              value={draft.hero.primaryCta}
              onChange={(value) => updateGroup("hero", "primaryCta", value)}
            />
            <SettingsInput
              label="Inquiry button"
              value={draft.hero.secondaryCta}
              onChange={(value) => updateGroup("hero", "secondaryCta", value)}
            />
          </SettingsGroup>
          <SettingsGroup title="Artist profile">
            <SettingsInput
              label="Section label"
              value={draft.artist.label}
              onChange={(value) => updateGroup("artist", "label", value)}
            />
            <SettingsInput
              label="Main title"
              value={draft.artist.title}
              onChange={(value) => updateGroup("artist", "title", value)}
            />
            <SettingsInput
              label="Gold highlighted words"
              value={draft.artist.highlight}
              onChange={(value) => updateGroup("artist", "highlight", value)}
            />
            <SettingsInput
              label="Achievement number"
              value={draft.artist.metric}
              onChange={(value) => updateGroup("artist", "metric", value)}
            />
            <SettingsInput
              label="Achievement description"
              value={draft.artist.metricLabel}
              onChange={(value) => updateGroup("artist", "metricLabel", value)}
            />
            {draft.artist.paragraphs.map((paragraph, index) => (
              <SettingsInput
                key={index}
                label={`Profile paragraph ${index + 1}`}
                value={paragraph}
                onChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    artist: {
                      ...current.artist,
                      paragraphs: current.artist.paragraphs.map(
                        (item, position) => (position === index ? value : item),
                      ),
                    },
                  }))
                }
                textarea
              />
            ))}
          </SettingsGroup>
          <SettingsGroup title="Services">
            {draft.services.map((service, index) => (
              <div
                key={`${service.title}-${index}`}
                className="space-y-3 rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Service {index + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        services: current.services.filter(
                          (_, position) => position !== index,
                        ),
                      }))
                    }
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <SettingsInput
                  label="Service name"
                  value={service.title}
                  onChange={(value) => updateService(index, "title", value)}
                />
                <SettingsInput
                  label="Description"
                  value={service.description}
                  onChange={(value) =>
                    updateService(index, "description", value)
                  }
                  textarea
                />
                <SettingsInput
                  label="Included items (one per line)"
                  value={service.points.join("\n")}
                  onChange={(value) => updateService(index, "points", value)}
                  textarea
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  services: [
                    ...current.services,
                    { title: "New service", description: "", points: [] },
                  ],
                }))
              }
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" /> Add service
            </button>
          </SettingsGroup>
          <SettingsGroup title="Client testimonials">
            {draft.testimonials.map((item, index) => (
              <div
                key={`${item.name}-${index}`}
                className="space-y-3 rounded-xl border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">Testimonial {index + 1}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        testimonials: current.testimonials.filter(
                          (_, position) => position !== index,
                        ),
                      }))
                    }
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
                <SettingsInput
                  label="Couple or client name"
                  value={item.name}
                  onChange={(value) => updateTestimonial(index, "name", value)}
                />
                <SettingsInput
                  label="City"
                  value={item.place}
                  onChange={(value) => updateTestimonial(index, "place", value)}
                />
                <SettingsInput
                  label="Review"
                  value={item.text}
                  onChange={(value) => updateTestimonial(index, "text", value)}
                  textarea
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setDraft((current) => ({
                  ...current,
                  testimonials: [
                    ...current.testimonials,
                    { name: "New client", place: "", text: "" },
                  ],
                }))
              }
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" /> Add testimonial
            </button>
          </SettingsGroup>
          <SettingsGroup title="Inquiry & footer">
            <SettingsInput
              label="Inquiry small heading"
              value={draft.inquiry.eyebrow}
              onChange={(value) => updateGroup("inquiry", "eyebrow", value)}
            />
            <SettingsInput
              label="Inquiry title"
              value={draft.inquiry.title}
              onChange={(value) => updateGroup("inquiry", "title", value)}
            />
            <SettingsInput
              label="Inquiry highlighted words"
              value={draft.inquiry.highlight}
              onChange={(value) => updateGroup("inquiry", "highlight", value)}
            />
            <SettingsInput
              label="Inquiry description"
              value={draft.inquiry.description}
              onChange={(value) => updateGroup("inquiry", "description", value)}
              textarea
            />
            <SettingsInput
              label="Location field label"
              value={draft.inquiry.locationLabel}
              onChange={(value) =>
                updateGroup("inquiry", "locationLabel", value)
              }
            />
            <SettingsInput
              label="Submit button"
              value={draft.inquiry.submitLabel}
              onChange={(value) => updateGroup("inquiry", "submitLabel", value)}
            />
            <SettingsInput
              label="Footer heading"
              value={draft.footer.headline}
              onChange={(value) => updateGroup("footer", "headline", value)}
            />
            <SettingsInput
              label="Footer highlighted words"
              value={draft.footer.highlight}
              onChange={(value) => updateGroup("footer", "highlight", value)}
            />
            <SettingsInput
              label="Footer availability message"
              value={draft.footer.availability}
              onChange={(value) => updateGroup("footer", "availability", value)}
            />
            <SettingsInput
              label="Copyright name"
              value={draft.footer.copyrightName}
              onChange={(value) =>
                updateGroup("footer", "copyrightName", value)
              }
            />
          </SettingsGroup>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Publishing…" : "Publish website changes"}
            </button>
            <button
              type="button"
              onClick={restoreDefaults}
              className="rounded-full border border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-primary"
            >
              Restore default settings
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="eyebrow">Live draft preview</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-primary/40 bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs">
              <span className="tracking-[0.2em]">
                {draft.brand.name.toUpperCase()}
              </span>
              <span className="text-primary">MENU</span>
            </div>
            <div className="bg-gradient-to-br from-card via-background to-secondary p-6">
              <p className="eyebrow">{draft.hero.eyebrow}</p>
              <h3 className="mt-4 text-3xl font-light leading-tight">
                {draft.hero.title}{" "}
                <i className="font-serif text-gold">{draft.hero.highlight}</i>
              </h3>
              <p className="mt-4 text-sm text-muted-foreground">
                {draft.hero.subtitle}
              </p>
              <button className="mt-5 rounded-full border border-primary px-4 py-2 text-xs text-primary">
                {draft.hero.primaryCta}
              </button>
            </div>
            <div className="border-t border-border p-4 text-xs text-muted-foreground">
              {draft.brand.email} · {draft.brand.phone}
              <br />
              {draft.brand.location}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Preview updates as you type. Publishing updates the public website
            without a redeploy.
          </p>
        </div>
      </div>
    </section>
  );
}

function SettingsGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details
      open
      className="group rounded-2xl border border-border bg-card p-5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-light [&::-webkit-details-marker]:hidden [&::marker]:content-none">
        {title}
        <ChevronDown
          aria-hidden="true"
          className="size-4 transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </details>
  );
}

function SettingsInput({
  label,
  value,
  onChange,
  textarea = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <label className={`block text-sm ${textarea ? "sm:col-span-2" : ""}`}>
      <span className="mb-2 block text-foreground">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={4}
          className="w-full resize-y rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
        />
      )}
    </label>
  );
}

export function SocialLinksEditor() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings-social-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("data")
        .eq("id", "default")
        .maybeSingle();
      if (error) throw error;
      return data?.data;
    },
    retry: false,
  });
  const [links, setLinks] = useState<{ label: string; url: string }[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const next = siteSettingsFrom(data).footer.socialLinks;
    const snapshot = JSON.stringify(next);
    if (snapshot !== loaded) {
      setLinks(next);
      setLoaded(snapshot);
    }
  }, [data, isLoading, loaded]);

  const update = (index: number, key: "label" | "url", value: string) =>
    setLinks((current) =>
      current.map((link, position) =>
        position === index ? { ...link, [key]: value } : link,
      ),
    );

  const save = async () => {
    const cleaned = links
      .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
      .filter((link) => link.label || link.url);
    if (cleaned.some((link) => !link.label || !safeHyperlink(link.url))) {
      toast.error(
        "Every link needs a label and a valid http(s), mailto, or tel URL.",
      );
      return;
    }
    const settings = siteSettingsFrom(data);
    setSaving(true);
    const { error } = await supabase.from("site_settings").upsert(
      {
        id: "default",
        data: {
          ...settings,
          footer: { ...settings.footer, socialLinks: cleaned },
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    setSaving(false);
    if (error) return toast.error(error.message);
    setLinks(cleaned);
    setLoaded(JSON.stringify(cleaned));
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["site-settings-social-links"] });
    qc.invalidateQueries({ queryKey: ["public-site-settings"] });
    toast.success("Footer links published");
  };

  return (
    <section className="rounded-3xl border border-primary/40 bg-card p-6 shadow-lg shadow-black/10">
      <p className="eyebrow">Footer links</p>
      <h2 className="mt-1 text-2xl font-light">Social & custom hyperlinks</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Add, rename, remove, and publish the links shown in the public footer.
        Use full URLs such as https://instagram.com/yourstudio.
      </p>
      <div className="mt-6 space-y-3">
        {links.length === 0 && (
          <p className="rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground">
            No footer hyperlinks yet. Add one below.
          </p>
        )}
        {links.map((link, index) => (
          <div
            key={`${link.label}-${index}`}
            className="grid gap-3 rounded-xl border border-border bg-background p-3 sm:grid-cols-[0.45fr_1fr_auto]"
          >
            <label className="sr-only" htmlFor={`social-label-${index}`}>
              Link label
            </label>
            <input
              id={`social-label-${index}`}
              value={link.label}
              onChange={(event) => update(index, "label", event.target.value)}
              placeholder="Instagram"
              maxLength={50}
              className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <label className="sr-only" htmlFor={`social-url-${index}`}>
              Link URL
            </label>
            <input
              id={`social-url-${index}`}
              value={link.url}
              onChange={(event) => update(index, "url", event.target.value)}
              placeholder="https://…"
              inputMode="url"
              maxLength={500}
              className="rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() =>
                setLinks((current) =>
                  current.filter((_, position) => position !== index),
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/50 px-3 py-2 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
              aria-label={`Remove ${link.label || "link"}`}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            setLinks((current) => [...current, { label: "", url: "" }])
          }
          className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add hyperlink
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded-full bg-gold px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-60"
        >
          {saving ? "Publishing…" : "Save footer links"}
        </button>
      </div>
    </section>
  );
}

const MEDIA_SLOTS = [
  ["titleIcon", "Title icon / favicon", "image"],
  ["heroVideo", "Hero background video", "video"],
  ["heroPoster", "Hero video poster", "image"],
  ["artistPortrait", "The Artist portrait", "image"],
  ["artistNote", "A Note from the Artist image", "image"],
  ["controllerImage", "Drone controller", "image"],
  ["droneVideo", "Drone controller screen video", "video"],
  ["gallery.candid", "Gallery: Haldi Laughter", "image"],
  ["gallery.drone", "Gallery: Lakeside Vows", "image"],
  ["gallery.cinematic", "Gallery: The Bridal Walk", "image"],
  ["gallery.prewedding", "Gallery: Above the Clouds", "image"],
  ["gallery.candid2", "Gallery: Seven Promises", "image"],
  ["gallery.hero", "Gallery: Palace of Gold", "image"],
  ["gallery.ceremony1", "Gallery: Before the Vows", "image"],
  ["gallery.ceremony2", "Gallery: Held Close", "image"],
  ["gallery.ceremony3", "Gallery: Sacred Promises", "image"],
  ["gallery.ceremony4", "Gallery: Together, Always", "image"],
] as const;

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  portfolio: "Featured work",
  drone: "Drone showcase",
  ad: "Featured message",
  "artist-profile": "The Artist",
  services: "What we offer",
  about: "A note from the artist",
  testimonials: "Kind words",
  inquiry: "Inquiry",
};

export function ThemeMediaStudio() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["site-settings-theme-media"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("data")
        .eq("id", "default")
        .maybeSingle();
      if (error) throw error;
      return data?.data;
    },
    retry: false,
  });
  const [draft, setDraft] = useState(() => siteSettingsFrom(null));
  const [loaded, setLoaded] = useState<string | null>(null);
  const [open, setOpen] = useState(true);
  const [busySlot, setBusySlot] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragged, setDragged] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    const next = siteSettingsFrom(data);
    const snapshot = JSON.stringify(next);
    if (snapshot !== loaded) {
      setDraft(next);
      setLoaded(snapshot);
    }
  }, [data, isLoading, loaded]);

  const updateTheme = <K extends keyof SiteSettings["theme"]>(
    key: K,
    value: SiteSettings["theme"][K],
  ) =>
    setDraft((current) => ({
      ...current,
      theme: { ...current.theme, [key]: value },
    }));
  const slotValue = (slot: string) =>
    slot.startsWith("gallery.")
      ? draft.media.gallery[slot.slice(8)] || ""
      : draft.media[slot as Exclude<keyof SiteSettings["media"], "gallery">];
  const setSlot = (slot: string, value: string) =>
    setDraft((current) =>
      slot.startsWith("gallery.")
        ? {
            ...current,
            media: {
              ...current.media,
              gallery: { ...current.media.gallery, [slot.slice(8)]: value },
            },
          }
        : { ...current, media: { ...current.media, [slot]: value } },
    );
  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        { id: "default", data: draft, updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
    setSaving(false);
    if (error) return toast.error(error.message);
    setLoaded(JSON.stringify(draft));
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["public-site-settings"] });
    qc.invalidateQueries({ queryKey: ["site-settings-theme-media"] });
    toast.success("Theme and landing-page media published");
  };
  const upload = async (slot: string, file: File) => {
    const kind = MEDIA_SLOTS.find(([key]) => key === slot)?.[2];
    if (kind === "image" && !file.type.startsWith("image/"))
      return toast.error("Choose an image for this slot");
    if (kind === "video" && !file.type.startsWith("video/"))
      return toast.error("Choose a video for this slot");
    if (file.size > 100 * 1024 * 1024)
      return toast.error("Each asset must be 100 MB or smaller");
    setBusySlot(slot);
    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() ||
        (kind === "video" ? "mp4" : "webp");
      const path = `landing/${slot.replace(".", "-")}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabase.storage
        .from("site-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: url } = supabase.storage
        .from("site-media")
        .getPublicUrl(path);
      setSlot(slot, url.publicUrl);
      toast.success("Asset uploaded. Save & publish to make it live.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusySlot(null);
    }
  };
  const reorder = (target: string) => {
    if (!dragged || dragged === target) return;
    const order = [...draft.theme.sectionOrder];
    const from = order.indexOf(dragged);
    const to = order.indexOf(target);
    if (from < 0 || to < 0) return;
    order.splice(from, 1);
    order.splice(to, 0, dragged);
    updateTheme("sectionOrder", order);
    setDragged(null);
  };

  return (
    <section className="rounded-3xl border border-primary/40 bg-card p-6 shadow-lg shadow-black/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow">No-code site studio</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-light">
            <Palette className="h-5 w-5 text-primary" /> Theme, layout & landing
            media
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Choose your palette, move sections by drag and drop, adjust
            dimensions with sliders, and replace every landing-page image,
            video, and title mark.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {open ? "Minimize editor" : "Maximize editor"}
          <ChevronDown
            aria-hidden="true"
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {open && (
        <div className="mt-7 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <details
              open
              className="group rounded-2xl border border-border bg-background p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-light [&::-webkit-details-marker]:hidden [&::marker]:content-none">
                Theme controls
                <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ["background", "Page background"],
                    ["foreground", "Text color"],
                    ["primary", "Gold accent"],
                    ["card", "Card color"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="text-sm">
                    {label}
                    <span className="mt-2 flex items-center gap-3 rounded-xl border border-input bg-card px-3 py-2">
                      <input
                        type="color"
                        value={draft.theme[key]}
                        onChange={(event) =>
                          updateTheme(key, event.target.value)
                        }
                        className="h-8 w-10 cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        value={draft.theme[key]}
                        onChange={(event) =>
                          updateTheme(key, event.target.value)
                        }
                        className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none"
                      />
                    </span>
                  </label>
                ))}
                <label className="text-sm">
                  Corner roundness{" "}
                  <span className="float-right text-primary">
                    {draft.theme.radius}px
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="32"
                    value={draft.theme.radius}
                    onChange={(event) =>
                      updateTheme("radius", Number(event.target.value))
                    }
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                </label>
                <label className="text-sm">
                  Heading scale{" "}
                  <span className="float-right text-primary">
                    {draft.theme.headingScale.toFixed(2)}×
                  </span>
                  <input
                    type="range"
                    min="0.8"
                    max="1.25"
                    step="0.05"
                    value={draft.theme.headingScale}
                    onChange={(event) =>
                      updateTheme("headingScale", Number(event.target.value))
                    }
                    className="mt-3 w-full accent-[var(--primary)]"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({
                    ...current,
                    theme: DEFAULT_SITE_SETTINGS.theme,
                    media: current.media,
                  }))
                }
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset theme defaults
              </button>
            </details>
            <details
              open
              className="group rounded-2xl border border-border bg-background p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-light [&::-webkit-details-marker]:hidden [&::marker]:content-none">
                Section order
                <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Drag a row to rearrange the public landing page.
              </p>
              <div className="mt-4 space-y-2">
                {draft.theme.sectionOrder.map((section) => (
                  <div
                    key={section}
                    draggable
                    onDragStart={() => setDragged(section)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => reorder(section)}
                    className="flex cursor-grab items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm active:cursor-grabbing"
                  >
                    <GripVertical className="h-4 w-4 text-primary" />
                    <span className="flex-1">
                      {SECTION_LABELS[section] || section}
                    </span>
                    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {draft.theme.sectionVisibility[section] === false
                          ? "Hidden"
                          : "Visible"}
                      </span>
                      <input
                        type="checkbox"
                        checked={
                          draft.theme.sectionVisibility[section] !== false
                        }
                        onChange={(event) =>
                          updateTheme("sectionVisibility", {
                            ...draft.theme.sectionVisibility,
                            [section]: event.target.checked,
                          })
                        }
                        className="size-4 accent-[var(--primary)]"
                        aria-label={`Show ${SECTION_LABELS[section] || section} section`}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </details>
            <details
              open
              className="group rounded-2xl border border-border bg-background p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-light [&::-webkit-details-marker]:hidden [&::marker]:content-none">
                Landing-page media
                <ChevronDown aria-hidden="true" className="size-4 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">
                Upload JPG, PNG, WebP, SVG, MP4, or WebM files. Video and image
                uploads are capped at 100 MB.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {MEDIA_SLOTS.map(([slot, label, kind]) => (
                  <label
                    key={slot}
                    className="group rounded-xl border border-border bg-card p-3 text-sm transition hover:border-primary/50"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      {kind === "video" ? (
                        <Video className="h-4 w-4 text-primary" />
                      ) : (
                        <ImagePlus className="h-4 w-4 text-primary" />
                      )}
                      {label}
                    </span>
                    <span className="mt-2 block truncate font-mono text-[10px] text-muted-foreground">
                      {slotValue(slot) || "Built-in default"}
                    </span>
                    <input
                      type="file"
                      accept={
                        kind === "video"
                          ? "video/mp4,video/webm"
                          : "image/jpeg,image/png,image/webp,image/svg+xml"
                      }
                      className="mt-3 block w-full text-xs"
                      disabled={busySlot === slot}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) upload(slot, file);
                        event.currentTarget.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setSlot(slot, "")}
                      className="mt-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Use built-in default
                    </button>
                  </label>
                ))}
              </div>
            </details>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60"
              >
                {saving ? "Publishing…" : "Save & publish"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(siteSettingsFrom(data))}
                className="rounded-full border border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Reset unsaved changes
              </button>
            </div>
          </div>
          <aside className="rounded-2xl border border-border bg-background p-5 xl:sticky xl:top-6 xl:h-fit">
            <p className="eyebrow">Live theme preview</p>
            <div
              style={{
                background: draft.theme.background,
                color: draft.theme.foreground,
                borderRadius: draft.theme.radius,
              }}
              className="mt-4 overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs">
                <span className="tracking-[0.2em]">
                  {draft.brand.name.toUpperCase()}
                </span>
                <span style={{ color: draft.theme.primary }}>MENU</span>
              </div>
              <div className="min-h-72 bg-gradient-to-br from-black/30 to-transparent p-6">
                <p
                  className="text-xs uppercase tracking-[0.2em]"
                  style={{ color: draft.theme.primary }}
                >
                  {draft.hero.eyebrow}
                </p>
                <h3
                  className="mt-5 font-serif font-light leading-tight"
                  style={{ fontSize: `${2.2 * draft.theme.headingScale}rem` }}
                >
                  {draft.hero.title}{" "}
                  <i style={{ color: draft.theme.primary }}>
                    {draft.hero.highlight}
                  </i>
                </h3>
                <p className="mt-4 text-sm opacity-75">{draft.hero.subtitle}</p>
                <span
                  style={{
                    borderColor: draft.theme.primary,
                    color: draft.theme.primary,
                  }}
                  className="mt-6 inline-block rounded-full border px-4 py-2 text-xs"
                >
                  {draft.hero.primaryCta}
                </span>
              </div>
              <div
                style={{ background: draft.theme.card }}
                className="p-4 text-xs opacity-80"
              >
                {draft.theme.sectionOrder
                  .filter(
                    (section) =>
                      draft.theme.sectionVisibility[section] !== false,
                  )
                  .map((section) => SECTION_LABELS[section])
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
            <iframe
              title="Published public website preview"
              src="/"
              className="mt-5 h-80 w-full rounded-xl border border-border bg-card"
            />
          </aside>
        </div>
      )}
    </section>
  );
}

export function VdpManager() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"reports" | "hall" | "policy">("reports");
  const [settings, setSettings] = useState<VdpSettings>(DEFAULT_VDP_SETTINGS);
  const [draftEntry, setDraftEntry] = useState<VdpHallEntry | null>(null);
  const [certificatePreview, setCertificatePreview] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const { data: storedSettings } = useQuery({
    queryKey: ["vdp-program-settings-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vdp_program_settings")
        .select("data")
        .eq("id", "default")
        .maybeSingle();
      if (error) throw error;
      return data?.data;
    },
    retry: false,
  });
  const { data: hall = [] } = useQuery({
    queryKey: ["vdp-hall-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vdp_hall_of_fame")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    retry: false,
  });
  const { data: reports = [] } = useQuery({
    queryKey: ["vdp-reports-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vdp_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    retry: false,
  });

  useEffect(
    () => setSettings(vdpSettingsFrom(storedSettings)),
    [storedSettings],
  );
  const entries: VdpHallEntry[] = hall.length
    ? hall.map((entry) => ({
        id: entry.id,
        name: entry.name,
        handle: entry.handle,
        category: entry.category,
        severity: entry.severity as VdpHallEntry["severity"],
        date: entry.recognition_date,
        refId: entry.reference_id ?? "",
        profileUrl: entry.profile_url || "",
        note: entry.note,
        featured: entry.featured,
        published: entry.published,
        certificateId: entry.certificate_id,
      }))
    : DEFAULT_VDP_HALL;
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["vdp-program-settings"] });
    qc.invalidateQueries({ queryKey: ["vdp-program-settings-admin"] });
    qc.invalidateQueries({ queryKey: ["vdp-hall-public"] });
    qc.invalidateQueries({ queryKey: ["vdp-hall-admin"] });
    qc.invalidateQueries({ queryKey: ["vdp-reports-admin"] });
  };
  const saveSettings = async () => {
    setBusy(true);
    const { error } = await supabase
      .from("vdp_program_settings")
      .upsert(
        { id: "default", data: settings, updated_at: new Date().toISOString() },
        { onConflict: "id" },
      );
    setBusy(false);
    if (error) return toast.error(error.message);
    refresh();
    toast.success("VDP policy published");
  };
  const saveEntry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !draftEntry?.name.trim() ||
      !draftEntry.handle.trim() ||
      !draftEntry.note.trim()
    )
      return toast.error("Name, handle, and recognition note are required");
    setBusy(true);
    const payload = {
      name: draftEntry.name.trim(),
      handle: draftEntry.handle.trim(),
      category: draftEntry.category.trim(),
      severity: draftEntry.severity,
      recognition_date: draftEntry.date.trim(),
      reference_id: draftEntry.refId.trim() || null,
      profile_url: draftEntry.profileUrl.trim() || null,
      note: draftEntry.note.trim(),
      featured: draftEntry.featured,
      published: draftEntry.published,
      updated_at: new Date().toISOString(),
    };
    const request = draftEntry.id.startsWith("default-")
      ? supabase.from("vdp_hall_of_fame").insert(payload)
      : supabase
          .from("vdp_hall_of_fame")
          .update(payload)
          .eq("id", draftEntry.id);
    const { error } = await request;
    setBusy(false);
    if (error) return toast.error(error.message);
    setDraftEntry(null);
    refresh();
    toast.success("Hall of Fame entry saved");
  };
  const updateReport = async (id: string, status: string, severity: string) => {
    const { error } = await supabase
      .from("vdp_reports")
      .update({ status, severity, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      refresh();
      toast.success("Triage status updated");
    }
  };
  const field =
    "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary";
  const addEntry = () =>
    setDraftEntry({
      id: `default-${crypto.randomUUID()}`,
      name: "",
      handle: "",
      category: "IDOR / Broken Access Control",
      severity: "High",
      date: new Date().toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      refId: "",
      profileUrl: "",
      note: "",
      featured: false,
      published: true,
      certificateId: crypto.randomUUID(),
    });

  return (
    <section className="rounded-3xl border border-primary/40 bg-card p-6 shadow-lg shadow-black/10">
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow">Security operations · trust</p>
          <h2 className="mt-2 flex items-center gap-2 text-2xl font-light">
            <ShieldAlert className="h-5 w-5 text-primary" /> VDP &{" "}
            <i className="font-serif text-gold">Hall of Fame</i>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Triage security reports, publish researcher acknowledgements,
            configure your disclosure policy, and issue verifiable PDF
            certificates.
          </p>
        </div>
        <a
          href="/vulnerability-disclosure"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-primary px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Open public VDP
        </a>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["reports", "Vulnerability reports"],
            ["hall", "Hall of Fame"],
            ["policy", "Policy & security.txt"],
          ] as const
        ).map(([name, label]) => (
          <button
            key={name}
            type="button"
            onClick={() => setTab(name)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.11em] ${tab === name ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-primary"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "reports" && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="bg-background text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Researcher & target</th>
                  <th className="p-4">Proof of concept</th>
                  <th className="p-4">Triage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {reports.map((report) => (
                  <ReportRow
                    key={report.id}
                    report={report}
                    onSave={updateReport}
                  />
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="p-8 text-center text-muted-foreground"
                    >
                      No VDP reports yet. New public reports will appear here
                      when submitted.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {tab === "hall" && (
        <div className="mt-6">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={addEntry}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Add researcher
            </button>
          </div>
          {draftEntry && (
            <form
              onSubmit={saveEntry}
              className="mb-6 grid gap-4 rounded-2xl border border-primary/50 bg-background p-5 md:grid-cols-2"
            >
              <h3 className="md:col-span-2 text-xl font-light">
                {draftEntry.id.startsWith("default-") ? "Add" : "Edit"} Guardian
                entry
              </h3>
              <VdpInput
                label="Researcher name"
                value={draftEntry.name}
                onChange={(name) => setDraftEntry({ ...draftEntry, name })}
              />
              <VdpInput
                label="Handle / alias"
                value={draftEntry.handle}
                onChange={(handle) => setDraftEntry({ ...draftEntry, handle })}
              />
              <VdpInput
                label="Vulnerability / category"
                value={draftEntry.category}
                onChange={(category) =>
                  setDraftEntry({ ...draftEntry, category })
                }
              />
              <label className="text-sm">
                Severity
                <select
                  value={draftEntry.severity}
                  onChange={(event) =>
                    setDraftEntry({
                      ...draftEntry,
                      severity: event.target.value as VdpHallEntry["severity"],
                    })
                  }
                  className={`${field} mt-1`}
                >
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
              <VdpInput
                label="Recognition date"
                value={draftEntry.date}
                onChange={(date) => setDraftEntry({ ...draftEntry, date })}
              />
              <VdpInput
                label="Linked VDP reference"
                value={draftEntry.refId}
                onChange={(refId) => setDraftEntry({ ...draftEntry, refId })}
              />
              <VdpInput
                label="External profile URL"
                value={draftEntry.profileUrl}
                onChange={(profileUrl) =>
                  setDraftEntry({ ...draftEntry, profileUrl })
                }
              />
              <div className="md:col-span-2">
                <label className="text-sm">
                  Public recognition note
                  <textarea
                    value={draftEntry.note}
                    onChange={(event) =>
                      setDraftEntry({ ...draftEntry, note: event.target.value })
                    }
                    className={`${field} mt-1 min-h-24`}
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-5 text-sm md:col-span-2">
                <label>
                  <input
                    checked={draftEntry.featured}
                    onChange={(event) =>
                      setDraftEntry({
                        ...draftEntry,
                        featured: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />{" "}
                  Featured Guardian
                </label>
                <label>
                  <input
                    checked={draftEntry.published}
                    onChange={(event) =>
                      setDraftEntry({
                        ...draftEntry,
                        published: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />{" "}
                  Published on public site
                </label>
              </div>
              <div className="flex gap-3 md:col-span-2">
                <button
                  disabled={busy}
                  className="rounded-full bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
                >
                  {busy ? "Saving…" : "Save entry"}
                </button>
                <button
                  type="button"
                  onClick={() => setDraftEntry(null)}
                  className="rounded-full border border-border px-5 py-2.5 text-xs text-muted-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {entries.map((entry) => (
              <article
                key={entry.id}
                className={`rounded-2xl border p-5 ${entry.published ? "border-border bg-background" : "border-dashed border-primary/30 bg-background/50 opacity-75"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-serif text-2xl">{entry.name}</p>
                    <p className="font-mono text-xs text-primary">
                      {entry.handle}
                    </p>
                  </div>
                  <span className="rounded-full border border-primary/40 px-2 py-1 text-[10px] uppercase text-primary">
                    {entry.severity}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {entry.category} · {entry.date}
                </p>
                <p className="mt-4 line-clamp-3 font-serif text-sm italic">
                  “{entry.note}”
                </p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setDraftEntry(entry)}
                    className="rounded-full border border-primary/50 px-3 py-1.5 text-xs text-primary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadSecurityCertificate(entry)}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/50 px-3 py-1.5 text-xs text-primary"
                  >
                    <Download className="h-3.5 w-3.5" /> Certificate
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setCertificatePreview({
                          name: entry.name,
                          url: await previewSecurityCertificate(entry),
                        });
                      } catch (error) {
                        toast.error((error as Error).message);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/50 px-3 py-1.5 text-xs text-primary"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Preview PDF
                  </button>
                  {!entry.id.startsWith("default-") && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (
                          !window.confirm(
                            `Remove ${entry.name} from the Hall of Fame?`,
                          )
                        )
                          return;
                        const { error } = await supabase
                          .from("vdp_hall_of_fame")
                          .delete()
                          .eq("id", entry.id);
                        if (error) toast.error(error.message);
                        else {
                          refresh();
                          toast.success("Hall of Fame entry removed");
                        }
                      }}
                      className="rounded-full border border-destructive px-3 py-1.5 text-xs text-destructive"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
      {tab === "policy" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4 rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Intake controls</p>
                <h3 className="mt-1 text-xl font-light">
                  Program policy & encryption
                </h3>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  checked={settings.programActive}
                  onChange={(event) =>
                    setSettings({
                      ...settings,
                      programActive: event.target.checked,
                    })
                  }
                />
                {settings.programActive ? "Active" : "Paused"}
              </label>
            </div>
            <VdpInput
              label="Security contact email"
              value={settings.securityEmail}
              onChange={(securityEmail) =>
                setSettings({ ...settings, securityEmail })
              }
            />
            <VdpInput
              label="RFC 9116 expiry date"
              value={settings.expiryDate}
              onChange={(expiryDate) =>
                setSettings({ ...settings, expiryDate })
              }
            />
            <VdpInput
              label="PGP key fingerprint"
              value={settings.pgpFingerprint}
              onChange={(pgpFingerprint) =>
                setSettings({ ...settings, pgpFingerprint })
              }
            />
            <VdpListEditor
              label="In-scope domains & endpoints"
              value={settings.inScopeAssets}
              onChange={(inScopeAssets) =>
                setSettings({ ...settings, inScopeAssets })
              }
            />
            <VdpListEditor
              label="Out-of-scope exclusions"
              value={settings.outOfScopeRules}
              onChange={(outOfScopeRules) =>
                setSettings({ ...settings, outOfScopeRules })
              }
            />
            <button
              type="button"
              disabled={busy}
              onClick={saveSettings}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
            >
              <Save className="h-4 w-4" />{" "}
              {busy ? "Publishing…" : "Save & publish policy"}
            </button>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="eyebrow">RFC 9116 generator</p>
            <h3 className="mt-1 text-xl font-light">
              /.well-known/security.txt
            </h3>
            <pre className="mt-5 whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">{`Contact: mailto:${settings.securityEmail}\nExpires: ${settings.expiryDate}T00:00:00.000Z\nEncryption: https://srstudio.in/.well-known/pgp-key.asc\n# Fingerprint: ${settings.pgpFingerprint}\nAcknowledgments: https://srstudio.in/vulnerability-disclosure#hall-of-fame\nPreferred-Languages: en, hi\nCanonical: https://srstudio.in/.well-known/security.txt\nPolicy: https://srstudio.in/vulnerability-disclosure#scope`}</pre>
          </div>
        </div>
      )}
      {certificatePreview && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Certificate preview"
        >
          <div className="flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-primary/40 bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-medium">
                Certificate preview · {certificatePreview.name}
              </p>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(certificatePreview.url);
                  setCertificatePreview(null);
                }}
                className="rounded-full border border-border px-3 py-1.5 text-xs"
              >
                Close
              </button>
            </div>
            <iframe
              title="Security recognition certificate"
              src={certificatePreview.url}
              className="min-h-0 flex-1 bg-white"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function VdpInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
function VdpListEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const [next, setNext] = useState("");
  return (
    <div>
      <p className="text-sm">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {value.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-3 py-1 text-xs text-primary"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={next}
          onChange={(event) => setNext(event.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          placeholder="Add item"
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = next.trim();
            if (trimmed) {
              onChange([...value, trimmed]);
              setNext("");
            }
          }}
          className="rounded-xl border border-primary/50 px-3 text-sm text-primary"
        >
          Add
        </button>
      </div>
    </div>
  );
}
function ReportRow({
  report,
  onSave,
}: {
  report: Database["public"]["Tables"]["vdp_reports"]["Row"];
  onSave: (id: string, status: string, severity: string) => void;
}) {
  const [status, setStatus] = useState(report.status);
  const [severity, setSeverity] = useState(report.severity);
  return (
    <tr className="align-top">
      <td className="p-4 font-mono text-xs text-primary">
        {report.reference_id}
        <p className="mt-2 font-sans text-xs text-muted-foreground">
          {new Date(report.created_at).toLocaleString()}
        </p>
      </td>
      <td className="p-4">
        <p>{report.researcher_name}</p>
        <a
          className="text-xs text-primary"
          href={`mailto:${report.researcher_email}`}
        >
          {report.researcher_email}
        </a>
        <p className="mt-2 max-w-sm break-all font-mono text-xs text-muted-foreground">
          {report.affected_asset}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{report.category}</p>
      </td>
      <td className="max-w-xs whitespace-pre-wrap p-4 font-mono text-xs text-muted-foreground">
        {report.proof_of_concept}
      </td>
      <td className="p-4">
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="mb-2 w-full rounded-lg border border-input bg-background p-2 text-xs"
        >
          <option>New</option>
          <option>Triaging</option>
          <option>Accepted</option>
          <option>Fixed</option>
          <option>Duplicate</option>
          <option>Informative</option>
        </select>
        <select
          value={severity}
          onChange={(event) => setSeverity(event.target.value)}
          className="mb-2 w-full rounded-lg border border-input bg-background p-2 text-xs"
        >
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <button
          type="button"
          onClick={() => onSave(report.id, status, severity)}
          className="rounded-full border border-primary/50 px-3 py-1.5 text-xs text-primary"
        >
          Save
        </button>
      </td>
    </tr>
  );
}

export function AccountSettings() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const updatePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters for your password");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPassword("");
    setConfirm("");
    toast.success("Password updated");
  };

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10">
      <div className="flex items-center gap-3">
        <LockKeyhole className="h-5 w-5 text-primary" />
        <div>
          <p className="eyebrow">Account security</p>
          <h2 className="mt-1 text-2xl font-light">Change password</h2>
        </div>
      </div>
      <form
        onSubmit={updatePassword}
        className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]"
      >
        <input
          type="password"
          value={password}
          minLength={8}
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="New password (8+ characters)"
          className="w-full rounded-full border border-input bg-background px-5 py-3 text-sm outline-none transition-colors focus:border-primary"
        />
        <input
          type="password"
          value={confirm}
          minLength={8}
          autoComplete="new-password"
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-full border border-input bg-background px-5 py-3 text-sm outline-none transition-colors focus:border-primary"
        />
        <button
          disabled={busy}
          className="rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Updating…" : "Update password"}
        </button>
      </form>
    </section>
  );
}

function Stat({
  icon: I,
  label,
  value,
  change,
  tone,
}: {
  icon: typeof Eye;
  label: string;
  value: number | string;
  change: string;
  tone: "gold" | "amber" | "orange";
}) {
  const glow = {
    gold: "from-[#f5d77d]/25 via-[#c8913f]/10",
    amber: "from-[#f2bd5b]/24 via-[#b86f32]/10",
    orange: "from-[#ed9b52]/22 via-[#a8552d]/10",
  }[tone];

  return (
    <div className="relative isolate overflow-hidden rounded-xl border border-[#d8b76c]/40 bg-[#171613] p-5 shadow-[0_10px_24px_-20px_rgba(232,185,87,0.55)]">
      <div
        className={`pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_8%,var(--tw-gradient-stops),transparent_58%)] ${glow}`}
      />
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-[#f0c76d]/25 bg-[#d6aa55]/15 text-[#f3c968] shadow-[0_0_18px_rgba(239,190,85,0.22)]">
          <I className="h-4 w-4" />
        </span>
        <p className="eyebrow text-[#f4e6c7]">{label}</p>
      </div>
      <div className="mt-6 flex items-end gap-2">
        <p className="text-3xl font-light leading-none text-[#ffe1a1] [text-shadow:0_0_10px_rgba(238,182,78,0.28)]">
          {value}
        </p>
        <span className="pb-1 text-xs text-[#d8ad68]">{change}</span>
      </div>
    </div>
  );
}

export function Analytics() {
  const { data } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 864e5).toISOString();
      const { data } = await supabase
        .from("page_views")
        .select("created_at, language, referrer")
        .gte("created_at", since)
        .limit(10000);
      const { count: inq } = await supabase
        .from("inquiries")
        .select("*", { count: "exact", head: true });
      const { count: imgs } = await supabase
        .from("gallery_images")
        .select("*", { count: "exact", head: true });
      return { views: data ?? [], inq: inq ?? 0, imgs: imgs ?? 0 };
    },
  });
  const views = data?.views ?? [];
  const today = new Date().toDateString();
  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(Date.now() - (13 - i) * 864e5);
    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      n: views.filter(
        (v) => new Date(v.created_at).toDateString() === d.toDateString(),
      ).length,
    };
  });
  const max = Math.max(1, ...days.map((d) => d.n));
  const recentViews = views.filter(
    (v) => new Date(v.created_at).getTime() >= Date.now() - 14 * 864e5,
  ).length;
  const previousViews = views.filter((v) => {
    const time = new Date(v.created_at).getTime();
    return time >= Date.now() - 28 * 864e5 && time < Date.now() - 14 * 864e5;
  }).length;
  const change = (current: number, previous: number) => {
    if (!previous) return current ? "New" : "—";
    const percent = Math.round(((current - previous) / previous) * 100);
    return `${percent >= 0 ? "+" : ""}${percent}%`;
  };
  const langs = Object.entries(
    views.reduce<Record<string, number>>((a, v) => {
      const k = v.language || "unknown";
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const languageFlag = (language: string) => {
    if (language.toLowerCase().includes("in")) return "🇮🇳";
    if (language.toLowerCase().includes("gb")) return "🇬🇧";
    if (language.toLowerCase().includes("us")) return "🇺🇸";
    return "🌐";
  };

  return (
    <section className="max-w-6xl">
      <h2 className="mb-5 text-2xl font-medium tracking-tight text-[#f5d696]">
        Analytics{" "}
        <span className="text-base text-muted-foreground">(last 30 days)</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          icon={Eye}
          label="Page views"
          value={views.length}
          change={change(recentViews, previousViews)}
          tone="gold"
        />
        <Stat
          icon={Users}
          label="Views today"
          value={
            views.filter((v) => new Date(v.created_at).toDateString() === today)
              .length
          }
          change={change(
            views.filter((v) => new Date(v.created_at).toDateString() === today)
              .length,
            views.filter(
              (v) =>
                new Date(v.created_at).toDateString() ===
                new Date(Date.now() - 864e5).toDateString(),
            ).length,
          )}
          tone="gold"
        />
        <Stat
          icon={Mail}
          label="Inquiries"
          value={data?.inq ?? 0}
          change="Total"
          tone="amber"
        />
        <Stat
          icon={ImageIcon}
          label="Uploaded photos"
          value={data?.imgs ?? 0}
          change="Total"
          tone="orange"
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-[#d8b76c]/35 bg-[#171613] p-5 shadow-[0_10px_24px_-20px_rgba(232,185,87,0.5)] lg:col-span-2">
          <p className="eyebrow mb-4 text-[#f4d58d]">Daily views (14 days)</p>
          <div className="grid h-40 grid-cols-14 grid-rows-4 overflow-hidden rounded-sm border border-white/15 bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:calc(100%/14)_25%] px-2 pt-2">
            {days.map((d) => (
              <div
                key={d.label}
                className="col-span-1 row-span-4 flex min-w-0 flex-col items-center justify-end gap-1"
              >
                <span className="text-[10px] leading-none text-[#f6e0ac]">
                  {d.n || ""}
                </span>
                <div
                  className="w-[62%] min-w-[5px] rounded-t-md border border-[#ffdf86]/35 bg-gradient-to-b from-[#ffda71] via-[#d69b40] to-[#8d4e23] shadow-[0_0_14px_rgba(244,187,73,0.55)]"
                  style={{
                    height: d.n ? `${Math.max((d.n / max) * 92, 9)}%` : 2,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-14 px-2 text-center text-[10px] text-muted-foreground">
            {days.map((d) => (
              <span key={d.label}>{d.label}</span>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border border-[#d8b76c]/35 bg-[#171613] p-5 shadow-[0_10px_24px_-20px_rgba(232,185,87,0.5)]">
          <p className="eyebrow mb-4 text-[#f4d58d]">Visitor languages</p>
          <ul className="space-y-3 text-sm">
            {langs.length === 0 && (
              <li className="text-muted-foreground">No data yet</li>
            )}
            {langs.map(([l, n]) => (
              <li
                key={l}
                className="grid grid-cols-[auto_1fr_auto] items-center gap-2"
              >
                <span aria-hidden="true">{languageFlag(l)}</span>
                <span className="flex items-center gap-2">
                  <span className="w-10 text-[#eee4d4]">{l}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#3b3932]">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-[#c99855] to-[#ffe381]"
                      style={{
                        width: `${Math.max(7, (n / Math.max(1, langs[0]?.[1] ?? 1)) * 100)}%`,
                      }}
                    />
                  </span>
                </span>
                <span className="text-[#f0c66b]">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function GalleryManager() {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fullPreview, setFullPreview] = useState(false);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState<string>(CATS[0]!);
  const [tall, setTall] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState<string>(CATS[0]!);
  const [editTall, setEditTall] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFullPreview(true);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const { data: images } = useQuery({
    queryKey: ["gallery-images"],
    queryFn: async () =>
      (
        await supabase
          .from("gallery_images")
          .select("*")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast.error("Choose a photo and enter a title");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a JPG, PNG, or WebP image");
      return;
    }
    if (file.size > MAX_GALLERY_FILE_SIZE) {
      toast.error("Each gallery photo must be 10 MB or smaller");
      return;
    }
    setBusy(true);
    try {
      const path = `${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
      const up = await withUploadTimeout(
        supabase.storage
          .from("gallery")
          .upload(path, file, { contentType: file.type }),
      );
      if (up.error) throw up.error;
      const { data: publicUrl } = supabase.storage
        .from("gallery")
        .getPublicUrl(path);
      const ins = await supabase.from("gallery_images").insert({
        title: title.trim().slice(0, 100),
        category: cat,
        image_url: publicUrl.publicUrl,
        storage_path: path,
        tall,
      });
      if (ins.error) throw ins.error;
      toast.success("Photo added to gallery");
      setFile(null);
      setTitle("");
      setTall(false);
      (e.target as HTMLFormElement).reset();
      qc.invalidateQueries({ queryKey: ["gallery-images"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (image: GalleryImage) => {
    if (!window.confirm(`Delete “${image.title}”? This cannot be undone.`))
      return;
    setBusy(true);
    try {
      if (image.storage_path) {
        const { error } = await supabase.storage
          .from("gallery")
          .remove([image.storage_path]);
        if (error) throw error;
      }
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .eq("id", image.id);
      if (error) throw error;
      if (selected?.id === image.id) setSelected(null);
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(image.id);
        return next;
      });
      if (editing?.id === image.id) setEditing(null);
      toast.success("Photo deleted");
      qc.invalidateQueries({ queryKey: ["gallery-images"] });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const toggleImage = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSelected = async () => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (
      !window.confirm(
        `Delete ${ids.length} selected ${ids.length === 1 ? "photo" : "photos"}? This cannot be undone.`,
      )
    )
      return;
    const selectedImages = (images ?? []).filter((image) =>
      ids.includes(image.id),
    );
    setBusy(true);
    try {
      const paths = selectedImages.flatMap((image) =>
        image.storage_path ? [image.storage_path] : [],
      );
      if (paths.length) {
        const { error } = await supabase.storage.from("gallery").remove(paths);
        if (error) throw error;
      }
      const { error } = await supabase
        .from("gallery_images")
        .delete()
        .in("id", ids);
      if (error) throw error;
      setSelectedIds(new Set());
      setSelected(null);
      setEditing(null);
      toast.success(
        `${ids.length} ${ids.length === 1 ? "photo" : "photos"} deleted`,
      );
      qc.invalidateQueries({ queryKey: ["gallery-images"] });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (image: GalleryImage) => {
    setSelected(image);
    setEditing(image);
    setEditTitle(image.title);
    setEditCategory(image.category);
    setEditTall(image.tall);
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing || !editTitle.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase
        .from("gallery_images")
        .update({
          title: editTitle.trim().slice(0, 100),
          category: editCategory,
          tall: editTall,
        })
        .eq("id", editing.id);
      if (error) throw error;
      toast.success("Photo details updated");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["gallery-images"] });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-full border border-input bg-background px-5 py-3 text-sm transition-colors focus:border-primary focus:outline-none";
  return (
    <section>
      <h2 className="mb-6 text-2xl font-light">Gallery</h2>
      <form
        onSubmit={upload}
        className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-lg shadow-black/10 md:grid-cols-5"
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className={`${input} md:col-span-2`}
        />
        <input
          placeholder="Title"
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          className={input}
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className={input}
        >
          {CATS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-xs font-semibold uppercase tracking-widest text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          <Upload className="h-4 w-4" /> {busy ? "Uploading…" : "Upload"}
        </button>
        <label className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-5">
          <input
            type="checkbox"
            checked={tall}
            onChange={(e) => setTall(e.target.checked)}
          />{" "}
          Portrait (tall) layout
        </label>
        {preview && (
          <div className="relative overflow-hidden rounded-2xl border border-primary/50 bg-background md:col-span-5">
            <img
              src={preview}
              alt="Selected upload preview"
              className="max-h-[72vh] min-h-64 w-full cursor-zoom-in object-contain"
              onClick={() => setFullPreview(true)}
            />
            <div className="absolute bottom-0 inset-x-0 flex items-center justify-between gap-3 bg-overlay/85 px-4 py-3 text-xs text-foreground">
              <span>Preview: {file?.name}</span>
              <button
                type="button"
                onClick={() => setFullPreview(true)}
                className="rounded-full border border-primary px-3 py-1 font-semibold uppercase tracking-wider text-primary"
              >
                Full-page preview
              </button>
            </div>
          </div>
        )}
      </form>
      {fullPreview && preview && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Full image preview"
          onClick={() => setFullPreview(false)}
        >
          <button
            type="button"
            onClick={() => setFullPreview(false)}
            aria-label="Close full image preview"
            className="absolute right-5 top-5 rounded-full border border-primary/70 bg-background/90 p-3 text-primary"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={preview}
            alt={`Full preview of ${file?.name ?? "selected upload"}`}
            className="max-h-full max-w-full rounded-lg object-contain shadow-[0_0_80px_rgba(228,180,79,0.18)]"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
      {selected && (
        <div className="mt-6 grid gap-5 rounded-3xl border border-primary/50 bg-card p-5 sm:grid-cols-[10rem_1fr]">
          <img
            src={selected.image_url}
            alt={selected.title}
            className="aspect-square h-full w-full rounded-2xl object-cover"
          />
          <div className="flex flex-col justify-between gap-4">
            <div>
              <p className="eyebrow">Selected photo</p>
              <h3 className="mt-2 text-xl font-light">{selected.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {selected.category} · {selected.tall ? "Portrait" : "Landscape"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => startEdit(selected)}
                className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(selected)}
                className="inline-flex items-center gap-2 rounded-full border border-destructive px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" /> Close
              </button>
            </div>
          </div>
        </div>
      )}
      {editing && (
        <form
          onSubmit={saveEdit}
          className="mt-6 grid gap-4 rounded-3xl border border-primary/50 bg-card p-6 md:grid-cols-3"
        >
          <div className="md:col-span-3 flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow">Edit gallery photo</p>
              <h3 className="mt-1 text-xl font-light">{editing.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close editor"
              className="rounded-full border border-border p-2 text-muted-foreground hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <input
            value={editTitle}
            maxLength={100}
            onChange={(event) => setEditTitle(event.target.value)}
            className={input}
            aria-label="Photo title"
          />
          <select
            value={editCategory}
            onChange={(event) => setEditCategory(event.target.value)}
            className={input}
            aria-label="Photo category"
          >
            {CATS.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={editTall}
                onChange={(event) => setEditTall(event.target.checked)}
              />{" "}
              Portrait layout
            </label>
            <button
              disabled={busy}
              className="rounded-full bg-gold px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
      {!!images?.length && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg shadow-black/10">
          <button
            type="button"
            onClick={() =>
              setSelectedIds(new Set(images.map((image) => image.id)))
            }
            className="rounded-full border border-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary"
          >
            Select all
          </button>
          <button
            type="button"
            disabled={!selectedIds.size}
            onClick={() => setSelectedIds(new Set())}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground disabled:opacity-40"
          >
            Deselect all
          </button>
          <span className="rounded-full border border-border px-3 py-2 font-mono text-xs text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <button
            type="button"
            disabled={!selectedIds.size || busy}
            onClick={deleteSelected}
            className="ml-auto rounded-full border border-destructive px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-destructive disabled:opacity-40"
          >
            Delete selected ({selectedIds.size})
          </button>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        {images?.map((img) => (
          <div
            key={img.id}
            className={`group relative overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/10 ${selected?.id === img.id || selectedIds.has(img.id) ? "border-primary" : "border-border"}`}
          >
            <label className="absolute left-3 top-3 z-10 grid h-7 w-7 cursor-pointer place-items-center rounded-md border border-white/60 bg-background/75 text-primary shadow-lg">
              <input
                type="checkbox"
                checked={selectedIds.has(img.id)}
                onChange={() => toggleImage(img.id)}
                className="h-4 w-4 accent-[color:var(--primary)]"
                aria-label={`Select ${img.title} for deletion`}
              />
            </label>
            <button
              type="button"
              onClick={() => setSelected(img)}
              aria-label={`Select ${img.title}`}
              className="block w-full text-left"
            >
              <img
                src={img.image_url}
                alt={img.title}
                className="aspect-square w-full object-cover"
              />
            </button>
            <div className="p-3">
              <p className="text-sm">{img.title}</p>
              <p className="text-xs text-muted-foreground">{img.category}</p>
            </div>
            <div className="absolute right-2 top-2 flex gap-2">
              <button
                onClick={() => startEdit(img)}
                aria-label="Edit photo"
                className="rounded-full bg-background/90 p-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(img)}
                aria-label="Delete photo"
                className="rounded-full bg-background/90 p-2 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {images?.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            No uploaded photos yet. The site shows the default gallery.
          </p>
        )}
      </div>
    </section>
  );
}

export function Inquiries() {
  const { data } = useQuery({
    queryKey: ["inquiries"],
    queryFn: async () =>
      (
        await supabase
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)
      ).data ?? [],
  });
  return (
    <section>
      <h2 className="mb-6 text-2xl font-light">Recent inquiries</h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/10">
        {data?.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No inquiries yet.</p>
        )}
        {data?.map((q) => (
          <div key={q.id} className="p-5 text-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-medium">
                {q.name} ·{" "}
                <a className="text-primary" href={`mailto:${q.email}`}>
                  {q.email}
                </a>
                {q.phone && (
                  <>
                    {" · "}
                    <a className="text-primary" href={`tel:${q.phone}`}>
                      {q.phone}
                    </a>
                  </>
                )}
              </span>
              <span className="text-muted-foreground">
                {q.wedding_date} · {q.location} · {q.services.join(", ")}
              </span>
            </div>
            {q.message && (
              <p className="mt-2 text-muted-foreground">{q.message}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function AdminLogs() {
  const { data: views = [], isLoading } = useQuery({
    queryKey: ["admin-activity-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("created_at, path, referrer, language")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <section>
      <div className="mb-6">
        <p className="eyebrow">Observability</p>
        <h2 className="mt-1 text-2xl font-light">Recent visitor activity</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Latest public page-view events recorded by the website. Authentication
          and security-report events are managed in their respective sections.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="bg-background text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Page</th>
                <th className="p-4">Language</th>
                <th className="p-4">Referrer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {views.map((view, index) => (
                <tr key={`${view.created_at}-${index}`}>
                  <td className="p-4 text-muted-foreground">
                    {new Date(view.created_at).toLocaleString()}
                  </td>
                  <td className="p-4 font-mono text-xs text-primary">
                    {view.path}
                  </td>
                  <td className="p-4">{view.language || "Unknown"}</td>
                  <td className="max-w-xs truncate p-4 text-muted-foreground">
                    {view.referrer || "Direct"}
                  </td>
                </tr>
              ))}
              {!isLoading && views.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No activity has been recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
