const PRESETS = [
  'Drive traffic for summer sale',
  'Launch new product drop',
  'Increase brand awareness',
  'Promote limited stock',
  'Re-engage existing customers',
]

export default function ObjectiveInput({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        Marketing Objective
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="e.g. Drive traffic for our summer sale, highlight fitment compatibility"
        rows={3}
        className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 text-sm resize-none
                   focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed
                   placeholder:text-zinc-600"
      />
      <div className="flex flex-wrap gap-2 mt-1">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            disabled={disabled}
            className="text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-400
                       hover:border-red-500 hover:text-red-400 transition-colors disabled:opacity-40"
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  )
}
