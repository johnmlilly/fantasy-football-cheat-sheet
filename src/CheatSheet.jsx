import { useState, useMemo, useEffect } from "react";
import { Star, Trash2, Printer, ChevronDown } from "lucide-react";
import { supabase } from "./lib/supabase";
import { getNflPlayers } from "./lib/players";
import { POSITIONS, TIERS, POS_COLOR, TIER_COLOR, tierLabel } from "./lib/constants";
import Header from "./components/Header";
import PlayerForm from "./components/PlayerForm";
import Footer from "./components/Footer";

function HeatMeter({ tier }) {
  const filled = 6 - tier;
  return (
    <div className="flex gap-0.5" title={tierLabel(tier)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-4 rounded-sm ${i <= filled ? TIER_COLOR[tier] : "bg-stone-200"} print:border print:border-stone-400`}
        />
      ))}
    </div>
  );
}

export default function CheatSheet({ userId, onSignOut }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("priority");
  const [starredOnly, setStarredOnly] = useState(false);
  const [nflPlayers, setNflPlayers] = useState([]);
  const [openRow, setOpenRow] = useState(null);

  // Load this user's saved board. RLS already scopes rows to userId server-side;
  // the .eq() here just avoids fetching more than we need.
  useEffect(() => {
    supabase
      .from("players")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setPlayers(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  // Cached NFL player list for the name-search dropdown.
  useEffect(() => {
    getNflPlayers().then(setNflPlayers).catch(() => setNflPlayers([]));
  }, []);

  // PlayerForm owns the form state and passes it up; players is owned here.
  async function addPlayer(form) {
    const { data, error } = await supabase
      .from("players")
      .insert({
        user_id: userId,
        name: form.name.trim(),
        position: form.position,
        team: form.team,
        tier: Number(form.tier),
        starred: false,
      })
      .select()
      .single();
    if (!error && data) setPlayers((p) => [...p, data]);
  }

  async function updatePlayer(id, field, value) {
    const patch = { [field]: field === "tier" ? Number(value) : value };
    setPlayers((p) => p.map((pl) => (pl.id === id ? { ...pl, ...patch } : pl))); // optimistic
    const { error } = await supabase.from("players").update(patch).eq("id", id);
    if (error) {
      // out of sync with the server — reload this user's rows
      const { data } = await supabase.from("players").select("*").eq("user_id", userId);
      setPlayers(data ?? []);
    }
  }

  function toggleStar(id) {
    const current = players.find((p) => p.id === id);
    if (current) updatePlayer(id, "starred", !current.starred);
  }

  async function deletePlayer(id) {
    setPlayers((p) => p.filter((pl) => pl.id !== id)); // optimistic
    await supabase.from("players").delete().eq("id", id);
  }

  const filtered = useMemo(
    () => (starredOnly ? players.filter((p) => p.starred) : players),
    [players, starredOnly]
  );

  const groups = useMemo(() => {
    if (sortMode === "priority") {
      const sorted = [...filtered].sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        if (a.tier !== b.tier) return a.tier - b.tier;
        return a.name.localeCompare(b.name);
      });
      return [{ label: null, items: sorted }];
    }
    return POSITIONS.map((pos) => ({
      label: pos,
      items: filtered
        .filter((p) => p.position === pos)
        .sort((a, b) => {
          if (a.tier !== b.tier) return a.tier - b.tier;
          if (a.starred !== b.starred) return a.starred ? -1 : 1;
          return a.name.localeCompare(b.name);
        }),
    })).filter((g) => g.items.length > 0);
  }, [filtered, sortMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-400 text-sm">
        Loading your board…
      </div>
    );
  }

  return (
    <div className="min-h-full bg-stone-50 print:bg-white p-3 sm:p-6" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
        @media print {
          @page { margin: 0.5in; }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        <Header onSignOut={onSignOut} />
        <PlayerForm nflPlayers={nflPlayers} onAdd={addPlayer} />

        {/* Controls */}
        <div className="bg-stone-100 border-x border-stone-200 px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-stone-500 shrink-0">Sort:</span>
            {/* Segmented control: full width below sm so both options are easy targets. */}
            <div className="flex flex-1 sm:flex-none rounded border border-stone-300 overflow-hidden">
              <button
                onClick={() => setSortMode("priority")}
                aria-pressed={sortMode === "priority"}
                className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs font-medium ${
                  sortMode === "priority" ? "bg-emerald-700 text-white" : "bg-white text-stone-600"
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => setSortMode("position")}
                aria-pressed={sortMode === "position"}
                className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs font-medium border-l border-stone-300 ${
                  sortMode === "position" ? "bg-emerald-700 text-white" : "bg-white text-stone-600"
                }`}
              >
                Position
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <label className="flex items-center gap-1.5 text-sm text-stone-600">
              <input
                type="checkbox"
                checked={starredOnly}
                onChange={(e) => setStarredOnly(e.target.checked)}
                className="accent-emerald-700"
              />
              Starred only
            </label>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium px-3 py-1.5 rounded"
            >
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        <p className="hidden print:block text-xs text-stone-500 px-1 pt-2">
          Sorted by {sortMode === "priority" ? "priority" : "position"}
          {starredOnly ? " · starred only" : ""}
        </p>

        {/* Player list */}
        <div className="bg-white border border-stone-200 print:border-none rounded-b-lg print:rounded-none divide-y divide-stone-100">
          {groups.length === 0 && (
            <div className="px-6 py-10 text-center text-stone-400 text-sm print:hidden">
              No players yet — search and add your first sleeper above.
            </div>
          )}
          {groups.map((group) => (
            <div key={group.label ?? "all"}>
              {group.label && (
                <div className={`px-4 sm:px-6 py-1.5 text-xs font-bold text-white print:text-black print:bg-white print:border-b print:border-stone-300 ${POS_COLOR[group.label]} print:bg-none`}>
                  {group.label}
                </div>
              )}
              {group.items.map((p) => (
                <div key={p.id} className="px-4 sm:px-6 py-2 hover:bg-stone-50 print:py-1 print:break-inside-avoid">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => toggleStar(p.id)}
                      aria-label={p.starred ? `Unstar ${p.name}` : `Star ${p.name}`}
                      className="shrink-0 p-1 -m-1 print:hidden"
                    >
                      <Star size={18} className={p.starred ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
                    </button>
                    <span className="hidden print:inline text-sm shrink-0 w-4">{p.starred ? "★" : ""}</span>

                    {/* Name, position and team come from the Sleeper API — display only. */}
                    <div className="flex-1 min-w-0 px-1 print:px-0">
                      <span className="block text-sm font-medium truncate print:whitespace-normal">{p.name}</span>
                      {/* Below sm the position and team read as metadata under the name
                          rather than competing for width as fixed columns. */}
                      <span className="flex items-center gap-1.5 mt-0.5 text-xs text-stone-500 sm:hidden print:hidden">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${POS_COLOR[p.position]}`} />
                        <span className="font-semibold text-stone-600">{p.position}</span>
                        <span aria-hidden="true">·</span>
                        <span>{p.team}</span>
                      </span>
                    </div>

                    <div className="hidden sm:flex print:flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${POS_COLOR[p.position]} print:hidden`} />
                      <span className="text-xs font-semibold w-8">{p.position}</span>
                    </div>

                    <span className="hidden sm:inline print:inline text-xs w-8 text-stone-600 print:text-black">{p.team}</span>

                    <select
                      value={p.tier}
                      onChange={(e) => updatePlayer(p.id, "tier", e.target.value)}
                      className="hidden sm:block text-xs border border-stone-200 rounded px-1 py-0.5 print:hidden"
                    >
                      {TIERS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <span className="hidden print:inline text-xs w-24">{tierLabel(p.tier)}</span>

                    <HeatMeter tier={p.tier} />

                    <button
                      onClick={() => deletePlayer(p.id)}
                      aria-label={`Remove ${p.name}`}
                      className="hidden sm:block shrink-0 text-stone-300 hover:text-red-500 print:hidden"
                    >
                      <Trash2 size={16} />
                    </button>

                    {/* Below sm the controls live behind this toggle so the row stays one line. */}
                    <button
                      onClick={() => setOpenRow(openRow === p.id ? null : p.id)}
                      aria-expanded={openRow === p.id}
                      aria-label={`${openRow === p.id ? "Hide" : "Show"} controls for ${p.name}`}
                      className="sm:hidden shrink-0 p-1 -m-1 text-stone-400 print:hidden"
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${openRow === p.id ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>

                  {openRow === p.id && (
                    <div className="sm:hidden flex items-center gap-2 pl-8 pr-1 pt-2 pb-1 print:hidden">
                      <label className="flex-1 flex items-center gap-2 text-xs text-stone-500">
                        Priority
                        <select
                          value={p.tier}
                          onChange={(e) => updatePlayer(p.id, "tier", e.target.value)}
                          className="flex-1 text-xs border border-stone-300 rounded px-2 py-1.5"
                        >
                          {TIERS.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() => deletePlayer(p.id)}
                        aria-label={`Remove ${p.name}`}
                        className="flex items-center gap-1 text-xs text-stone-500 border border-stone-300 rounded px-2 py-1.5 hover:text-red-600 hover:border-red-300"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

       <Footer />
      </div>
    </div>
  );
}
