import { TIERS } from "../lib/constants";
import { getNflPlayers } from "../lib/players";
import { Plus } from "lucide-react";
import { useState, useMemo, useEffect } from "react";

export default function PlayerForm({ onAdd }) {
  // sleeperId is set only by picking a search result; it's the gate on adding.
  const [form, setForm] = useState({ name: "", position: "", team: "", tier: 3, sleeperId: null });
  const [showMatches, setShowMatches] = useState(false);
  const [nflPlayers, setNflPlayers] = useState([]);

  // Cached NFL player list for the name-search dropdown.
  useEffect(() => {
    getNflPlayers().then(setNflPlayers).catch(() => setNflPlayers([]));
  }, []);

  const matches = useMemo(() => {
    if (form.name.trim().length < 2) return [];
    const q = form.name.toLowerCase();
    return nflPlayers
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [form.name, nflPlayers]);

  function pickMatch(p) {
    setForm((f) => ({
      ...f,
      name: p.name,
      position: p.position,
      team: p.team,
      sleeperId: p.id,
    }));
    setShowMatches(false);
  }

  async function handleSubmit() {
    // Name/position/team are API-sourced, so only a picked search result can be added.
    if (!form.sleeperId) return;
    await onAdd(form);
    setForm({ name: "", position: "", team: "", tier: 3, sleeperId: null });
    setShowMatches(false);
  }

    return (
      <div className="bg-white border-x border-stone-200 px-4 sm:px-6 py-4 print:hidden">
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 basis-40 relative">
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Player name
            </label>
            <input
              value={form.name}
              onChange={(e) => {
                // Editing the name invalidates any previous pick.
                setForm({
                  ...form,
                  name: e.target.value,
                  position: "",
                  team: "",
                  sleeperId: null,
                });
                setShowMatches(true);
              }}
              onFocus={() => setShowMatches(true)}
              onBlur={() => setTimeout(() => setShowMatches(false), 150)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="Search NFL players…"
              className="w-full border border-stone-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {showMatches && matches.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 bg-white border border-stone-200 rounded shadow-lg mt-1 max-h-56 overflow-auto">
                {matches.map((m) => (
                  <button
                    key={m.id}
                    onMouseDown={() => pickMatch(m)}
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-emerald-50 flex items-center justify-between">
                    <span>{m.name}</span>
                    <span className="text-xs text-stone-400">
                      {m.position} · {m.team}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Filled from the picked search result — not user-editable. */}
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Pos
            </label>
            <div className="border border-stone-200 bg-stone-50 rounded px-2 py-1.5 text-sm text-center w-14 text-stone-600">
              {form.position || "—"}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Team
            </label>
            <div className="border border-stone-200 bg-stone-50 rounded px-2 py-1.5 text-sm text-center w-16 text-stone-600">
              {form.team || "—"}
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Priority
            </label>
            <select
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value })}
              className="w-full sm:w-auto border border-stone-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600">
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!form.sleeperId}
            className={`w-full sm:w-auto flex items-center justify-center gap-1 text-white text-sm font-medium px-3 py-1.5 rounded ${
              form.sleeperId
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-stone-300 cursor-not-allowed"
            }`}>
            <Plus size={16} /> Add
          </button>
        </div>
        {form.name.trim() && !form.sleeperId && (
          <p className="text-xs text-stone-500 mt-2">
            Pick a player from the search results to add them.
          </p>
        )}
      </div>
    );
}