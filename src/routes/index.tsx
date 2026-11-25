import { createFileRoute } from "@tanstack/react-router";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Camera,
  Film,
  Plane,
  Menu,
  X,
  Quote,
  Star,
  Instagram,
  Youtube,
  Facebook,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Aperture,
  Heart,
  Sparkles,
  Github,
  Globe,
  Linkedin,
  Link2,
} from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import candid from "@/assets/candid.jpg";
import candid2 from "@/assets/candid2.jpg";
import drone from "@/assets/drone.jpg";
import prewedding from "@/assets/prewedding.jpg";
import cinematic from "@/assets/cinematic.jpg";
import artist from "@/assets/artist.jpg";
import ceremony1 from "@/assets/ceremony-1.jpg";
import ceremony2 from "@/assets/ceremony-2.jpg";
import ceremony3 from "@/assets/ceremony-3.jpg";
import ceremony4 from "@/assets/ceremony-4.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdSlot } from "@/components/AdSlot";
import { DroneShowcase } from "@/components/DroneShowcase";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import ArtistSection from "@/components/ui/artist-section";
import { SITE, siteUrl } from "@/lib/site-config";
import {
  DEFAULT_SITE_SETTINGS,
  safeHyperlink,
  siteSettingsFrom,
  type SiteSettings,
} from "@/lib/site-settings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} | Cinematic Wedding Photography & Films` },
      {
        name: "description",
        content:
          "Luxury wedding photography, cinematic films and 4K drone videography. Capturing your forever, frame by frame.",
      },
      {
        property: "og:title",
        content: "SR Studio | Cinematic Wedding Photography & Films",
      },
      {
        property: "og:description",
        content:
          "Mumbai wedding photography, cinematic films and 4K drone videography for celebrations across India and destination weddings.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/") },
      { property: "og:image", content: siteUrl(heroImage) },
      {
        property: "og:image:alt",
        content: "A cinematic SR Studio wedding celebration",
      },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "SR Studio | Cinematic Wedding Photography & Films",
      },
      {
        name: "twitter:description",
        content:
          "Mumbai wedding photography, cinematic films and 4K drone videography.",
      },
      { name: "twitter:image", content: siteUrl(heroImage) },
      {
        name: "keywords",
        content:
          "wedding photography, wedding films, cinematic wedding videography, drone wedding video, pre-wedding shoot, candid wedding photographer, Mumbai, destination wedding",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PhotographyBusiness",
          name: SITE.name,
          description:
            "Mumbai wedding photography, cinematic films and 4K drone videography for celebrations across India and destination weddings.",
          url: siteUrl("/"),
          logo: siteUrl("/sr-studio-mark.svg"),
          image: siteUrl(heroImage),
          email: SITE.email,
          telephone: SITE.phone,
          priceRange: "₹₹",
          currenciesAccepted: "INR",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Mumbai",
            addressCountry: "IN",
          },
          areaServed: [
            { "@type": "City", name: "Mumbai" },
            { "@type": "Country", name: "India" },
          ],
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Wedding visual storytelling services",
            itemListElement: [
              "Wedding Photography",
              "Cinematic Videography",
              "Drone & Aerial Videography",
              "Pre-Wedding Photography",
            ].map((name) => ({
              "@type": "Offer",
              itemOffered: { "@type": "Service", name },
            })),
          },
        }),
      },
    ],
  }),
  component: Index,
});

const nav = [
  { href: "#portfolio", label: "Portfolio" },
  { href: "#services", label: "Services" },
  { href: "#about", label: "About" },
];

const categories = [
  "All",
  "Candid Moments",
  "Cinematic Films",
  "Drone & Aerials",
  "Pre-Wedding",
  "Gallery",
] as const;
const defaultGallery = [
  ["candid", candid, "Candid Moments", "Haldi Laughter", true],
  ["drone", drone, "Drone & Aerials", "Lakeside Vows", false],
  ["cinematic", cinematic, "Cinematic Films", "The Bridal Walk", false],
  ["prewedding", prewedding, "Pre-Wedding", "Above the Clouds", true],
  ["candid2", candid2, "Candid Moments", "Seven Promises", false],
  ["hero", heroImage, "Cinematic Films", "Palace of Gold", false],
  ["ceremony1", ceremony1, "Candid Moments", "Before the Vows", false],
  ["ceremony2", ceremony2, "Cinematic Films", "Held Close", false],
  ["ceremony3", ceremony3, "Candid Moments", "Sacred Promises", false],
  ["ceremony4", ceremony4, "Pre-Wedding", "Together, Always", false],
] as const;

