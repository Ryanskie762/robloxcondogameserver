import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHero } from "@/components/PageHero";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Server, Zap } from "lucide-react";

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

type Avatar = Tables<"private_server_avatars">;

function PrivateServerPage() {
  const { t } = useApp();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [serverUrl, setServerUrl] = useState("");

  useEffect(() => {
    supabase
      .from("private_server_avatars")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => setAvatars(data ?? []));
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "private_server_url")
      .maybeSingle()
      .then(({ data }) => setServerUrl(data?.value ?? ""));
  }, []);

  return (
    <div>
      <PageHero title={t("server.title")} desc={t("server.desc")} />
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/50 bg-surface/50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand">
                <Server className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Brookside RP Lounge</h3>
                <div className="text-xs text-muted-foreground">
                  Region: Global · Slots {avatars.length}/12
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
            </div>

            <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01]">
              <Zap className="h-4 w-4" />
              {t("server.enter")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
