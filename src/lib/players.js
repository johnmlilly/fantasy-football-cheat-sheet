// Free, keyless NFL player data from Sleeper (api.sleeper.app).
// Their full player map is ~5MB and updates roughly daily, so cache it locally.
const FANTASY_POS = new Set(["QB", "RB", "WR", "TE", "K", "DEF"]);
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

  const res = await fetch("https://api.sleeper.app/v1/players/nfl");
  if (!res.ok) throw new Error(`Sleeper API error: ${res.status}`);
  const raw = await res.json();

  const players = Object.values(raw)
    .filter((p) => p && FANTASY_POS.has(p.position) && p.team && p.full_name)
    .map((p) => ({
      id: p.player_id,
      name: p.full_name,
      position: p.position,
      team: p.team,
    }));

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), players }));
  } catch {
    // storage full or unavailable — non-fatal, just won't cache
  }

  return players;
}
