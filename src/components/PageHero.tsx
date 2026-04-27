import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

type Props = { title: string; desc: string };

export function PageHero({ title, desc }: Props) {
  const { t } = useApp();
  return (
    <section className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 bg-glow" />
      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          <span className="text-gradient-brand">{title}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{desc}</p>
        <Link
          to="/"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface/60 px-4 py-3 font-medium text-muted-foreground transition-colors hover:border-glow hover:text-foreground md:w-auto md:px-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("back")}
        </Link>
      </div>
    </section>
  );
}
