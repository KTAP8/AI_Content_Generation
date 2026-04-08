import { useEffect, useRef, useState } from 'react'
import { getProducts, generateContent } from '../api/client'
import HistoryDrawer from '../components/HistoryDrawer'

const LOADING_STEPS = [
  { label: 'Fetching product details',  color: 'bg-zinc-400' },
  { label: 'Researching live trends',   color: 'bg-sky-400' },
  { label: 'Merging brand guidelines',  color: 'bg-amber-400' },
  { label: 'Generating with AI',        color: 'bg-red-400' },
]

const PRESETS = [
  'Drive traffic for summer sale',
  'Launch new product drop',
  'Increase brand awareness',
  'Promote limited stock',
  'Re-engage existing customers',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text ?? '').then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        })
      }}
      className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
        copied
          ? 'border-emerald-700 text-emerald-400 bg-emerald-950/30'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-100'
      }`}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

function formatTikTokScript(script) {
  if (!script) return null
  return script.split('\n').map((line, i) => {
    const isLabel = /^\[(HOOK|BODY|CTA)\]/i.test(line.trim())
    return (
      <p
        key={i}
        className={
          isLabel
            ? 'text-red-400 font-semibold text-sm mt-3 first:mt-0'
            : 'text-zinc-300 text-sm leading-relaxed'
        }
      >
        {line || '\u00A0'}
      </p>
    )
  })
}

// ─── Chat primitives ──────────────────────────────────────────────────────────

function AiAvatar() {
  return (
    <div
      className="w-7 h-7 rounded bg-red-600 flex items-center justify-center
                 text-white text-xs font-bold shrink-0 mt-0.5"
      style={{ fontFamily: 'Syne, system-ui' }}
    >
      T
    </div>
  )
}

function AiMessage({ children }) {
  return (
    <div className="flex gap-3 items-start">
      <AiAvatar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function UserMessage({ children }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-sm px-4 py-2.5 rounded-2xl rounded-tr-sm text-zinc-100
                   text-sm leading-relaxed border border-red-900/30"
        style={{ background: 'oklch(16% 0.025 20)' }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Product picker widget ────────────────────────────────────────────────────

function ProductWidget({ products, loading, onSelect }) {
  if (loading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600">
        <div className="w-3 h-3 border border-zinc-700 border-t-zinc-500 rounded-full animate-spin" />
        Loading products…
      </div>
    )
  }
  if (products.length === 0) {
    return (
      <p className="mt-3 text-sm text-zinc-600">
        No products found. Add them in{' '}
        <a href="/admin" className="text-red-400 underline underline-offset-2">
          Admin
        </a>
        .
      </p>
    )
  }
  return (
    <div className="mt-3 flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
      {products.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p)}
          className="text-left px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-900/60
                     hover:border-red-600/40 hover:bg-zinc-800/80 transition-all group"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
              {p.name}
            </span>
            {p.category && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700/60 text-zinc-500 shrink-0">
                {p.category}
              </span>
            )}
          </div>
          {p.brand && (
            <p className="text-xs text-zinc-600 mt-0.5">{p.brand}</p>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── Typing / thinking indicator ──────────────────────────────────────────────

function ThinkingIndicator({ step }) {
  const current = LOADING_STEPS[step]
  return (
    <AiMessage>
      <div className="flex items-center gap-3 py-1">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full dot-bounce ${current.color}`}
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>
        <span className="text-xs text-zinc-500">{current.label}</span>
      </div>
    </AiMessage>
  )
}

// ─── Tabbed content output ────────────────────────────────────────────────────

const TAB_CONFIG = {
  tiktok: {
    label: 'TikTok Script',
    active: 'text-red-400 border-red-500',
    bg: 'bg-red-950/10',
  },
  instagram: {
    label: 'Instagram',
    active: 'text-violet-400 border-violet-500',
    bg: 'bg-violet-950/10',
  },
  visual: {
    label: 'Visual Direction',
    active: 'text-amber-400 border-amber-500',
    bg: 'bg-amber-950/10',
  },
}

