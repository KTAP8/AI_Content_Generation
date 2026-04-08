import { useEffect, useState } from 'react'
import { getGuidelines, saveGuideline, getProducts, createProduct, deleteProduct } from '../api/client'

// ─── Brand Guidelines Tab ───────────────────────────────────────────────────

function GuidelinesTab() {
  const [guidelines, setGuidelines] = useState([])
  const [saving, setSaving] = useState({})
  const [localValues, setLocalValues] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    getGuidelines()
      .then((data) => {
        setGuidelines(data)
        const vals = {}
        data.forEach((g) => { vals[g.key] = g.value })
        setLocalValues(vals)
      })
      .catch(() => setError('Failed to load brand guidelines'))
  }, [])

  const handleSave = async (key) => {
    setSaving((s) => ({ ...s, [key]: true }))
    try {
      await saveGuideline(key, localValues[key])
    } catch {
      setError(`Failed to save "${key}"`)
    } finally {
      setSaving((s) => ({ ...s, [key]: false }))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-zinc-500">
        These guidelines are injected into every AI generation. Edit and save each row individually.
      </p>
      {error && (
        <div className="p-3 bg-red-950 border border-red-800 rounded-lg text-sm text-red-300">{error}</div>
      )}
      {guidelines.map((g) => (
        <div key={g.key} className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{g.key}</label>
          <div className="flex gap-3">
            <textarea
              rows={2}
              value={localValues[g.key] ?? ''}
              onChange={(e) => setLocalValues((v) => ({ ...v, [g.key]: e.target.value }))}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-100 text-sm
                         resize-none focus:outline-none focus:border-red-500"
            />
            <button
              onClick={() => handleSave(g.key)}
              disabled={saving[g.key]}
              className="self-start px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50
                         text-zinc-200 text-sm rounded-lg transition-colors shrink-0"
            >
              {saving[g.key] ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Products Tab ────────────────────────────────────────────────────────────

const EMPTY_PRODUCT = { name: '', category: '', brand: '', description: '', sku: '' }

function ProductsTab() {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState(null)

  const load = () => getProducts().then(setProducts).catch(() => setError('Failed to load products'))
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setAdding(true)
    try {
      await createProduct(form)
      setForm(EMPTY_PRODUCT)
      setShowForm(false)
      await load()
    } catch {
      setError('Failed to create product')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      await load()
    } catch {
      setError('Failed to delete product')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="p-3 bg-red-950 border border-red-800 rounded-lg text-sm text-red-300">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">{products.length} products in catalogue</p>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-xs px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            {['name', 'brand', 'category', 'sku'].map((field) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-xs text-zinc-500 capitalize">{field}</label>
                <input
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={field === 'name'}
                  placeholder={field === 'category' ? 'wheels, exhaust, suspension...' : ''}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100
                             focus:outline-none focus:border-red-500"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-500">Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100
                         resize-none focus:outline-none focus:border-red-500"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="self-start px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50
                       text-white text-sm rounded-lg transition-colors"
          >
            {adding ? 'Adding...' : 'Add Product'}
          </button>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between p-3 bg-zinc-900 border border-zinc-800 rounded-lg"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                {p.brand && <span className="text-xs text-zinc-500">{p.brand}</span>}
                {p.category && (
                  <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded text-zinc-400">{p.category}</span>
                )}
              </div>
              {p.description && (
                <p className="text-xs text-zinc-600 mt-0.5 line-clamp-1">{p.description}</p>
              )}
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-xs text-zinc-600 hover:text-red-400 transition-colors ml-4 shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Admin Page ───────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState('guidelines')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 leading-none">Tevox Content AI</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Admin Panel</p>
          </div>
        </div>
        <a
          href="/"
          className="text-xs px-3 py-2 rounded-lg border border-zinc-700 text-zinc-400
                     hover:border-zinc-500 hover:text-zinc-200 transition-colors"
        >
          ← Generator
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-lg p-1 self-start w-fit">
          {[
            { id: 'guidelines', label: 'Brand Guidelines' },
            { id: 'products', label: 'Products' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm px-4 py-2 rounded-md transition-colors
                ${tab === t.id ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'guidelines' && <GuidelinesTab />}
        {tab === 'products' && <ProductsTab />}
      </main>
    </div>
  )
}
