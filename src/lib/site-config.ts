/**
 * Brand and deployment values live here so this project can be reused for
 * another studio without hunting through route components.
 */
export const SITE = {
  name: "SR Studio",
  adminName: "SR Studio Admin",
  description:
    "Mumbai wedding photography, cinematic films and drone videography for celebrations across India and destination weddings.",
  email: "hello@srstudio.in",
  phone: "+918114350249",
  location: "Mumbai",
  url:
    import.meta.env["VITE_SITE_URL"]?.replace(/\/+$/, "") ??
    "https://srcreativ.srcreativ92.workers.dev",
  workerName: "srcreativ",
  galleryCategories: [
    "Candid Moments",
    "Cinematic Films",
    "Drone & Aerials",
    "Pre-Wedding",
  ],
} as const;

export function siteUrl(path = "/"): string {
  return new URL(path, `${SITE.url}/`).toString();
}

export type GalleryCategory = (typeof SITE.galleryCategories)[number];
