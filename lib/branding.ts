export type BrandingProfileInput = {
  brandName: string;
  primaryColor?: string | null;
  accentColor?: string | null;
  logoUrl?: string | null;
  publicTone?: string | null;
  footerText?: string | null;
};

const HEX = /^#[0-9a-f]{6}$/i;

export function normalizeBranding(input: BrandingProfileInput) {
  const primaryColor = input.primaryColor && HEX.test(input.primaryColor) ? input.primaryColor : "#0f172a";
  const accentColor = input.accentColor && HEX.test(input.accentColor) ? input.accentColor : "#c8a45d";
  return {
    brandName: input.brandName.trim() || "EstatePilot Agency",
    primaryColor,
    accentColor,
    logoUrl: input.logoUrl?.trim() || null,
    publicTone: input.publicTone || "premium_professional",
    footerText: input.footerText?.trim() || null
  };
}

export function buildBrandCss(profile: { primaryColor: string; accentColor: string; fontFamily?: string | null }) {
  return `:root{--brand-primary:${profile.primaryColor};--brand-accent:${profile.accentColor};--brand-font:${profile.fontFamily || "Inter"};}`;
}

export function dnsInstructions(domain: string, token: string) {
  return {
    domain,
    records: [
      { type: "CNAME", host: "@", value: "cname.vercel-dns.com" },
      { type: "TXT", host: `_estatepilot.${domain}`, value: token }
    ],
    note: "A TXT token igazolja, hogy az iroda jogosult a domain használatára."
  };
}
