import { Link } from "@tanstack/react-router";
import { Globe, Gamepad2 } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export function SiteHeader() {
  const { setLangPickerOpen, t } = useApp();
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
        <button
          onClick={() => setLangPickerOpen(true)}
          aria-label="Change language"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-secondary text-muted-foreground transition-colors hover:border-glow hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
        </button>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </header>
  );
}
