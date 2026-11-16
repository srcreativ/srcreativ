/**
 * Brand and deployment values live here so this project can be reused for
 * another studio without hunting through route components.
 */
export const SITE = {
  name: "SR Studio",
  adminName: "SR Studio Admin",
  description: "Cinematic wedding photography, films and drone videography.",
  email: "hello@srstudio.in",
  phone: "+918114350249",
  location: "Mumbai",
  workerName: "srcreativ",
  galleryCategories: [
    "Candid Moments",
    "Cinematic Films",
    "Drone & Aerials",
    "Pre-Wedding",
  ],
} as const;

export type GalleryCategory = (typeof SITE.galleryCategories)[number];
