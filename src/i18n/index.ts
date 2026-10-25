import { en } from "./en"
import { hi } from "./hi"
import { mr } from "./mr"
import type { SupportedLanguage, TranslationSchema } from "./types"

export * from "./types"
export { en, hi, mr }

export const translations: Record<SupportedLanguage, TranslationSchema> = {
  en,
  hi,
  mr,
}

export const localeMap: Record<SupportedLanguage, string> = {
  en: "en-IN",
  hi: "hi-IN",
  mr: "mr-IN",
}

export function detectDefaultLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem("hc360_lang") as SupportedLanguage | null
    if (saved && (saved === "en" || saved === "hi" || saved === "mr")) {
      return saved
    }
    const navLang = (navigator.language || "").toLowerCase()
    if (navLang.startsWith("mr")) return "mr"
    if (navLang.startsWith("hi")) return "hi"
  } catch {
    // ignore
  }
  return "en"
}

/**
 * Format currency with ₹ and Indian grouping using Intl API
 */
export function formatCurrency(
  amount: number,
  lang: SupportedLanguage = "en",
): string {
  try {
    const locale = localeMap[lang] || "en-IN"
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`
  }
}

/**
 * Format date using Intl API with the active locale
 */
export function formatDate(
  date: Date | string | number,
  lang: SupportedLanguage = "en",
  options?: Intl.DateTimeFormatOptions,
): string {
  try {
    const d =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date
    const locale = localeMap[lang] || "en-IN"
    const defaultOptions: Intl.DateTimeFormatOptions = options || {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
    return new Intl.DateTimeFormat(locale, defaultOptions).format(d)
  } catch {
    return String(date)
  }
}

/**
 * Format integer/decimal numbers according to locale
 */
export function formatNumber(
  num: number,
  lang: SupportedLanguage = "en",
): string {
  try {
    const locale = localeMap[lang] || "en-IN"
    return new Intl.NumberFormat(locale).format(num)
  } catch {
    return String(num)
  }
}

/**
 * Returns safe translation schema for active language with English fallback
 */
export function getTranslations(lang: SupportedLanguage): TranslationSchema {
  return translations[lang] || translations.en
}
