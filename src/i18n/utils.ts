import en from "./en.json";
import tr from "./tr.json";

export type Locale = "en" | "tr";

export const LOCALES: Locale[] = ["en", "tr"];
export const defaultLocale: Locale = "en";

const dictionaries = { en, tr };

// The English dictionary defines the shape every locale follows.
export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as Dictionary;
}

// Flat-key UI string accessor (e.g. t("nav.home")), falling back to the default
// locale when a key is missing for the current one.
export function useTranslations(locale: Locale) {
  const dict = dictionaries[locale] as Record<string, unknown>;
  const fallback = dictionaries[defaultLocale] as Record<string, unknown>;
  return (key: string): string => {
    const value = dict[key] ?? fallback[key];
    return typeof value === "string" ? value : key;
  };
}

// Prefix a root-relative path with the locale, except for the default locale
// which lives unprefixed at the site root. The locale home is slashless ("/tr",
// not "/tr/") so it matches the file build format that serves slashless URLs.
export function localePath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  const prefixed = `/${locale}${path}`;
  return prefixed === `/${locale}/` ? `/${locale}` : prefixed;
}

// Strip a leading non-default locale segment to recover the base (default-locale)
// path. Inverse of localePath, so "/tr/services" -> "/services" and "/tr" -> "/".
const localePrefix = new RegExp(`^/(?:${LOCALES.filter((l) => l !== defaultLocale).join("|")})(?=/|$)`);
export function basePath(path: string): string {
  return path.replace(localePrefix, "") || "/";
}

// Static paths for the [lang] routes: every locale except the default.
export function langStaticPaths() {
  return LOCALES.filter((locale) => locale !== defaultLocale).map((lang) => ({
    params: { lang },
  }));
}
