import { Link } from "@tanstack/react-router";
import { Globe, Gamepad2, Users } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useGlobalPlayers } from "@/hooks/useGlobalPlayers";

export function SiteHeader() {
  const { setLangPickerOpen, t } = useApp();
  const { total, loaded } = useGlobalPlayers();
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand shadow-glow transition-transform group-hover:scale-110">
            <Gamepad2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="font-display text-lg font-bold tracking-tight">
            <span className="text-foreground">{t("nav.brand").split(" ")[0]}</span>
            <span className="ml-1 text-gradient-brand">
              {t("nav.brand").split(" ").slice(1).join(" ") || ""}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground sm:inline-flex">
            <Users className="h-3.5 w-3.5 text-success" />
            <span className="font-bold text-foreground">{loaded ? total.toLocaleString() : "—"}</span>
            <span>{t("home.online")}</span>
            <span className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          </span>
          <button
            onClick={() => setLangPickerOpen(true)}
            aria-label="Change language"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-glow hover:text-foreground"
          >
            <Globe className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}
