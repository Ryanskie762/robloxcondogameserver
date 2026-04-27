import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { THEME_COLORS, useApp } from "@/contexts/AppContext";
import { LANGS } from "@/lib/i18n";
import { BadgeCheck, Palette, Languages, User } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Game Hub" },
      { name: "description", content: "Configure your appearance, language and account." },
      { property: "og:title", content: "Settings — Game Hub" },
      {
        property: "og:description",
        content: "Configure your appearance, language and account.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, theme, setTheme, lang, setLang } = useApp();
  const [saved, setSaved] = useState(false);

  return (
    <div>
      <PageHero title={t("settings.title")} desc={t("settings.desc")} />
      <section className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        {/* Appearance */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{t("settings.appearance")}</h3>
              <p className="text-xs text-muted-foreground">{t("settings.appearanceDesc")}</p>
            </div>
          </div>
          <p className="mb-3 text-sm font-medium">{t("settings.theme")}</p>
          <div className="flex flex-wrap gap-3">
            {THEME_COLORS.map((c) => {
              const active = c.name === theme.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setTheme(c)}
                  aria-label={c.name}
                  className={`h-12 w-12 rounded-full border-2 transition-all ${
                    active
                      ? "scale-110 border-foreground shadow-glow"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ background: `hsl(${c.h} ${c.s}% ${c.l}%)` }}
                />
              );
            })}
          </div>
          <button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            className="mt-5 w-full rounded-xl bg-gradient-brand py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01]"
          >
            {saved ? `✓ ${t("settings.saved")}` : t("settings.save")}
          </button>
        </div>

        {/* Language */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <Languages className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{t("settings.lang")}</h3>
              <p className="text-xs text-muted-foreground">{t("settings.langDesc")}</p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {LANGS.map((l) => {
              const active = l.code === lang;
              return (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all ${
                    active
                      ? "border-glow bg-secondary shadow-glow"
                      : "border-border bg-surface hover:border-glow"
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className="flex-1 font-medium">{l.label}</span>
                  {active && <span className="text-primary">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Profile */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">{t("settings.profile")}</h3>
              <p className="text-xs text-muted-foreground">{t("settings.profileDesc")}</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand font-bold text-primary-foreground">
                G
              </div>
              <div>
                <div className="font-semibold">Guest</div>
                <div className="text-xs text-muted-foreground">guest@gamehub.app</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
              <BadgeCheck className="h-3.5 w-3.5" /> {t("settings.verified")}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
