export default function ProductSelector({ products, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        Product
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 text-sm
                   focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed
                   appearance-none cursor-pointer"
      >
        <option value="">-- Select a product --</option>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} {p.brand ? `· ${p.brand}` : ''} {p.category ? `(${p.category})` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
