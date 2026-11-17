import { SITE } from "@/lib/site-config";

export type SiteSettings = {
  brand: {
    name: string;
    description: string;
    email: string;
    phone: string;
    location: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  artist: {
    label: string;
    metric: string;
    metricLabel: string;
    title: string;
    highlight: string;
    paragraphs: string[];
  };
  services: { title: string; description: string; points: string[] }[];
  testimonials: { name: string; place: string; text: string }[];
  inquiry: {
    eyebrow: string;
    title: string;
    highlight: string;
    description: string;
    locationLabel: string;
    submitLabel: string;
  };
  footer: {
    headline: string;
    highlight: string;
    availability: string;
    copyrightName: string;
    instagram: string;
    youtube: string;
    facebook: string;
  };
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand: {
    name: SITE.name,
    description: SITE.description,
    email: SITE.email,
    phone: SITE.phone,
    location: SITE.location,
  },
  hero: {
    eyebrow: "Wedding Photography · Films · Aerials",
    title: "Capturing Your Forever,",
    highlight: "Frame by Frame",
    subtitle:
      "Timeless wedding cinematography and breathtaking drone videography for couples who want their story told like cinema.",
    primaryCta: "View Portfolio",
    secondaryCta: "Inquire Now",
  },
  artist: {
    label: "The Artist",
    metric: "400+",
    metricLabel: "Weddings filmed",
    title: "Every love story",
    highlight: "deserves cinema",
    paragraphs: [
      "SR Studio began with a single camera and a belief: the quiet glances and unplanned laughter matter as much as the grand moments.",
      "Today our team blends documentary storytelling with cinema-grade cameras, prime lenses and licensed drones, while our approach remains deeply personal. We get to know every couple before the day, so we can capture who you truly are.",
    ],
  },
  services: [
    {
      title: "Wedding Photography",
      description:
        "Full-day coverage from getting ready to the final farewell, with meticulous high-resolution editing.",
      points: [
        "Full-day coverage",
        "High-res edited gallery",
        "Heirloom album",
      ],
    },
    {
      title: "Cinematic Videography",
      description:
        "Films that feel like cinema: emotional, intimate and beautifully graded.",
      points: ["Highlight reels", "Full feature films", "Teaser trailers"],
    },
    {
      title: "Drone & Aerial",
      description:
        "Breathtaking 4K aerial perspectives of your venue, procession and celebrations.",
      points: ["4K aerial footage", "Venue overviews", "Licensed pilots"],
    },
  ],
  testimonials: [
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
  ],
  inquiry: {
    eyebrow: "Inquire",
    title: "Let's plan your",
    highlight: "story",
    description:
      "Share a few details about your wedding and we will craft a tailored proposal, with availability for your date.",
    locationLabel: "Event location",
    submitLabel: "Send Inquiry",
  },
  footer: {
    headline: "Let's Create",
    highlight: "Magic",
    availability: "Available worldwide for destination weddings",
    copyrightName: SITE.name,
    instagram: "",
    youtube: "",
    facebook: "",
  },
};

export function siteSettingsFrom(value: unknown): SiteSettings {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return DEFAULT_SITE_SETTINGS;
  const source = value as Partial<SiteSettings>;
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...source,
    brand: { ...DEFAULT_SITE_SETTINGS.brand, ...source.brand },
    hero: { ...DEFAULT_SITE_SETTINGS.hero, ...source.hero },
    artist: { ...DEFAULT_SITE_SETTINGS.artist, ...source.artist },
    inquiry: { ...DEFAULT_SITE_SETTINGS.inquiry, ...source.inquiry },
    footer: { ...DEFAULT_SITE_SETTINGS.footer, ...source.footer },
    services: Array.isArray(source.services)
      ? source.services
      : DEFAULT_SITE_SETTINGS.services,
    testimonials: Array.isArray(source.testimonials)
      ? source.testimonials
      : DEFAULT_SITE_SETTINGS.testimonials,
  };
}
