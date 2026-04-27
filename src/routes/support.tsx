import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { useApp } from "@/contexts/AppContext";
import { Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Help & Support — Game Hub" },
      {
        name: "description",
        content: "Need help? Contact our support team — we're here to help.",
      },
      { property: "og:title", content: "Help & Support — Game Hub" },
      {
        property: "og:description",
        content: "Need help? Contact our support team — we're here to help.",
      },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const { t } = useApp();
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div>
      <PageHero title={t("support.title")} desc={t("support.desc")} />
      <section className="mx-auto max-w-2xl px-4 py-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!subject || !message) return;
            setSent(true);
            setSubject("");
            setMessage("");
            setTimeout(() => setSent(false), 4000);
          }}
          className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-card"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold">{t("support.subject")}</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("support.subjectPh")}
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-glow focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">{t("support.message")}</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder={t("support.messagePh")}
              className="w-full resize-none rounded-lg border border-border bg-surface px-4 py-3 text-sm outline-none transition-colors focus:border-glow focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand py-3.5 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.01]"
          >
            <Send className="h-4 w-4" />
            {t("support.submit")}
          </button>
          {sent && (
            <p className="text-center text-sm font-medium text-success animate-fade-up">
              ✓ {t("support.sent")}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