const services = [
  {
    icon: Camera,
    title: "Wedding Photography",
    desc: "Full-day coverage from getting ready to the final farewell, with meticulous high-resolution editing.",
    points: ["Full-day coverage", "High-res edited gallery", "Heirloom album"],
  },
  {
    icon: Film,
    title: "Cinematic Videography",
    desc: "Films that feel like cinema: emotional, intimate and beautifully graded.",
    points: ["Highlight reels", "Full feature films", "Teaser trailers"],
  },
  {
    icon: Plane,
    title: "Drone & Aerial",
    desc: "Breathtaking 4K aerial perspectives of your venue, procession and celebrations.",
    points: ["4K aerial footage", "Venue overviews", "Licensed pilots"],
  },
];

const testimonials = [
  {
    name: "Ananya & Rohan",
    place: "Udaipur",
    text: "They were everywhere and nowhere at once. Our film made every single guest cry. It's the most precious thing we own.",
  },
  {
    name: "Priya & Karan",
    place: "Goa",
    text: "Punctual, calm and incredibly professional. The drone shots of our beach mandap still give us chills.",
  },
  {
    name: "Meera & Arjun",
    place: "Jaipur",
    text: "Delivered before the promised date and beyond anything we imagined. Every frame feels like art.",
  },
];

const SiteSettingsContext = createContext<SiteSettings>(DEFAULT_SITE_SETTINGS);
const useSiteSettings = () => useContext(SiteSettingsContext);

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(30, "Phone number is too long").optional(),
  date: z.string().min(1, "Please choose your wedding date"),
  location: z.string().trim().min(1, "Please enter a location").max(150),
  services: z.array(z.string()).min(1, "Select at least one service"),
  message: z.string().trim().max(1000).optional(),
});

function Index() {
  const { data: savedSettings } = useQuery({
    queryKey: ["public-site-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("data")
        .eq("id", "default")
        .maybeSingle();
      return data?.data;
    },
    retry: false,
  });
  const settings = siteSettingsFrom(savedSettings);
  useEffect(() => {
    const icon = document.querySelector(
      'link[rel="icon"]',
    ) as HTMLLinkElement | null;
    if (icon && settings.media.titleIcon) {
      icon.href = settings.media.titleIcon;
    }
  }, [settings.media.titleIcon]);
  useEffect(() => {
    if (sessionStorage.getItem("sr-viewed")) return;
    sessionStorage.setItem("sr-viewed", "1");
    supabase
      .from("page_views")
      .insert({
        path: window.location.pathname.slice(0, 200),
        referrer: document.referrer ? document.referrer.slice(0, 500) : null,
        language: (navigator.language || "").slice(0, 20) || null,
      })
      .then(() => {});
  }, []);
  return (
    <SiteSettingsContext.Provider value={settings}>
      <div
        className="site-theme bg-background text-foreground"
        style={
          {
            "--background": settings.theme.background,
            "--foreground": settings.theme.foreground,
            "--primary": settings.theme.primary,
            "--card": settings.theme.card,
            "--radius": `${settings.theme.radius}px`,
            "--sr-heading-scale": settings.theme.headingScale,
          } as CSSProperties
        }
      >
        <Header />
        <main>
          {settings.theme.sectionOrder.map((section) => {
            if (settings.theme.sectionVisibility[section] === false) return null;
            const sections: Record<string, ReactNode> = {
              hero: <Hero key="hero" />,
              portfolio: <Portfolio key="portfolio" />,
              drone: (
                <DroneShowcase
                  key="drone"
                  controllerImage={settings.media.controllerImage}
                  droneVideo={settings.media.droneVideo}
                />
              ),
              ad: <AdSlot key="ad" className="py-10" />,
              "artist-profile": <ArtistProfile key="artist-profile" />,
              services: <Services key="services" />,
              about: <About key="about" />,
              testimonials: <Testimonials key="testimonials" />,
              inquiry: <Inquiry key="inquiry" />,
            };
            return sections[section] ?? null;
          })}
        </main>
        <Footer />
      </div>
    </SiteSettingsContext.Provider>
  );
}

