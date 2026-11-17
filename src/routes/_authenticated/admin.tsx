import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Trash2,
  Upload,
  LogOut,
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AppInstallPrompt } from "@/components/AppInstallPrompt";
import { SITE } from "@/lib/site-config";
import { DEFAULT_SITE_SETTINGS, siteSettingsFrom } from "@/lib/site-settings";

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
            "The upload timed out. Check that the Supabase gallery bucket and storage policies are configured.",
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
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="font-semibold tracking-[0.25em]">
            {SITE.name.toUpperCase()}{" "}
            <span className="text-primary">ADMIN</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{user.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-2 rounded-full border border-primary/70 px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-12 px-6 py-10">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : !isAdmin ? (
          <p className="text-muted-foreground">
            Your account doesn't have admin access.
          </p>
        ) : (
          <>
            <InquiryAlerts />
            <MobileAdminTools />
            <SiteEditor />
            <Analytics />
            <GalleryManager />
            <Inquiries />
            <AccountSettings />
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
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Install this admin panel as an app to upload, edit, delete, and
            manage gallery work from your phone.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AppInstallPrompt />
          <button
            type="button"
            onClick={enableNotifications}
            disabled={permission === "granted" || permission === "unsupported"}
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
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Alerts appear while this installed app or admin page is open. Apply
        migration <code>0002_enable_inquiry_realtime.sql</code> in Supabase to
        activate real-time inquiry events.
      </p>
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

function SiteEditor() {
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
  const [draft, setDraft] = useState(() =>
    JSON.stringify(DEFAULT_SITE_SETTINGS, null, 2),
  );
  const [lastLoaded, setLastLoaded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const next = JSON.stringify(siteSettingsFrom(data), null, 2);
    if (next !== lastLoaded) {
      setDraft(next);
      setLastLoaded(next);
    }
  }, [data, isLoading, lastLoaded]);

  let preview = DEFAULT_SITE_SETTINGS;
  let parseError = "";
  try {
    preview = siteSettingsFrom(JSON.parse(draft));
  } catch {
    parseError =
      "The blueprint must be valid JSON before it can be previewed or published.";
  }

  const save = async () => {
    if (parseError) {
      toast.error(parseError);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .upsert(
        {
          id: "default",
          data: JSON.parse(draft),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setLastLoaded(draft);
    qc.invalidateQueries({ queryKey: ["site-settings"] });
    qc.invalidateQueries({ queryKey: ["public-site-settings"] });
    toast.success("Website changes published");
  };

  return (
    <section className="rounded-3xl border border-primary/40 bg-card p-6 shadow-lg shadow-black/10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="eyebrow">Reusable website editor</p>
          <h2 className="mt-1 text-2xl font-light">Client site blueprint</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Edit all client-facing copy, business details, services,
            testimonials, artist profile, calls to action, and social links in
            one profile.
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
        <div>
          <label className="mb-2 block text-sm">Website blueprint (JSON)</label>
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
            className="h-[34rem] w-full rounded-2xl border border-input bg-background p-4 font-mono text-xs leading-5 outline-none focus:border-primary"
            aria-label="Website blueprint JSON"
          />
          {parseError && (
            <p className="mt-2 text-sm text-destructive">{parseError}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving || Boolean(parseError)}
              className="rounded-full bg-gold px-6 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Publishing…" : "Publish website changes"}
            </button>
            <button
              type="button"
              onClick={() =>
                setDraft(JSON.stringify(DEFAULT_SITE_SETTINGS, null, 2))
              }
              className="rounded-full border border-border px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground hover:text-primary"
            >
              Restore template defaults
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="eyebrow">Live draft preview</p>
          <div className="mt-4 overflow-hidden rounded-xl border border-primary/40 bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3 text-xs">
              <span className="tracking-[0.2em]">
                {preview.brand.name.toUpperCase()}
              </span>
              <span className="text-primary">MENU</span>
            </div>
            <div className="bg-gradient-to-br from-card via-background to-secondary p-6">
              <p className="eyebrow">{preview.hero.eyebrow}</p>
              <h3 className="mt-4 text-3xl font-light leading-tight">
                {preview.hero.title}{" "}
                <i className="font-serif text-gold">{preview.hero.highlight}</i>
              </h3>
              <p className="mt-4 text-sm text-muted-foreground">
                {preview.hero.subtitle}
              </p>
              <button className="mt-5 rounded-full border border-primary px-4 py-2 text-xs text-primary">
                {preview.hero.primaryCta}
              </button>
            </div>
            <div className="border-t border-border p-4 text-xs text-muted-foreground">
              {preview.brand.email} · {preview.brand.phone}
              <br />
              {preview.brand.location}
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

function AccountSettings() {
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
}: {
  icon: typeof Eye;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10">
      <I className="h-5 w-5 text-primary" />
      <p className="mt-4 text-3xl font-light">{value}</p>
      <p className="eyebrow mt-1">{label}</p>
    </div>
  );
}

function Analytics() {
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
  const langs = Object.entries(
    views.reduce<Record<string, number>>((a, v) => {
      const k = v.language || "unknown";
      a[k] = (a[k] || 0) + 1;
      return a;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <section>
      <h2 className="mb-6 text-2xl font-light">
        Analytics{" "}
        <span className="text-sm text-muted-foreground">(last 30 days)</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Eye} label="Page views" value={views.length} />
        <Stat
          icon={Users}
          label="Views today"
          value={
            views.filter((v) => new Date(v.created_at).toDateString() === today)
              .length
          }
        />
        <Stat icon={Mail} label="Inquiries" value={data?.inq ?? 0} />
        <Stat
          icon={ImageIcon}
          label="Uploaded photos"
          value={data?.imgs ?? 0}
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10 lg:col-span-2">
          <p className="eyebrow mb-4">Daily views (14 days)</p>
          <div className="flex h-40 items-end gap-2">
            {days.map((d) => (
              <div
                key={d.label}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-[10px] text-muted-foreground">
                  {d.n || ""}
                </span>
                <div
                  className="w-full rounded-t-full bg-gold"
                  style={{ height: `${(d.n / max) * 100}%`, minHeight: 2 }}
                />
                <span className="text-[10px] text-muted-foreground">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/10">
          <p className="eyebrow mb-4">Visitor languages</p>
          <ul className="space-y-2 text-sm">
            {langs.length === 0 && (
              <li className="text-muted-foreground">No data yet</li>
            )}
            {langs.map(([l, n]) => (
              <li key={l} className="flex justify-between">
                <span>{l}</span>
                <span className="text-primary">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function GalleryManager() {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState<string>(CATS[0]!);
  const [tall, setTall] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);
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
      if (editing?.id === image.id) setEditing(null);
      toast.success("Photo deleted");
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
              className="h-52 w-full object-cover"
            />
            <p className="absolute bottom-0 inset-x-0 bg-overlay/80 px-4 py-2 text-xs text-foreground">
              Preview: {file?.name}
            </p>
          </div>
        )}
      </form>
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
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {images?.map((img) => (
          <div
            key={img.id}
            className={`group relative overflow-hidden rounded-2xl border bg-card shadow-lg shadow-black/10 ${selected?.id === img.id ? "border-primary" : "border-border"}`}
          >
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

function Inquiries() {
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
