import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Tables } from "@/integrations/supabase/types";
import {
  Plus,
  Trash2,
  Save,
  LogOut,
  Loader2,
  GripVertical,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Game Hub" },
      { name: "description", content: "Manage community games." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Game = Tables<"community_games">;
type Avatar = Tables<"private_server_avatars">;

const gameSchema = z.object({
  name: z.string().trim().min(1, "Name required").max(100),
  link: z.string().trim().max(500),
  display_text: z.string().trim().max(200),
  players: z.number().int().min(0).max(100000),
  online: z.boolean(),
  sort_order: z.number().int().min(0).max(9999),
});

function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<{ id: string; msg: string } | null>(null);
  const [discordUrl, setDiscordUrl] = useState("");
  const [discordSaving, setDiscordSaving] = useState(false);
  const [discordMsg, setDiscordMsg] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [serverUrl, setServerUrl] = useState("");
  const [serverSaving, setServerSaving] = useState(false);
  const [serverMsg, setServerMsg] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [serverName, setServerName] = useState("");
  const [serverNameSaving, setServerNameSaving] = useState(false);
  const [serverNameMsg, setServerNameMsg] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [avatarSavingId, setAvatarSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  const loadGames = async () => {
    setLoadingGames(true);
    const { data } = await supabase
      .from("community_games")
      .select("*")
      .order("sort_order", { ascending: true });
    setGames(data ?? []);
    setLoadingGames(false);
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key,value")
      .in("key", ["discord_url", "private_server_url", "private_server_name"]);
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    setDiscordUrl(map["discord_url"] ?? "");
    setServerUrl(map["private_server_url"] ?? "");
    setServerName(map["private_server_name"] ?? "");
  };

  const saveDiscord = async () => {
    setDiscordMsg(null);
    setDiscordSaving(true);
    const trimmed = discordUrl.trim().slice(0, 500);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "discord_url", value: trimmed }, { onConflict: "key" });
    setDiscordSaving(false);
    if (error) setDiscordMsg({ type: "err", msg: error.message });
    else setDiscordMsg({ type: "ok", msg: "Saved!" });
  };

  const saveServerUrl = async () => {
    setServerMsg(null);
    setServerSaving(true);
    const trimmed = serverUrl.trim().slice(0, 500);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "private_server_url", value: trimmed }, { onConflict: "key" });
    setServerSaving(false);
    if (error) setServerMsg({ type: "err", msg: error.message });
    else setServerMsg({ type: "ok", msg: "Saved!" });
  };

  const saveServerName = async () => {
    setServerNameMsg(null);
    setServerNameSaving(true);
    const trimmed = serverName.trim().slice(0, 100);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "private_server_name", value: trimmed }, { onConflict: "key" });
    setServerNameSaving(false);
    if (error) setServerNameMsg({ type: "err", msg: error.message });
    else setServerNameMsg({ type: "ok", msg: "Saved!" });
  };

  useEffect(() => {
    if (isAdmin) {
      loadGames();
      loadSettings();
      loadAvatars();
    }
  }, [isAdmin]);

  const loadAvatars = async () => {
    const { data } = await supabase
      .from("private_server_avatars")
      .select("*")
      .order("sort_order", { ascending: true });
    setAvatars(data ?? []);
  };

  const updateAvatarLocal = (id: string, patch: Partial<Avatar>) => {
    setAvatars((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  };

  const saveAvatar = async (a: Avatar) => {
    setAvatarSavingId(a.id);
    const { error } = await supabase
      .from("private_server_avatars")
      .update({
        image_url: (a.image_url ?? "").trim().slice(0, 500),
        label: (a.label ?? "").trim().slice(0, 50),
        sort_order: a.sort_order,
      })
      .eq("id", a.id);
    setAvatarSavingId(null);
    if (error) alert(error.message);
  };

  const addAvatar = async () => {
    const nextOrder = (avatars[avatars.length - 1]?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("private_server_avatars")
      .insert({ image_url: "", label: "", sort_order: nextOrder })
      .select()
      .single();
    if (error) return alert(error.message);
    if (data) setAvatars((prev) => [...prev, data]);
  };

  const deleteAvatar = async (id: string) => {
    if (!confirm("Delete this avatar?")) return;
    const { error } = await supabase.from("private_server_avatars").delete().eq("id", id);
    if (error) return alert(error.message);
    setAvatars((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold">Not authorized</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account ({user.email}) doesn't have admin access. Ask the project owner to grant you the
          <code className="mx-1 rounded bg-secondary px-1.5 py-0.5 text-xs">admin</code>
          role.
        </p>
        <button
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth" });
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-glow"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    );
  }

  const updateLocal = (id: string, patch: Partial<Game>) => {
    setGames((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const saveGame = async (g: Game) => {
    setErrorId(null);
    const parsed = gameSchema.safeParse({
      name: g.name,
      link: g.link,
      display_text: g.display_text ?? "",
      players: g.players,
      online: g.online,
      sort_order: g.sort_order,
    });
    if (!parsed.success) {
      setErrorId({ id: g.id, msg: parsed.error.issues[0].message });
      return;
    }
    setSavingId(g.id);
    const { error } = await supabase
      .from("community_games")
      .update(parsed.data)
      .eq("id", g.id);
    setSavingId(null);
    if (error) setErrorId({ id: g.id, msg: error.message });
  };

  const deleteGame = async (id: string) => {
    if (!confirm("Delete this game?")) return;
    const { error } = await supabase.from("community_games").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setGames((prev) => prev.filter((g) => g.id !== id));
  };

  const addGame = async () => {
    const nextOrder = (games[games.length - 1]?.sort_order ?? 0) + 1;
    const { data, error } = await supabase
      .from("community_games")
      .insert({
        name: "New Game",
        link: "",
        display_text: "",
        players: 0,
        online: false,
        sort_order: nextOrder,
      })
      .select()
      .single();
    if (error) {
      alert(error.message);
      return;
    }
    if (data) setGames((prev) => [...prev, data]);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            <span className="text-gradient-brand">Admin Panel</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Signed in as <strong className="text-foreground">{user.email}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/games"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-glow"
          >
            <ExternalLink className="h-4 w-4" /> View public page
          </Link>
          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-glow"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="mb-1 font-display text-xl font-bold">Site Settings</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Manage links shown across the public site.
        </p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">
            Discord server link
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={discordUrl}
              maxLength={500}
              onChange={(e) => setDiscordUrl(e.target.value)}
              placeholder="https://discord.gg/your-invite"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={saveDiscord}
              disabled={discordSaving}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {discordSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        </label>
        {discordMsg && (
          <p
            className={`mt-2 text-xs ${
              discordMsg.type === "ok" ? "text-success" : "text-destructive"
            }`}
          >
            {discordMsg.type === "ok" ? "✓" : "⚠"} {discordMsg.msg}
          </p>
        )}

        <label className="mt-4 block">
          <span className="mb-1 block text-xs font-semibold text-muted-foreground">
            Private Server "Enter Server" link
          </span>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={serverUrl}
              maxLength={500}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://www.roblox.com/games/..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30"
            />
            <button
              onClick={saveServerUrl}
              disabled={serverSaving}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
            >
              {serverSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        </label>
        {serverMsg && (
          <p
            className={`mt-2 text-xs ${
              serverMsg.type === "ok" ? "text-success" : "text-destructive"
            }`}
          >
            {serverMsg.type === "ok" ? "✓" : "⚠"} {serverMsg.msg}
          </p>
        )}
      </div>

      <div className="mb-8 rounded-xl border border-border bg-card p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Private Server Avatars</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Roblox profile images shown on the Private Server page. Paste an image URL (e.g. your Roblox headshot URL).
            </p>
          </div>
          <button
            onClick={addAvatar}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
          >
            <Plus className="h-4 w-4" /> Add avatar
          </button>
        </div>
        <div className="space-y-2">
          {avatars.map((a, i) => (
            <div key={a.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface/40 p-3 md:flex-row md:items-center">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-xs font-bold">
                {a.image_url ? (
                  <img src={a.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  a.label || String.fromCharCode(65 + i)
                )}
              </div>
              <input
                value={a.image_url}
                maxLength={500}
                onChange={(e) => updateAvatarLocal(a.id, { image_url: e.target.value })}
                placeholder="https://... (Roblox avatar image URL)"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30"
              />
              <input
                value={a.label}
                maxLength={50}
                onChange={(e) => updateAvatarLocal(a.id, { label: e.target.value })}
                placeholder="Label / fallback"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30 md:w-36"
              />
              <input
                type="number"
                min={0}
                value={a.sort_order}
                onChange={(e) => updateAvatarLocal(a.id, { sort_order: Number(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30 md:w-20"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveAvatar(a)}
                  disabled={avatarSavingId === a.id}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
                >
                  {avatarSavingId === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Save
                </button>
                <button
                  onClick={() => deleteAvatar(a.id)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {avatars.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No avatars yet. Click <strong>Add avatar</strong> to create one.
            </p>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">Community Games</h2>
        <button
          onClick={addGame}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" /> Add game
        </button>
      </div>

      {loadingGames ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {games.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-border bg-card p-4 shadow-card"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start">
                <GripVertical className="hidden h-5 w-5 shrink-0 self-center text-muted-foreground md:block" />
                <div className="grid flex-1 gap-3 md:grid-cols-12">
                  <label className="md:col-span-3">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Name
                    </span>
                    <input
                      value={g.name}
                      maxLength={100}
                      onChange={(e) => updateLocal(g.id, { name: e.target.value })}
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <label className="md:col-span-4">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Link (URL)
                    </span>
                    <input
                      value={g.link}
                      maxLength={500}
                      onChange={(e) => updateLocal(g.id, { link: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <label className="md:col-span-3">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Display text URL
                    </span>
                    <input
                      value={g.display_text ?? ""}
                      maxLength={200}
                      onChange={(e) => updateLocal(g.id, { display_text: e.target.value })}
                      placeholder="e.g. Click to play"
                      title="Friendly text shown under the game name (instead of the raw URL)"
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <label className="md:col-span-1">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Order
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={g.sort_order}
                      onChange={(e) =>
                        updateLocal(g.id, { sort_order: Number(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <label className="md:col-span-1">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Players
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={g.players}
                      onChange={(e) =>
                        updateLocal(g.id, { players: Number(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-glow focus:ring-2 focus:ring-primary/30"
                    />
                  </label>
                  <label className="flex flex-col md:col-span-1">
                    <span className="mb-1 block text-xs font-semibold text-muted-foreground">
                      Online
                    </span>
                    <button
                      type="button"
                      onClick={() => updateLocal(g.id, { online: !g.online })}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                        g.online
                          ? "border-success/40 bg-success/15 text-success"
                          : "border-destructive/40 bg-destructive/15 text-destructive"
                      }`}
                    >
                      {g.online ? "ON" : "OFF"}
                    </button>
                  </label>
                </div>
                <div className="flex gap-2 md:flex-col">
                  <button
                    onClick={() => saveGame(g)}
                    disabled={savingId === g.id}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-brand px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow disabled:opacity-60 md:flex-none"
                  >
                    {savingId === g.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={() => deleteGame(g.id)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 md:flex-none"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
              {errorId?.id === g.id && (
                <p className="mt-2 text-xs text-destructive">⚠ {errorId.msg}</p>
              )}
            </div>
          ))}
          {games.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No games yet. Click <strong>Add game</strong> to create one.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
