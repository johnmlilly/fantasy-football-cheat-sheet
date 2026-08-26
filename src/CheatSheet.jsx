import { useState, useMemo, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { POSITIONS } from "./lib/constants";
import Header from "./components/Header";
import PlayerForm from "./components/PlayerForm";
import Controls from "./components/Controls";
import PlayerList from "./components/PlayerList";
import Footer from "./components/Footer";

export default function CheatSheet({ userId, onSignOut }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("priority");
  const [starredOnly, setStarredOnly] = useState(false);

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
        <PlayerForm onAdd={addPlayer} />

        <Controls
          sortMode={sortMode}
          onSortChange={setSortMode}
          starredOnly={starredOnly}
          onStarredOnlyChange={setStarredOnly}
        />
        
        {loading ? (
          <div className="bg-white border border-stone-200 rounded-b-lg px-6 py-10 text-center text-stone-400 text-sm">
            Loading your board…
          </div>
        ) : (
          <PlayerList
            groups={groups}
            onToggleStar={toggleStar}
            onUpdatePlayer={updatePlayer}
            onDeletePlayer={deletePlayer}
          />
        )}

        <Footer />
      </div>
    </div>
  );
}
