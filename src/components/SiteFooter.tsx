import { Link } from "@tanstack/react-router";
import { Gamepad2, MessagesSquare } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SiteFooter() {
  const { t } = useApp();
  const [discordUrl, setDiscordUrl] = useState("");

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "discord_url")
      .maybeSingle()
      .then(({ data }) => setDiscordUrl(data?.value ?? ""));
  }, []);
  return (
    <footer className="mt-20 border-t border-border/50 bg-surface/50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">
                {t("nav.brand").split(" ")[0]}
                <span className="text-gradient-brand">
                  {" "}
                  {t("nav.brand").split(" ").slice(1).join(" ")}
                </span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.legalDesc")}</p>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-bold tracking-wider text-primary">
              {t("footer.quick")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/games" className="hover:text-foreground">
                  {t("card.games.title")}
                </Link>
              </li>
              <li>
                <Link to="/private-server" className="hover:text-foreground">
                  {t("card.server.title")}
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-foreground">
                  {t("card.settings.title")}
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-foreground">
                  {t("card.support.title")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-bold tracking-wider text-primary">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="hover:text-foreground" href="#">
                  {t("footer.terms")}
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#">
                  {t("footer.privacy")}
                </a>
              </li>
              <li>
                <a className="hover:text-foreground" href="#">
                  {t("footer.refund")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-display text-sm font-bold tracking-wider text-primary">
              {t("footer.community")}
            </h4>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              <MessagesSquare className="h-4 w-4" />
              {t("footer.discord")}
            </a>
          </div>
        </div>
        <div className="mt-10 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
          {t("footer.copy")}
        </div>
      </div>
    </footer>
  );
}
