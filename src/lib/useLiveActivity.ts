import { useEffect, useState } from "react";

// Curated list of real public Roblox user IDs paired with their usernames.
// Headshot URL uses Roblox's public thumbnail endpoint (CORS-safe for <img>).
const ROBLOX_BOTS: { id: number; name: string }[] = [
  { id: 1, name: "Roblox" },
  { id: 16, name: "erik.cassel" },
  { id: 156, name: "builderman" },
  { id: 261, name: "Shedletsky" },
  { id: 6809050, name: "Stickmasterluke" },
  { id: 14538655, name: "TheGamer101" },
  { id: 32660369, name: "Asimo3089" },
  { id: 39413747, name: "Badcc" },
  { id: 13268404, name: "KreekCraft" },
  { id: 109313754, name: "DenisDaily" },
  { id: 48103520, name: "Flamingo" },
  { id: 21557, name: "Telamon" },
  { id: 13881122, name: "InceptionTime" },
  { id: 119281707, name: "Tofuu" },
  { id: 30314903, name: "Tanqr" },
  { id: 261464730, name: "PrestonPlayz" },
  { id: 1019470, name: "Merely" },
  { id: 2266732, name: "Seranok" },
  { id: 16575987, name: "Roblox_Player" },
  { id: 90243866, name: "DanTDM" },
];

export type JoinEvent = {
  id: number;
  name: string;
  userId: number;
  avatarUrl: string;
  at: number;
};

function headshotUrl(userId: number) {
  return `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`;
}

export function useLiveActivity(seed = 0) {
  const [events, setEvents] = useState<JoinEvent[]>([]);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    let counter = seed * 1000;
    const tick = () => {
      const pick = ROBLOX_BOTS[Math.floor(Math.random() * ROBLOX_BOTS.length)];
      counter += 1;
      setEvents((prev) =>
        [
          {
            id: counter,
            name: pick.name,
            userId: pick.id,
            avatarUrl: headshotUrl(pick.id),
            at: Date.now(),
          },
          ...prev,
        ].slice(0, 6),
      );
      setDelta((d) => Math.max(-3, Math.min(15, d + (Math.random() < 0.7 ? 1 : -1))));
    };
    tick();
    const iv = setInterval(tick, 2500 + Math.random() * 2500);
    return () => clearInterval(iv);
  }, [seed]);

  return { events, delta };
}
