import { LogOut } from "lucide-react";
import { TIERS, TIER_COLOR } from "../lib/constants";

export default function Header({ onSignOut }) {
  return (
    <div className="bg-emerald-900 print:bg-white print:border-b print:border-stone-400 rounded-t-lg print:rounded-none px-4 sm:px-6 py-4 flex items-center justify-between flex-wrap gap-2">
      <div>
        <h1 className="text-2xl sm:text-3xl text-white print:text-black tracking-wide" style={{ fontFamily: "Oswald, sans-serif" }}>
          DRAFT CHEAT SHEET
        </h1>
        <p className="text-emerald-300 print:text-stone-600 text-sm">Sleeper priority board</p>
      </div>
      <div className="flex items-center gap-3 print:hidden">
        <div className="flex items-center gap-2 flex-wrap">
          {TIERS.map((t) => (
            <div key={t.value} className="flex items-center gap-1 text-xs text-emerald-200">
              <div className={`w-2 h-2 rounded-full ${TIER_COLOR[t.value]}`} />
              {t.label}
            </div>
          ))}
        </div>
        <button onClick={onSignOut} className="flex items-center gap-1 text-xs text-emerald-200 hover:text-white">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </div>
  );
}
