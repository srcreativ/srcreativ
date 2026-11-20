export type VdpHallEntry = {
  id: string;
  name: string;
  handle: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  date: string;
  refId: string;
  profileUrl: string;
  note: string;
  featured: boolean;
  published: boolean;
  certificateId: string;
};

export type VdpSettings = {
  programActive: boolean;
  securityEmail: string;
  expiryDate: string;
  pgpFingerprint: string;
  inScopeAssets: string[];
  outOfScopeRules: string[];
};

export const DEFAULT_VDP_SETTINGS: VdpSettings = {
  programActive: true,
  securityEmail: "security@srstudio.in",
  expiryDate: "2027-11-20",
  pgpFingerprint: "4F9A 82C1 7E30 B41D 990A C3E2 518B 7D04 A6F1 2026",
  inScopeAssets: [
    "srstudio.in & *.srstudio.in",
    "gallery.srstudio.in",
    "api.srstudio.in/v1/*",
  ],
  outOfScopeRules: [
    "Denial of Service (DDoS / volumetric stress tests)",
    "Social engineering, phishing, or vishing of staff or couples",
    "Physical security testing of SR Studio offices or shoot venues",
    "Unthrottled automated scanners (> 5 requests / second) or spam",
    "Third-party SaaS vendors, CDNs, or missing SPF/DMARC records",
  ],
};

export const DEFAULT_VDP_HALL: VdpHallEntry[] = [
  [
    "Lokanath Pradhan",
    "@lokanathpradhan",
    "Auth & Vault Hardening",
    "Critical",
    "October 2026",
    "Architected zero-trust signed URL verification and eliminated pre-signed media bucket enumeration across private wedding vaults.",
    true,
  ],
  [
    "Rohan Deshmukh",
    "@0xRohanSec",
    "IDOR · Client Gallery API",
    "High",
    "September 2026",
    "Identified an indirect object reference on guest preview tokens allowing unauthenticated metadata inspection.",
    false,
  ],
  [
    "Ananya Nair",
    "@ananya_infosec",
    "Stored XSS · Inquiry Portal",
    "High",
    "August 2026",
    "Reported a DOM sanitization bypass in custom wedding venue notes and assisted in validating strict CSP rules.",
    false,
  ],
  [
    "Vikramaditya Rao",
    "@vikram_pwn",
    "SSRF · Drone Telemetry Preview",
    "Critical",
    "June 2026",
    "Responsibly disclosed a server-side request forgery vector in the aerial venue map preview generator.",
    false,
  ],
  [
    "Meera Kulkarni",
    "@meerak_sec",
    "CORS Misconfiguration",
    "Medium",
    "April 2026",
    "Flagged overly permissive wildcard origin headers on staging portfolio endpoints prior to production rollout.",
    false,
  ],
  [
    "Siddharth Menon",
    "@sid_hunter",
    "Rate-Limit Bypass · Availability API",
    "Medium",
    "November 2026",
    "Demonstrated header-based rate-limit evasion on date availability lookups, strengthening edge WAF rules.",
    false,
  ],
].map(([name, handle, category, severity, date, note, featured], index) => ({
  id: `default-${index + 1}`,
  name: name as string,
  handle: handle as string,
  category: category as string,
  severity: severity as VdpHallEntry["severity"],
  date: date as string,
  refId: "",
  profileUrl: "https://github.com",
  note: note as string,
  featured: featured as boolean,
  published: true,
  certificateId: `SR-DEFAULT-${index + 1}`,
}));

export function vdpSettingsFrom(value: unknown): VdpSettings {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return DEFAULT_VDP_SETTINGS;
  const source = value as Partial<VdpSettings>;
  return {
    ...DEFAULT_VDP_SETTINGS,
    ...source,
    inScopeAssets: Array.isArray(source.inScopeAssets)
      ? source.inScopeAssets.filter(
          (item): item is string => typeof item === "string",
        )
      : DEFAULT_VDP_SETTINGS.inScopeAssets,
    outOfScopeRules: Array.isArray(source.outOfScopeRules)
      ? source.outOfScopeRules.filter(
          (item): item is string => typeof item === "string",
        )
      : DEFAULT_VDP_SETTINGS.outOfScopeRules,
  };
}