function Header() {
  const settings = useSiteSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled || open ? "border-b border-border bg-background/85 backdrop-blur-md" : "bg-transparent"}`}
    >
      <div className="mx-auto flex h-20 w-full items-center justify-between px-6 lg:px-12">
        <div id="google_translate_element" className="pointer-events-none fixed -left-[9999px] top-auto h-px w-px overflow-hidden opacity-0" aria-hidden="true" />
        <a href="#top" className="flex items-center gap-2">
          {settings.media.titleIcon ? (
            <img
              src={settings.media.titleIcon}
              alt=""
              className="h-6 w-6 object-contain"
            />
          ) : (
            <Aperture className="h-6 w-6 text-primary" strokeWidth={1.5} />
          )}
          <span className="text-lg font-semibold tracking-[0.25em]">
            {settings.brand.name.toUpperCase()}
          </span>
        </a>
        <nav className="hidden items-center gap-10 md:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-primary"
            >
              {n.label}
            </a>
          ))}
          <LanguageSwitcher />
          <a
            href="#inquire"
            className="rounded-full border border-primary bg-transparent px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Check Availability
          </a>
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <LanguageSwitcher />
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="flex flex-col gap-5 px-6 pb-8 md:hidden">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="font-serif text-2xl"
            >
              {n.label}
            </a>
          ))}
          <a
            href="#inquire"
            onClick={() => setOpen(false)}
            className="rounded-full border border-primary px-5 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-primary"
          >
            Check Availability
          </a>
        </nav>
      )}
    </header>
  );
}

function Hero() {
  const { hero, media } = useSiteSettings();
  return (
    <section
      id="top"
      className="relative flex min-h-[40rem] items-end overflow-hidden lg:min-h-[44rem]"
    >
      {/* Background Marriage Video Preview */}
      <video
        src={media.heroVideo}
        poster={media.heroPoster || heroImage}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
      />

      {/* Cinematic Dark Gradient Overlays for Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-overlay/60 to-overlay/40" />
      <div className="absolute inset-0 bg-radial-[ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.5)_100%]" />

      {/* Hero Content */}
      <div className="relative mx-auto w-full px-6 pb-16 pt-36 lg:px-12 lg:pb-20">
        <p className="eyebrow mb-6">{hero.eyebrow}</p>

        <h1 className="max-w-4xl text-4xl font-light leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          {hero.title}{" "}
          <span className="font-serif italic text-gold">{hero.highlight}</span>
        </h1>
        <p className="mt-6 max-w-xl font-serif text-xl italic text-foreground/80 md:text-2xl">
          {hero.subtitle}
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#portfolio"
            className="group inline-flex items-center gap-3 rounded-full border border-primary bg-transparent px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {hero.primaryCta}{" "}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>

          <a
            href="#inquire"
            className="inline-flex items-center rounded-full border border-primary px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary backdrop-blur-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {hero.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  italic,
}: {
  eyebrow: string;
  title: string;
  italic: string;
}) {
  return (
    <div className="mb-14 text-center">
      <p className="eyebrow mb-4">{eyebrow}</p>
      <h2 className="text-3xl font-light tracking-tight md:text-5xl">
        {title} <span className="font-serif italic text-gold">{italic}</span>
      </h2>
    </div>
  );
}

function Portfolio() {
  const [active, setActive] = useState<(typeof categories)[number]>("All");
  const { media } = useSiteSettings();
  const { data: uploaded = [] } = useQuery({
    queryKey: ["public-gallery"],
    queryFn: async () =>
      (
        await supabase
          .from("gallery_images")
          .select("title, category, image_url, tall")
          .order("created_at", { ascending: false })
      ).data ?? [],
  });
  const uploadedItems = uploaded.map((u) => ({
    src: u.image_url,
    cat: u.category,
    title: u.title,
    tall: u.tall,
  }));
  const gallery = defaultGallery.map(([key, src, cat, title, tall]) => ({
    src: media.gallery[key] || src,
    cat,
    title,
    tall,
  }));
  const all = [...uploadedItems, ...gallery];
  const items =
    active === "Gallery"
      ? uploadedItems
      : all.filter((g) => active === "All" || g.cat === active);
  return (
    <section
      id="portfolio"
      className="section-mask mx-auto max-w-[92rem] scroll-mt-20 px-3 py-16 sm:px-5 md:py-20"
    >
      <SectionHead
        eyebrow="Featured Work"
        title="Stories we've"
        italic="told"
      />
      <div className="mb-9 flex flex-wrap justify-center gap-3">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-colors ${active === c ? "border-primary bg-primary/15 text-primary" : "border-primary/70 text-primary hover:bg-primary hover:text-primary-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {items.map((g) => (
          <figure
            key={g.title}
            className="group relative mb-5 break-inside-avoid overflow-hidden rounded-2xl"
          >
            <img
              src={g.src}
              alt={g.title}
              loading="lazy"
              decoding="async"
              className={`w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110 ${g.tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
            />
            <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-overlay/90 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <span className="eyebrow">{g.cat}</span>
              <span className="mt-1 font-serif text-2xl italic">{g.title}</span>
            </figcaption>
          </figure>
        ))}
        {active === "Gallery" && items.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            New work added through the studio gallery will appear here.
          </p>
        )}
      </div>
    </section>
  );
}

