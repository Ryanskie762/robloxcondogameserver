import { useEffect, useState } from "react";

const BOT_NAMES = [
  "xX_NinjaPro_Xx", "RobloxKing77", "ShadowGamerZ", "PixelHunter", "NoobMaster69",
  "CrimsonFox", "ElectricWolf", "MintyBlox", "ZeroCool", "AceOfBlox",
  "Skye_Walker", "DarkPhoenix", "BluRaven", "TurboTaco", "GhostlyVibe",
  "LavaLuna", "SnowyByte", "RogueBeam", "VortexPlay", "NeonDash",
  "Sparkz_99", "PandaForce", "MysticOwl", "RetroKid", "GalaxyHopper",
];

export type JoinEvent = { id: number; name: string; at: number };

export function useLiveActivity(seed = 0) {
  const [events, setEvents] = useState<JoinEvent[]>([]);
  const [delta, setDelta] = useState(0);

  useEffect(() => {
    let counter = seed * 1000;
    const tick = () => {
      const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      counter += 1;
      setEvents((prev) => [{ id: counter, name, at: Date.now() }, ...prev].slice(0, 5));
      // random walk: mostly join (+1), sometimes leave (-1)
      setDelta((d) => Math.max(-3, Math.min(15, d + (Math.random() < 0.7 ? 1 : -1))));
    };
    tick();
    const iv = setInterval(tick, 2500 + Math.random() * 2500);
    return () => clearInterval(iv);
  }, [seed]);

  return { events, delta };
}
