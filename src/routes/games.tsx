import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { useApp } from "@/contexts/AppContext";
import { Activity, Users } from "lucide-react";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Community Games — Game Hub" },
      { name: "description", content: "Browse our curated collection of community games." },
      { property: "og:title", content: "Community Games — Game Hub" },
      {
        property: "og:description",
        content: "Browse our curated collection of community games.",
      },
    ],
  }),
  component: GamesPage,
});

const GAMES = [
  { name: "Sword Arena 7738", players: 209, online: true },
  { name: "Anni's Place", players: 230, online: true },
  { name: "Slap Royale", players: 191, online: true },
  { name: "V4 Duo Mode", players: 217, online: true },
  { name: "Sentinel Console", players: 206, online: true },
  { name: "RO-63 Classic", players: 0, online: false },
  { name: "Meet Neko [Solo]", players: 0, online: false },
  { name: "Cabin Photography [2P]", players: 0, online: false },
];

function GamesPage() {
  const { t } = useApp();
  const onlineCount = GAMES.filter((g) => g.online).length;
  const today = new Date().toLocaleDateString("en-GB");

  return (
    <div>
      <PageHero title={t("games.title")} desc={t("games.desc")} />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3 shadow-card">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-success" />
            <span className="font-semibold">{t("games.status")}</span>
          </div>
          <span className="text-sm text-muted-foreground">
            <strong className="text-success">{onlineCount}</strong>/{GAMES.length} {t("games.online")}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {GAMES.map((g) => (
            <button
              key={g.name}
              disabled={!g.online}
              className={`group flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                g.online
                  ? "border-border bg-card shadow-card hover:-translate-y-0.5 hover:border-glow hover:shadow-glow"
                  : "cursor-not-allowed border-border/50 bg-card/50 opacity-60"
              }`}
            >
              <div className="min-w-0">
                <div className="truncate font-semibold">{g.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {t("games.updated")} {today}
                </div>
                {g.online && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" /> {g.players} {t("games.players")}
                  </div>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${
                  g.online
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {g.online ? `🟢 ${t("games.statusOn")}` : t("games.statusOff")}
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
