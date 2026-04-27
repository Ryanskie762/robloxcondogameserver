import { useApp } from "@/contexts/AppContext";
import { LANGS } from "@/lib/i18n";
import { X } from "lucide-react";

export function LanguageModal() {
  const { langPickerOpen, setLangPickerOpen, setLang, lang, hasChosenLang } = useApp();
  if (!langPickerOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
      onClick={() => hasChosenLang && setLangPickerOpen(false)}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-card animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {hasChosenLang && (
          <button
            onClick={() => setLangPickerOpen(false)}
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="mb-5 text-center">
          <h2 className="flex items-center justify-center gap-2 font-display text-xl font-bold">
            🌍 <span>{useApp().t("lang.title")}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{useApp().t("lang.subtitle")}</p>
        </div>
        <div className="space-y-2">
          {LANGS.map((l) => {
            const active = l.code === lang && hasChosenLang;
            return (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code);
                  setLangPickerOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all hover:border-glow hover:bg-secondary ${
                  active
                    ? "border-glow bg-secondary shadow-glow"
                    : "border-border bg-surface"
                }`}
              >
                <span className="text-xl">{l.flag}</span>
                <span className="flex-1 font-medium">{l.label}</span>
                {active && <span className="text-primary">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