function Services() {
  const settings = useSiteSettings();
  return (
    <section
      id="services"
      className="section-mask scroll-mt-20 bg-card py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead
          eyebrow="What We Offer"
          title="Crafted for your"
          italic="day"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {settings.services.map((s, index) => {
            const Icon = [Camera, Film, Plane][index] ?? Camera;
            return (
              <article
                key={s.title}
                className="group border border-border bg-background p-10 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:shadow-gold"
              >
                <Icon className="h-9 w-9 text-primary" strokeWidth={1.2} />
                <h3 className="mt-8 text-xl font-medium">{s.title}</h3>
                <p className="mt-3 font-serif text-lg leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <ul className="mt-8 space-y-3 border-t border-border pt-6">
                  {s.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-center gap-3 text-sm text-foreground/85"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-primary" /> {p}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function About() {
  const { media } = useSiteSettings();
  return (
    <ArtistSection
      imageUrl={media.artistNote || undefined}
      photographerImageUrl={media.artistPortrait || undefined}
    />
  );
}

function ArtistProfile() {
  const { artist: settings, media } = useSiteSettings();
  return (
    <section
      id="artist-profile"
      aria-labelledby="artist-profile-title"
      className="section-mask mx-auto grid max-w-7xl scroll-mt-20 items-center gap-14 px-6 py-16 md:grid-cols-2 md:py-20"
    >
      <div className="relative">
        <img
          src={media.artistPortrait || artist}
          alt="The lead photographer of SR Studio"
          loading="lazy"
          decoding="async"
          width={768}
          height={1024}
          className="aspect-[4/5] w-full object-cover"
        />
      </div>
      <div>
        <div
          className="mb-7 flex items-end gap-5"
          aria-label="Over 400 weddings filmed"
        >
          <div className="mb-2 h-px flex-1 bg-primary/70" />
          <div className="shrink-0 text-right">
            <p className="text-3xl font-light leading-none text-gold">
              {settings.metric}
            </p>
            <p className="eyebrow mt-1 text-[0.55rem]">
              {settings.metricLabel}
            </p>
          </div>
        </div>
        <p className="eyebrow mb-4">{settings.label}</p>
        <h2
          id="artist-profile-title"
          className="text-3xl font-light tracking-tight md:text-5xl"
        >
          {settings.title}{" "}
          <span className="font-serif italic text-gold">
            {settings.highlight}
          </span>
        </h2>
        <div className="mt-8 space-y-5 font-serif text-xl leading-relaxed text-muted-foreground">
          {settings.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
          {[
            { i: Heart, t: "Storytelling" },
            { i: Camera, t: "Pro Equipment" },
            { i: Sparkles, t: "Personal Touch" },
          ].map(({ i: Icon, t }) => (
            <div key={t}>
              <Icon className="h-6 w-6 text-primary" strokeWidth={1.3} />
              <p className="mt-3 text-sm">{t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const settings = useSiteSettings();
  return (
    <section className="section-mask bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHead eyebrow="Kind Words" title="Loved by" italic="couples" />
        <div className="grid gap-6 md:grid-cols-3">
          {settings.testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="flex flex-col border border-border bg-background p-10"
            >
              <Quote className="h-8 w-8 text-primary" strokeWidth={1} />
              <p className="mt-6 flex-1 font-serif text-xl italic leading-relaxed">
                “{t.text}”
              </p>
              <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.place}</p>
                </div>
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

const field =
  "w-full rounded-xl border border-input bg-transparent px-4 py-3 text-foreground outline-none placeholder:text-muted-foreground/60 transition-colors focus:border-primary";

function Inquiry() {
  const { inquiry, brand, footer } = useSiteSettings();
  const [selected, setSelected] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toggle = (s: string) =>
    setSelected((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const res = inquirySchema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone") || undefined,
      date: fd.get("date"),
      location: fd.get("location"),
      services: selected,
      message: fd.get("message") || undefined,
    });
    if (!res.success) {
      const errs: Record<string, string> = {};
      res.error.issues.forEach((i) => {
        errs[String(i.path[0])] ??= i.message;
      });
      setErrors(errs);
      return;
    }
    setErrors({});
    const { error } = await supabase.from("inquiries").insert({
      name: res.data.name,
      email: res.data.email,
      phone: res.data.phone || null,
      wedding_date: res.data.date,
      location: res.data.location,
      services: res.data.services,
      message: res.data.message ?? null,
    });
    if (error) {
      toast.error("Couldn't send your inquiry. Please try again.");
      return;
    }
    form.reset();
    setSelected([]);
    toast.success("Thank you! We'll be in touch within 24 hours.");
  };

  return (
    <section
      id="inquire"
      className="section-mask mx-auto max-w-7xl scroll-mt-20 px-6 py-16 md:py-20"
    >
      <div className="grid items-start gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
        <div className="lg:pt-6">
          <p className="eyebrow">{inquiry.eyebrow}</p>
          <h2 className="mt-5 text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl">
            {inquiry.title}{" "}
            <span className="font-serif italic text-gold">
              {inquiry.highlight}
            </span>
          </h2>
          <p className="mt-6 max-w-md font-serif text-xl leading-relaxed text-muted-foreground">
            {inquiry.description}
          </p>
          <div className="mt-12 space-y-6 text-sm sm:text-base">
            <a
              href={`mailto:${brand.email}`}
              className="flex items-center gap-4 transition-colors hover:text-primary"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                <Mail className="h-5 w-5" />
              </span>
              {brand.email}
            </a>
            <a
              href={`tel:${brand.phone}`}
              className="flex items-center gap-4 transition-colors hover:text-primary"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                <Phone className="h-5 w-5" />
              </span>
              {brand.phone}
            </a>
            <p className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              {footer.availability}
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          noValidate
          className="grid gap-6 rounded-3xl border border-border bg-card/50 p-6 shadow-2xl sm:p-10 md:grid-cols-2"
        >
          {[
            { n: "name", l: "Your names", t: "text", p: "Amara & Daniel" },
            { n: "date", l: "Wedding date", t: "date", p: "" },
            {
              n: "email",
              l: "Email address",
              t: "email",
              p: "you@example.com",
            },
            { n: "phone", l: "Phone number", t: "tel", p: "+91 8114350249" },
          ].map((f) => (
            <label key={f.n} className="block">
              <span className="mb-2 block text-sm text-foreground">
                {f.l}
                {f.n === "name" || f.n === "email" ? (
                  <span className="text-primary"> *</span>
                ) : null}
              </span>
              <input
                name={f.n}
                type={f.t}
                placeholder={f.p}
                maxLength={f.n === "phone" ? 30 : 150}
                className={`${field} [color-scheme:dark]`}
              />
              {errors[f.n] && (
                <span className="mt-1 block text-xs text-destructive">
                  {errors[f.n]}
                </span>
              )}
            </label>
          ))}
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-foreground">
              {inquiry.locationLabel} <span className="text-primary">*</span>
            </span>
            <input
              name="location"
              type="text"
              placeholder="Venue or city"
              maxLength={150}
              className={field}
            />
            {errors.location && (
              <span className="mt-1 block text-xs text-destructive">
                {errors.location}
              </span>
            )}
          </label>
          <fieldset className="md:col-span-2">
            <legend className="mb-3 text-sm text-foreground">
              Services needed <span className="text-primary">*</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { s: "Photography", i: Camera },
                { s: "Videography", i: Film },
                { s: "Drone & Aerial", i: Plane },
              ].map(({ s, i: I }) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggle(s)}
                  aria-pressed={selected.includes(s)}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition-all ${selected.includes(s) ? "border-primary bg-primary/15 text-primary" : "border-border text-foreground hover:border-primary/70"}`}
                >
                  <I className="h-4 w-4" /> {s}
                </button>
              ))}
            </div>
            {errors.services && (
              <span className="mt-2 block text-xs text-destructive">
                {errors.services}
              </span>
            )}
          </fieldset>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-foreground">
              Tell us about your day
            </span>
            <textarea
              name="message"
              rows={4}
              maxLength={1000}
              placeholder="Your vision, guest count, timeline, or anything you would love us to know."
              className={`${field} resize-none`}
            />
          </label>
          <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between md:col-span-2">
            <p className="text-sm text-muted-foreground">
              We reply to every inquiry within two business days.
            </p>
            <button
              type="submit"
              className="rounded-full bg-gold px-10 py-4 text-sm font-medium text-primary-foreground shadow-gold transition-transform hover:-translate-y-0.5"
            >
              {inquiry.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  const { footer, brand } = useSiteSettings();
  const socialLinks = footer.socialLinks
    .map((link) => ({ ...link, href: safeHyperlink(link.url) }))
    .filter((link): link is { label: string; url: string; href: string } =>
      Boolean(link.href),
    );
  const socialIcon = (label: string) => {
    const value = label.toLowerCase();
    if (value.includes("instagram")) return Instagram;
    if (value.includes("youtube")) return Youtube;
    if (value.includes("facebook")) return Facebook;
    return Link2;
  };
  return (
    <footer className="section-mask bg-card">
      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="font-serif text-4xl italic md:text-6xl">
          {footer.headline}{" "}
          <span className="text-gold">{footer.highlight}</span> Together
        </p>
        {socialLinks.length > 0 && (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
          {socialLinks.map(({ label, href }) => {
            const Icon = socialIcon(label);
            const external = href.startsWith("http");
            return (
            <a
              key={`${label}-${href}`}
              href={href}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              aria-label={label}
              title={label}
              className="flex h-11 w-11 items-center justify-center border border-border transition-colors hover:border-primary hover:text-primary"
            >
              <Icon className="h-4 w-4" />
            </a>
            );
          })}
          </div>
        )}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground md:flex-row md:gap-10">
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" /> {brand.email}
          </span>
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" /> {brand.phone}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> {brand.location} ·
            Available worldwide
          </span>
        </div>
        <p className="mt-12 text-xs tracking-widest text-muted-foreground/70">
          © {new Date().getFullYear()} {footer.copyrightName.toUpperCase()}. ALL
          RIGHTS RESERVED. ·{" "}
          <a href="/admin" className="hover:text-primary">
            ADMIN
          </a>
        </p>
        <nav
          aria-label="Developer contact"
          className="mt-6 inline-flex items-center gap-3 rounded-full border border-primary px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <span>Developed by Lokanath Pradhan</span>
          {[
            {
              href: "https://www.linkedin.com/in/lokanath-pradhan-014ab2278/",
              label: "Lokanath Pradhan on LinkedIn",
              icon: Linkedin,
            },
            {
              href: "https://locamartin.github.io/",
              label: "Lokanath Pradhan website",
              icon: Globe,
            },
            {
              href: "https://github.com/LocaMartin",
              label: "Lokanath Pradhan on GitHub",
              icon: Github,
            },
          ].map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="transition-colors hover:opacity-75"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
