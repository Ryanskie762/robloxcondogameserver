import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Server, Zap, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { verifyRobloxAge } from "@/lib/roblox.functions";
import { useLiveActivity } from "@/lib/useLiveActivity";
import { LiveJoinToasts } from "@/components/LiveJoinToasts";


export const Route = createFileRoute("/private-server")({
  head: () => ({
    meta: [
      { title: "Private Server — Game Hub" },
      {
        name: "description",
        content: "Join our exclusive private server for VIP community experiences.",
      },
      { property: "og:title", content: "Private Server — Game Hub" },
      {
        property: "og:description",
        content: "Join our exclusive private server for VIP community experiences.",
      },
    ],
  }),
  component: PrivateServerPage,
});

const FALLBACK_COLORS = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#A78BFA", "#FB7185", "#34D399", "#60A5FA"];
const STORAGE_KEY = "roblox_age_verified_v1";
const MIN_DAYS = 50;

type Avatar = Tables<"private_server_avatars">;
type VerifiedInfo = { username: string; userId: number; ageDays: number };

function PrivateServerPage() {
  const { t } = useApp();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [serverUrl, setServerUrl] = useState("");
  const [serverName, setServerName] = useState("Brookside RP Lounge");

  const [verified, setVerified] = useState<VerifiedInfo | null>(null);
  const [checkingStorage, setCheckingStorage] = useState(true);
  const [username, setUsername] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verifyFn = useServerFn(verifyRobloxAge);
  const { events, delta } = useLiveActivity(2);

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
      .from("private_server_avatars")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setAvatars(data ?? []));
    supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["private_server_url", "private_server_name"])
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
        setServerUrl(map["private_server_url"] ?? "");
        if (map["private_server_name"]) setServerName(map["private_server_name"]);
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
      setError(err instanceof Error ? err.message : "Verification failed. Try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setVerified(null);
    setUsername("");
  };

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
        <PageHero title={t("server.title")} desc={t("server.desc")} />
        <section className="mx-auto max-w-md px-4 py-10">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold">Roblox Age Verification</h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Enter your Roblox username. Your account must be at least{" "}
              <strong className="text-foreground">{MIN_DAYS} days old</strong> to
              access the private server.
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
      <PageHero title={t("server.title")} desc={t("server.desc")} />
      <section className="mx-auto max-w-3xl px-4 py-10">
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

        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/50 bg-surface/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand">
                <Server className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{serverName}</h3>
                <div className="text-xs text-muted-foreground">
                  Region: Global · Slots{" "}
                  <span className="font-semibold text-success">
                    {Math.min(12, avatars.length + Math.max(0, delta))}
                  </span>
                  /12
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              {t("server.active")}
            </span>
          </div>

          <div className="px-6 py-6">
            <p className="text-sm font-medium text-muted-foreground">{t("server.players")}</p>
            <div className="mt-3 flex flex-wrap -space-x-2">
              {avatars.map((a, i) => (
                <div
                  key={a.id}
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-card text-xs font-bold text-white shadow"
                  style={{ background: a.image_url ? "transparent" : FALLBACK_COLORS[i % FALLBACK_COLORS.length] }}
                  title={a.label}
                >
                  {a.image_url ? (
                    <img src={a.image_url} alt={a.label || "Player avatar"} className="h-full w-full object-cover" />
                  ) : (
                    a.label || String.fromCharCode(65 + i)
                  )}
                </div>
              ))}
              {Array.from({ length: Math.max(0, delta) }).map((_, i) => (
                <div
                  key={`bot-${i}`}
                  className="flex h-10 w-10 animate-pulse items-center justify-center rounded-full border-2 border-card bg-gradient-brand text-xs font-bold text-primary-foreground shadow"
                  title="Bot player"
                >
                  🤖
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-border bg-surface/40 p-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Live joins
                </span>
              </div>
              <ul className="space-y-1.5">
                {events.length === 0 && (
                  <li className="text-xs text-muted-foreground">Waiting for activity…</li>
                )}
                {events.map((ev) => (
                  <li key={ev.id} className="flex items-center gap-2 text-xs">
                    <UserPlus className="h-3.5 w-3.5 text-success" />
                    <strong className="text-foreground">{ev.name}</strong>
                    <span className="text-muted-foreground">joined the server</span>
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={serverUrl || "#"}
              onClick={(e) => {
                if (!serverUrl) e.preventDefault();
              }}
              aria-disabled={!serverUrl}
              className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01] ${
                !serverUrl ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <Zap className="h-4 w-4" />
              {t("server.enter")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
