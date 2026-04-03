import { RemixI18Next } from 'remix-i18next/server';
import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";

export function initI18n() {
  return i18next
    .use(
      resourcesToBackend((lng: string, ns: string) =>
        import(`../public/locales/${lng}.json`)
      )
    )
    .init({
      fallbackLng: "en",
      supportedLngs: ["en", "es", "pt", "pt-BR"],
      ns: ["common"],
      defaultNS: "common",
    });
}

export async function getI18NextServer() {
  return new RemixI18Next({
    detection: {
      supportedLanguages: ["en", "es", "pt", "pt-BR"],
      fallbackLanguage: "en",
    },
    i18next: {
      fallbackLng: "en",
      supportedLngs: ["en", "es", "pt", "pt-BR"],
      ns: ["common"],
      defaultNS: "common",
    },
    plugins: [resourcesToBackend((lng: string, ns: string) =>
      import(`../public/locales/${lng}.json`)
    )],
  });
}

export async function getFixedT(request: Request) {
  return getI18NextServer().then((i18next) => i18next.getFixedT(request));
}
