import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "react-native-localize";

// Import translation files
import en from "./locales/en.json";
import zh from "./locales/zh.json";

// Detect the user's locale
const fallback = { languageTag: "en", isRTL: false };
const locales = Localization.getLocales();
const languageTag = locales.find(locale => ["en", "zh"].includes(locale.languageTag))?.languageTag || fallback.languageTag;

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: "v4",
    lng: languageTag, // Set the initial language
    fallbackLng: "zh", // Fallback language
    resources: {
      en: { translation: en },
      zh: { translation: zh },
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;