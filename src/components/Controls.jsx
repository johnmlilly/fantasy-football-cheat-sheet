import { Printer } from "lucide-react";

export default function Controls({ sortMode, onSortChange, starredOnly, onStarredOnlyChange }) {
  return (
    <div className="bg-stone-100 border-x border-stone-200 px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 print:hidden">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-stone-500 shrink-0">Sort:</span>
        {/* Segmented control: full width below sm so both options are easy targets. */}
        <div className="flex flex-1 sm:flex-none rounded border border-stone-300 overflow-hidden">
          <button
            onClick={() => onSortChange("priority")}
            aria-pressed={sortMode === "priority"}
            className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs font-medium ${
              sortMode === "priority"
                ? "bg-emerald-700 text-white"
                : "bg-white text-stone-600"
            }`}>
            Priority
          </button>
          <button
            onClick={() => onSortChange("position")}
            aria-pressed={sortMode === "position"}
            className={`flex-1 sm:flex-none px-3 py-1.5 sm:py-1 text-xs font-medium border-l border-stone-300 ${
              sortMode === "position"
                ? "bg-emerald-700 text-white"
                : "bg-white text-stone-600"
            }`}>
            Position
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-start gap-3">
        <label className="flex items-center gap-1.5 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={starredOnly}
            onChange={(e) => onStarredOnlyChange(e.target.checked)}
            className="accent-emerald-700"
          />
          Starred only
        </label>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium px-3 py-1.5 rounded">
          <Printer size={16} /> Print
        </button>
      </div>

      <p className="hidden print:block text-xs text-stone-500 px-1 pt-2">
        Sorted by {sortMode === "priority" ? "priority" : "position"}
        {starredOnly ? " · starred only" : ""}
      </p>
    </div>
  );
}
