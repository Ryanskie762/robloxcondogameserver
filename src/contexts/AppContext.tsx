import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { t as tr } from "@/lib/i18n";

type ThemeColor = { name: string; h: number; s: number; l: number };

export const THEME_COLORS: ThemeColor[] = [
  { name: "Crimson", h: 0, s: 85, l: 55 },
  { name: "Azure", h: 220, s: 90, l: 58 },
  { name: "Emerald", h: 145, s: 70, l: 45 },
  { name: "Violet", h: 275, s: 75, l: 60 },
  { name: "Amber", h: 35, s: 95, l: 55 },
  { name: "Cyan", h: 190, s: 85, l: 50 },
];

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  theme: ThemeColor;
  setTheme: (c: ThemeColor) => void;
  langPickerOpen: boolean;
  setLangPickerOpen: (v: boolean) => void;
  hasChosenLang: boolean;
  t: (key: string) => string;
};

const AppContext = createContext<Ctx | null>(null);

const LS_LANG = "gh.lang";
const LS_THEME = "gh.theme";
const LS_CHOSEN = "gh.langChosen";

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [theme, setThemeState] = useState<ThemeColor>(THEME_COLORS[0]);
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [hasChosenLang, setHasChosenLang] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedLang = localStorage.getItem(LS_LANG) as Lang | null;
    const savedTheme = localStorage.getItem(LS_THEME);
    const chosen = localStorage.getItem(LS_CHOSEN) === "1";
    if (savedLang) setLangState(savedLang);
    if (savedTheme) {
      const found = THEME_COLORS.find((c) => c.name === savedTheme);
      if (found) setThemeState(found);
    }
    setHasChosenLang(chosen);
    if (!chosen) setLangPickerOpen(true);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--primary-h", String(theme.h));
    document.documentElement.style.setProperty("--primary-s", `${theme.s}%`);
    document.documentElement.style.setProperty("--primary-l", `${theme.l}%`);
  }, [theme]);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_LANG, l);
      localStorage.setItem(LS_CHOSEN, "1");
      setHasChosenLang(true);
    }
  };

  const setTheme = (c: ThemeColor) => {
    setThemeState(c);
    if (typeof window !== "undefined") localStorage.setItem(LS_THEME, c.name);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        theme,
        setTheme,
        langPickerOpen,
        setLangPickerOpen,
        hasChosenLang,
        t: (key: string) => tr(lang, key),
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
