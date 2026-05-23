import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLiveActivity } from "@/lib/useLiveActivity";

type Game = { id: number; name: string; online: boolean; players: number };
type Avatar = { id: number };

export function useGlobalPlayers() {
  const [games, setGames] = useState<Game[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { delta } = useLiveActivity(99);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("community_games").select("id,name,online,players").order("sort_order", { ascending: true }),
      supabase.from("private_server_avatars").select("id").order("sort_order", { ascending: true }),
    ]).then(([gamesRes, avatarsRes]) => {
      if (cancelled) return;
      setGames((gamesRes.data as Game[]) ?? []);
      setAvatars((avatarsRes.data as Avatar[]) ?? []);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, []);

  const total = useMemo(() => {
    const communityTotal = games
      .filter((g) => g.online)
      .reduce((sum, g) => sum + Math.max(0, g.players + ((g.name.length * 3) % 7) - 3), 0);
    const privateTotal = Math.min(12, avatars.length + Math.max(0, delta));
    return communityTotal + privateTotal;
  }, [games, avatars, delta]);

  return { total, loaded };
}
