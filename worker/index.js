import { fetchFantasyPlayers } from "../src/lib/sleeper.js";

const CACHE_TTL_S = 24 * 60 * 60; // 24h — Sleeper updates roughly daily

// Only /api/* reaches this Worker (see run_worker_first in wrangler.jsonc);
// everything else is served straight from the assets binding.
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/players") return env.ASSETS.fetch(request);
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405, headers: { allow: "GET" } });
    }

    const cache = caches.default;
    const hit = await cache.match(request);
    if (hit) return hit;

    try {
      const players = await fetchFantasyPlayers();
      const res = Response.json(players, {
        headers: { "cache-control": `public, max-age=${CACHE_TTL_S}` },
      });
      ctx.waitUntil(cache.put(request, res.clone()));
      return res;
    } catch (err) {
      // Surfaced to the client so an empty dropdown is distinguishable from a failure.
      return Response.json({ error: String(err.message ?? err) }, { status: 502 });
    }
  },
};
