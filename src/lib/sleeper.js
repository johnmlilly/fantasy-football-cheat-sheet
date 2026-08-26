// Free, keyless NFL player data from Sleeper (api.sleeper.app).
// The full player map is ~14MB. This filter runs at the edge (Worker) or in the
// Vite dev middleware, so browsers only ever see the trimmed list (~67KB).
const SLEEPER_URL = "https://api.sleeper.app/v1/players/nfl";
const FANTASY_POS = new Set(["QB", "RB", "WR", "TE", "K", "DEF"]);

export async function fetchFantasyPlayers() {
  const res = await fetch(SLEEPER_URL);
  if (!res.ok) throw new Error(`Sleeper API error: ${res.status}`);
  const raw = await res.json();

  return Object.values(raw)
    .filter((p) => p && FANTASY_POS.has(p.position) && p.team && p.full_name)
    .map((p) => ({
      id: p.player_id,
      name: p.full_name,
      position: p.position,
      team: p.team,
    }));
}
