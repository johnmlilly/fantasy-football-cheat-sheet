import { useState } from "react";
import { Star, Trash2, ChevronDown } from "lucide-react";
import { POS_COLOR, TIER_COLOR, TIERS, tierLabel } from "../lib/constants";

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

export default function PlayerList({ groups, onToggleStar, onUpdatePlayer, onDeletePlayer }) {
  // Which row has its mobile controls open — nothing outside this list cares.
  const [openRow, setOpenRow] = useState(null);

  return (
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
                  onClick={() => onToggleStar(p.id)}
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
                  onChange={(e) => onUpdatePlayer(p.id, "tier", e.target.value)}
                  className="hidden sm:block text-xs border border-stone-200 rounded px-1 py-0.5 print:hidden"
                >
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <span className="hidden print:inline text-xs w-24">{tierLabel(p.tier)}</span>

                <HeatMeter tier={p.tier} />

                <button
                  onClick={() => onDeletePlayer(p.id)}
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
                      onChange={(e) => onUpdatePlayer(p.id, "tier", e.target.value)}
                      className="flex-1 text-xs border border-stone-300 rounded px-2 py-1.5"
                    >
                      {TIERS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={() => onDeletePlayer(p.id)}
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
  );
}
