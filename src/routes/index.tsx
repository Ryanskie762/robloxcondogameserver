import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Server, LifeBuoy, Settings2, Wrench, ArrowRight, Users, Calendar } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useGlobalPlayers } from "@/hooks/useGlobalPlayers";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Game Hub — Community games, private servers & tools" },
      {
        name: "description",
        content:
          "Your ultimate destination for community games, private servers, and exclusive tools.",
      },
      { property: "og:title", content: "Game Hub" },
      {
        property: "og:description",
        content: "Community games, private servers, and exclusive tools — all in one hub.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { t } = useApp();
  const today = new Date().toLocaleDateString("en-GB");

  const cards = [
    {
      to: "/games" as const,
      icon: Gamepad2,
      title: t("card.games.title"),
      desc: t("card.games.desc"),
    },
    {
      to: "/private-server" as const,
      icon: Server,
      title: t("card.server.title"),
      desc: t("card.server.desc"),
    },
    {
      to: "/support" as const,
      icon: LifeBuoy,
      title: t("card.support.title"),
      desc: t("card.support.desc"),
    },
    {
      to: "/settings" as const,
      icon: Settings2,
      title: t("card.settings.title"),
      desc: t("card.settings.desc"),
    },
  ];

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-glow" />
        <div className="absolute inset-0 -z-10 opacity-30 [background:repeating-linear-gradient(135deg,transparent_0_18px,oklch(0.18_0.02_260)_18px_19px)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-center md:py-28">
          <h1 className="font-display text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl">
            <span className="text-gradient-brand drop-shadow-[0_0_30px_hsl(var(--primary-h)_var(--primary-s)_var(--primary-l)/0.5)]">
              {t("home.heroTitle")}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            {t("home.heroSub")}
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/games"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-brand px-7 py-3.5 font-semibold text-primary-foreground shadow-glow animate-pulse-glow transition-transform hover:scale-105"
            >
              {t("home.cta")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-success" />
              <strong className="text-foreground">190</strong> {t("home.online")}
            </span>
            <span className="hidden h-4 w-px bg-border md:block" />
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {t("home.lastUpdate")}: <strong className="text-foreground">{today}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Cards grid */}
      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:-translate-y-1 hover:border-glow hover:shadow-glow"
            >
              <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-brand opacity-0 blur-3xl transition-opacity group-hover:opacity-30" />
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-gradient-brand group-hover:text-primary-foreground">
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
              <ArrowRight className="absolute bottom-6 right-6 h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>

        {/* Tools coming soon */}
        <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="absolute right-4 top-4 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {t("card.tools.soon")}
          </div>
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">{t("card.tools.title")}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t("card.tools.desc")}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["🪙 Coin Gen", "📋 Game Copier", "👕 Skin Vault", "🎙️ Voice Unlocker", "More..."].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
