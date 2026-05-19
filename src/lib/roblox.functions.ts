import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MIN_DAYS = 50;

export const verifyRobloxAge = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        username: z
          .string()
          .trim()
          .min(3)
          .max(20)
          .regex(/^[a-zA-Z0-9_]+$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    // Resolve username -> userId
    const lookup = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usernames: [data.username],
        excludeBannedUsers: false,
      }),
    });

    if (!lookup.ok) {
      return { ok: false as const, error: "Could not reach Roblox. Try again." };
    }

    const lookupJson = (await lookup.json()) as {
      data?: Array<{ id: number; name: string }>;
    };
    const user = lookupJson.data?.[0];
    if (!user) {
      return { ok: false as const, error: "Roblox username not found." };
    }

    // Fetch profile for created date
    const profile = await fetch(`https://users.roblox.com/v1/users/${user.id}`);
    if (!profile.ok) {
      return { ok: false as const, error: "Could not fetch Roblox profile." };
    }
    const profileJson = (await profile.json()) as { created?: string };
    if (!profileJson.created) {
      return { ok: false as const, error: "Roblox profile has no created date." };
    }

    const createdAt = new Date(profileJson.created);
    const ageDays = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (ageDays < MIN_DAYS) {
      return {
        ok: false as const,
        error: `Your Roblox account is ${ageDays} day${ageDays === 1 ? "" : "s"} old. You need at least ${MIN_DAYS} days to play.`,
        ageDays,
      };
    }

    return {
      ok: true as const,
      username: user.name,
      userId: user.id,
      ageDays,
    };
  });
