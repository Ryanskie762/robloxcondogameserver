import { useEffect, useState } from "react";
import { useLiveActivity, type JoinEvent } from "@/lib/useLiveActivity";

type Toast = JoinEvent & { context: string };

const CONTEXTS = ["joined community games", "joined private server"];

export function LiveJoinToasts({ seed = 7, context }: { seed?: number; context?: string }) {
  const { events } = useLiveActivity(seed);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!events.length) return;
    const latest = events[0];
    setToasts((prev) => {
      if (prev.some((t) => t.id === latest.id)) return prev;
      const ctx = context ?? CONTEXTS[latest.id % CONTEXTS.length];
      return [{ ...latest, context: ctx }, ...prev].slice(0, 2);
    });
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== latest.id));
    }, 5000);
    return () => clearTimeout(timer);
  }, [events, context]);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex flex-col-reverse gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-border bg-card/95 px-3 py-2 shadow-card backdrop-blur animate-in slide-in-from-left-4 fade-in"
        >
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-[11px]">
            🎮
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
          </span>
          <div className="text-xs leading-tight">
            <div className="font-semibold text-foreground">@{t.name}</div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-success" />
              {t.context}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
