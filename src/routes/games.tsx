import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { useApp } from "@/contexts/AppContext";
import { Activity, Users, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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

type Game = Tables<"community_games">;

function GamesPage() {
  const { t } = useApp();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date().toLocaleDateString("en-GB");

  useEffect(() => {
    supabase
      .from("community_games")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setGames(data ?? []);
        setLoading(false);
      });
  }, []);

  const onlineCount = games.filter((g) => g.online).length;

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
            <strong className="text-success">{onlineCount}</strong>/{games.length}{" "}
            {t("games.online")}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {games.map((g) => {
              const Inner = (
                <>
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
                </>
              );
              const cls = `group flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                g.online && g.link
                  ? "border-border bg-card shadow-card hover:-translate-y-0.5 hover:border-glow hover:shadow-glow"
                  : "cursor-not-allowed border-border/50 bg-card/50 opacity-60"
              }`;
              return g.online && g.link ? (
                <a key={g.id} href={g.link} target="_blank" rel="noopener noreferrer" className={cls}>
                  {Inner}
                </a>
              ) : (
                <div key={g.id} className={cls}>
                  {Inner}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
