import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.srstudio.admin",
  appName: "SR Studio Admin",
  webDir: ".output/public",
  server: {
    // The website stays the single source of truth; the Android app always
    // opens the current Cloudflare deployment.
    url: "https://srcreativ.srcreativ92.workers.dev/admin",
    cleartext: false,
    allowNavigation: ["srcreativ.srcreativ92.workers.dev"],
  },
};

export default config;
