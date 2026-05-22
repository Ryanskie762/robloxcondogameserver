import { useEffect } from "react";
import { X, ExternalLink, Users, Calendar, Zap } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Game = Tables<"community_games">;

function parsePlaceId(link: string): string | null {
  const m = link.match(/games\/(\d+)/);
  return m ? m[1] : null;
}

export function GameDetailModal({
  game,
  livePlayers,
  onClose,
}: {
  game: Game | null;
  livePlayers?: number;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!game) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [game, onClose]);

  if (!game) return null;

  const placeId = game.link ? parsePlaceId(game.link) : null;
  const thumb = placeId
    ? `https://www.roblox.com/asset-thumbnail/image?assetId=${placeId}&width=768&height=432&format=png`
    : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm animate-in fade-in sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-t-2xl border border-border bg-card shadow-glow animate-in slide-in-from-bottom-4 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-foreground backdrop-blur transition hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-video w-full overflow-hidden bg-gradient-brand">
          {thumb ? (
            <img
              src={thumb}
              alt={game.name}
              className="h-full w-full object-cover"
              onError={(e) => ((e.currentTarget.style.display = "none"))}
            />
          ) : null}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-card via-card/70 to-transparent p-5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${
                  game.online
                    ? "bg-success/20 text-success"
                    : "bg-destructive/20 text-destructive"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    game.online ? "animate-pulse bg-success" : "bg-destructive"
                  }`}
                />
                {game.online ? "ONLINE" : "OFFLINE"}
              </span>
              {game.online && typeof livePlayers === "number" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2.5 py-1 text-[10px] font-semibold text-foreground backdrop-blur">
                  <Users className="h-3 w-3" />
                  {livePlayers} playing
                </span>
              )}
            </div>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
              {game.name}
            </h2>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Updated {new Date(game.updated_at).toLocaleDateString("en-GB")}
          </div>

          {game.display_text && (
            <p className="rounded-lg border border-border/50 bg-surface/40 p-3 text-sm text-foreground/90">
              {game.display_text}
            </p>
          )}

          {game.link && (
            <div className="rounded-lg border border-border/50 bg-surface/40 p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Game Link
              </div>
              <a
                href={game.link}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-xs text-primary hover:underline"
              >
                {game.link}
              </a>
            </div>
          )}

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> Roblox games launch in
            the Roblox app. Make sure you have Roblox installed before clicking play.
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {game.online && game.link ? (
              <a
                href={game.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01]"
              >
                <Zap className="h-4 w-4" />
                Play in Roblox
              </a>
            ) : (
              <button
                disabled
                className="flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-muted py-3 font-semibold text-muted-foreground opacity-60"
              >
                Currently Offline
              </button>
            )}
            {placeId && (
              <a
                href={`https://www.roblox.com/games/${placeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold transition hover:border-glow"
              >
                <ExternalLink className="h-4 w-4" />
                Roblox page
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