function ContentResult({ data }) {
  const [tab, setTab] = useState('tiktok')

  const tabs = [
    { id: 'tiktok',    content: data.tiktok_script },
    { id: 'instagram', content: data.instagram_caption, charLimit: 2200 },
    { id: 'visual',    content: data.visual_direction },
  ]
  const active = tabs.find((t) => t.id === tab)
  const config = TAB_CONFIG[tab]

  return (
    <div className="mt-3 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/40">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? TAB_CONFIG[t.id].active
                : 'text-zinc-500 border-transparent hover:text-zinc-300 hover:border-zinc-700'
            }`}
          >
            {TAB_CONFIG[t.id].label}
          </button>
        ))}
      </div>

      {/* Content area — tinted per platform */}
      <div className={`p-4 max-h-72 overflow-y-auto transition-colors ${config.bg}`}>
        {tab === 'tiktok' ? (
          formatTikTokScript(active.content)
        ) : (
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {active.content}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-800 bg-zinc-950/60">
        <span className="text-xs text-zinc-600">
          {active.charLimit
            ? `${active.content?.length ?? 0} / ${active.charLimit}`
            : `${active.content?.length ?? 0} chars`}
        </span>
        <CopyButton text={active.content ?? ''} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeneratorPage() {
  const [products, setProducts] = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [objective, setObjective] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [step, setStep] = useState('product') // 'product' | 'objective' | 'generating' | 'done'

  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    getProducts()
      .then((data) => { setProducts(data); setProductsLoading(false) })
      .catch(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [step, result])

  useEffect(() => {
    if (!loading) return
    let s = 0
    const interval = setInterval(() => {
      s = (s + 1) % LOADING_STEPS.length
      setLoadingStep(s)
    }, 3500)
    return () => clearInterval(interval)
  }, [loading])

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setStep('objective')
    setTimeout(() => inputRef.current?.focus(), 150)
  }

  const handleSubmitObjective = async () => {
    const obj = inputValue.trim()
    if (!obj || !selectedProduct) return
    setObjective(obj)
    setInputValue('')
    setStep('generating')
    setLoading(true)
    setLoadingStep(0)
    setResult(null)
    setError(null)
    try {
      const data = await generateContent(selectedProduct.id, obj)
      setResult(data?.data ?? data)
      setStep('done')
    } catch (err) {
      setError(err.message || 'Generation failed. Check n8n workflow logs.')
      setStep('done')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedProduct(null)
    setObjective('')
    setInputValue('')
    setResult(null)
    setError(null)
    setStep('product')
  }

  const handleHistorySelect = (item) => {
    const product = products.find((p) => p.id === item.product_id) ?? {
      id: item.product_id,
      name: item.product_name ?? `Product #${item.product_id}`,
    }
    setSelectedProduct(product)
    setObjective(item.marketing_objective)
    setResult({
      tiktok_script: item.tiktok_script,
      instagram_caption: item.instagram_caption,
      visual_direction: item.visual_direction,
    })
    setStep('done')
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">

      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-zinc-800/70">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded bg-red-600 flex items-center justify-center text-white text-xs font-bold"
            style={{ fontFamily: 'Syne, system-ui' }}
          >
            T
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold text-zinc-100"
              style={{ fontFamily: 'Syne, system-ui' }}
            >
              Tevox Content AI
            </span>
            <span className="text-zinc-700 text-xs">·</span>
            <span className="text-xs text-zinc-500">Automotive Social Generator</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-500
                       hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            History
          </button>
          <a
            href="/admin"
            className="text-xs px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-500
                       hover:border-zinc-600 hover:text-zinc-300 transition-colors"
          >
            Admin
          </a>
        </div>
      </header>

      {/* ── Chat thread ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-7">

          {/* AI: Opening */}
          <AiMessage>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Hey — I'm your Tevox content assistant. Pick a product below and I'll
              research live trends, apply your brand guidelines, and generate a
              ready-to-post TikTok script, Instagram caption, and visual direction.
            </p>
            {step === 'product' && (
              <ProductWidget
                products={products}
                loading={productsLoading}
                onSelect={handleProductSelect}
              />
            )}
          </AiMessage>

          {/* User confirms product + AI asks for objective */}
          {(step === 'objective' || step === 'generating' || step === 'done') && selectedProduct && (
            <>
              <UserMessage>
                Generate content for{' '}
                <strong>{selectedProduct.name}</strong>
                {selectedProduct.brand ? ` · ${selectedProduct.brand}` : ''}
              </UserMessage>

              <AiMessage>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  What's the marketing objective for this campaign? Be specific — the
                  more context you give, the sharper the output.
                </p>
              </AiMessage>
            </>
          )}

          {/* User's objective */}
          {(step === 'generating' || step === 'done') && objective && (
            <UserMessage>{objective}</UserMessage>
          )}

          {/* Thinking */}
          {step === 'generating' && <ThinkingIndicator step={loadingStep} />}

          {/* Result */}
          {step === 'done' && (
            <>
              {error ? (
                <AiMessage>
                  <div className="text-sm text-red-400 bg-red-950/30 border border-red-800/50 rounded-xl px-4 py-3">
                    {error}
                  </div>
                </AiMessage>
              ) : result ? (
                <AiMessage>
                  <p className="text-sm text-zinc-300">
                    Here's your content package. Use the tabs to review each piece and
                    copy what you need.
                  </p>
                  <ContentResult data={result} />
                  <button
                    onClick={handleReset}
                    className="mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    ← Start a new generation
                  </button>
                </AiMessage>
              ) : null}
            </>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input bar — only visible during objective step ── */}
      {step === 'objective' && (
        <div className="shrink-0 border-t border-zinc-800/70 bg-zinc-950">
          <div className="max-w-2xl mx-auto px-4 pt-3 pb-4">
            {/* Preset chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setInputValue(preset)}
                  className="text-xs px-3 py-1.5 rounded-full border border-zinc-800 text-zinc-500
                             hover:border-red-600/50 hover:text-red-400 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Textarea + send */}
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmitObjective()
                  }
                }}
                placeholder="Describe the marketing objective… (Enter to send)"
                rows={2}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm
                           text-zinc-100 placeholder:text-zinc-600 focus:outline-none
                           focus:border-zinc-600 resize-none transition-colors"
              />
              <button
                onClick={handleSubmitObjective}
                disabled={!inputValue.trim()}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold
                           disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed
                           transition-colors self-end shrink-0"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onSelect={handleHistorySelect}
      />
    </div>
  )
}
