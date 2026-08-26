export const POSITIONS = ["QB", "RB", "WR", "TE", "K", "DEF"];

export const TIERS = [
  { value: 1, label: "Must Draft" },
  { value: 2, label: "Strong Sleeper" },
  { value: 3, label: "Sleeper" },
  { value: 4, label: "Deep Sleeper" },
  { value: 5, label: "Late Dart" },
];

export const POS_COLOR = {
  QB: "bg-violet-600",
  RB: "bg-emerald-600",
  WR: "bg-sky-600",
  TE: "bg-orange-600",
  K: "bg-slate-500",
  DEF: "bg-indigo-700",
};

export const TIER_COLOR = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-amber-500",
  4: "bg-lime-500",
  5: "bg-slate-400",
};

export function tierLabel(v) {
  return TIERS.find((t) => t.value === v)?.label ?? "";
}
