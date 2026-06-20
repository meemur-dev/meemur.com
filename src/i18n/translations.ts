export type Locale = "en" | "tr";

export function localePath(path: string, locale: Locale): string {
  return locale === "en" ? path : `/${locale}${path}`;
}

const nav = {
  home: { en: "Home", tr: "Ana Sayfa" },
  services: { en: "Services", tr: "Hizmetler" },
  work: { en: "Work", tr: "İşlerimiz" },
  about: { en: "About", tr: "Hakkımızda" },
  getInTouch: { en: "Get in touch", tr: "İletişime geç" },
  skipToContent: { en: "Skip to content", tr: "İçeriğe geç" },
  menuLabel: { en: "Menu", tr: "Menü" },
  primaryNav: { en: "Primary", tr: "Ana menü" },
} as const;

const footer = {
  tagline: { en: "We make the web work for you.", tr: "Web'in gücünü markanıza taşıyoruz." },
  servicesHeading: { en: "Services", tr: "Hizmetler" },
  companyHeading: { en: "Company", tr: "Şirket" },
  work: { en: "Work", tr: "İşlerimiz" },
  about: { en: "About", tr: "Hakkımızda" },
  contact: { en: "Contact", tr: "İletişim" },
  stayInLoop: { en: "Stay in the loop", tr: "Haberdar olun" },
  subscribeText: { en: "Occasional web & growth tips. No spam.", tr: "Ara sıra web ve büyüme ipuçları. Spam yok." },
  emailPlaceholder: { en: "Your email address", tr: "E-posta adresiniz" },
  subscribe: { en: "Subscribe", tr: "Abone ol" },
  emailLabel: { en: "Email address", tr: "E-posta adresi" },
  allRights: { en: "All rights reserved.", tr: "Tüm hakları saklıdır." },
  privacy: { en: "Privacy", tr: "Gizlilik" },
  startProject: { en: "Start a project →", tr: "Proje başlat →" },
  ecommerce: { en: "Web & E-commerce", tr: "Web & E-ticaret" },
  apps: { en: "Cross-platform Apps", tr: "Çapraz platform Uygulamalar" },
  analytics: { en: "Analytics & Measurement", tr: "Analitik & Ölçümleme" },
  cro: { en: "CRO & Experimentation", tr: "Dönüşüm & Deneyler" },
  performance: { en: "Accessibility & Performance", tr: "Erişilebilirlik & Performans" },
  ads: { en: "Social Media Ads", tr: "Sosyal Medya Reklamları" },
} as const;

const og = {
  siteName: { en: "meemur", tr: "meemur" },
  locale: { en: "en_US", tr: "tr_TR" },
} as const;

export const t = { nav, footer, og } as const;

export function tr(key: keyof typeof nav | keyof typeof footer | keyof typeof og, locale: Locale): string {
  for (const category of [nav, footer, og] as const) {
    if (key in category) {
      return (category as Record<string, Record<Locale, string>>)[key][locale];
    }
  }
  return key;
}

export function trN(key: keyof typeof nav, locale: Locale): string {
  return nav[key][locale];
}

export function trF(key: keyof typeof footer, locale: Locale): string {
  return footer[key][locale];
}

export function trO(key: keyof typeof og, locale: Locale): string {
  return og[key][locale];
}
