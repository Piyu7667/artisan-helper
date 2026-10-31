import { Globe } from "lucide-react";

import { LANGUAGES, useI18n, type LanguageCode } from "@/lib/i18n";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useI18n();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-sm font-medium text-foreground ${className}`}
    >
      <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">{t("language.label")}</span>
      <select
        value={lang}
        onChange={(e) => setLang(e.target.value as LanguageCode)}
        aria-label={t("language.label")}
        className="bg-transparent pr-1 text-sm font-medium outline-none"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
