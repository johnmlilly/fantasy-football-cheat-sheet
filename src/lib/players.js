// Fantasy-relevant NFL players, filtered server-side by the Worker at
// /api/players (see worker/index.js). Cached locally so repeat visits within
// the day skip the network entirely.
const CACHE_KEY = "nfl_players_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export async function getNflPlayers() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.players;
    }
  } catch {
    // corrupt cache, fall through to refetch
  }

  const res = await fetch("/api/players");
  if (!res.ok) throw new Error(`Player API error: ${res.status}`);
  const players = await res.json();

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), players }));
  } catch {
    // storage full or unavailable — non-fatal, just won't cache
  }

  return players;
}
