import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { useApp } from "@/contexts/AppContext";
import { Activity, Users, Loader2, ShieldCheck, AlertCircle, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useServerFn } from "@tanstack/react-start";
import { verifyRobloxAge } from "@/lib/roblox.functions";
import { useLiveActivity } from "@/lib/useLiveActivity";

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

const STORAGE_KEY = "roblox_age_verified_v1";
const MIN_DAYS = 50;

type VerifiedInfo = { username: string; userId: number; ageDays: number };

function GamesPage() {
  const { t } = useApp();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { events, delta } = useLiveActivity(1);
  const [today, setToday] = useState("");
  useEffect(() => setToday(new Date().toLocaleDateString("en-GB")), []);

  const [verified, setVerified] = useState<VerifiedInfo | null>(null);
  const [checkingStorage, setCheckingStorage] = useState(true);
  const [username, setUsername] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyFn = useServerFn(verifyRobloxAge);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setVerified(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setCheckingStorage(false);
  }, []);

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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const result = await verifyFn({ data: { username: username.trim() } });
      if (!result.ok) {
        setError(result.error);
      } else {
        const info: VerifiedInfo = {
          username: result.username,
          userId: result.userId,
          ageDays: result.ageDays,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
        setVerified(info);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Verification failed. Try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setVerified(null);
    setUsername("");
  };

  const onlineCount = games.filter((g) => g.online).length;

  if (checkingStorage) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!verified) {
    return (
      <div>
        <PageHero title={t("games.title")} desc={t("games.desc")} />
        <section className="mx-auto max-w-md px-4 py-10">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Roblox Age Verification</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Enter your Roblox username. Your account must be at least{" "}
              <strong className="text-foreground">{MIN_DAYS} days old</strong> to
              access the community games.
            </p>
            <form onSubmit={handleVerify} className="space-y-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Roblox username"
                required
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]+"
                disabled={verifying}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                disabled={verifying || !username.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
              >
                {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
                {verifying ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHero title={t("games.title")} desc={t("games.desc")} />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-xs">
          <div className="flex items-center gap-2 text-success">
            <ShieldCheck className="h-4 w-4" />
            <span>
              Verified as <strong>{verified.username}</strong> ({verified.ageDays} days)
            </span>
          </div>
          <button
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            Switch account
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live joins
                </span>
              </div>
              <ul className="space-y-2">
                {events.length === 0 && (
                  <li className="text-xs text-muted-foreground">Waiting for activity…</li>
                )}
                {events.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex items-center gap-2 rounded-lg border border-border/50 bg-surface/40 px-2.5 py-2 text-xs"
                  >
                    <img
                      src={ev.avatarUrl}
                      alt={ev.name}
                      loading="lazy"
                      className="h-8 w-8 shrink-0 rounded-full border border-border bg-surface object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-foreground">{ev.name}</div>
                      <div className="text-[10px] text-muted-foreground">just joined</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3 shadow-card">
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
                  const linkLabel = (g.display_text?.trim() || g.link)?.trim();
                  const Inner = (
                    <>
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{g.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {t("games.updated")} {today}
                        </div>
                        {g.online && g.link && linkLabel && (
                          <div className="mt-1 truncate text-xs text-primary/90">
                            {linkLabel}
                          </div>
                        )}
                        {g.online && (
                          <div className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span className="text-success font-semibold">
                              {Math.max(0, g.players + delta + ((g.name.length * 3) % 7) - 3)}
                            </span>
                            <span>{t("games.players")}</span>
                            <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
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
                    <a key={g.id} href={g.link} className={cls}>
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
          </div>
        </div>
      </section>
    </div>
  );
}
