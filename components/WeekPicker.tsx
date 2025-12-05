type Props = {
  value: number;
  onChange: (v: number) => void;
  liveWeek?: number | null;
};

export function WeekPicker({ value, onChange, liveWeek }: Props) {
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-semibold text-slate-700">Week</label>
      <select
        className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm focus:border-amber-500 focus:outline-none"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {weeks.map((w) => (
          <option key={w} value={w}>
            {w === liveWeek ? `Week ${w} (live)` : `Week ${w}`}
          </option>
        ))}
      </select>
    </div>
  );
}

