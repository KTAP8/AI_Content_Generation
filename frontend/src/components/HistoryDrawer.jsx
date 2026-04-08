import { useEffect, useState } from 'react'
import { getHistory } from '../api/client'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function HistoryDrawer({ open, onClose, onSelect }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getHistory()
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [open])

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-zinc-950 border-l border-zinc-800
                    z-50 flex flex-col transition-transform duration-300
                    ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-200">Generation History</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          {loading && (
            <p className="text-zinc-500 text-sm text-center py-8">Loading...</p>
          )}
          {!loading && history.length === 0 && (
            <p className="text-zinc-600 text-sm text-center py-8">No history yet</p>
          )}
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => { onSelect(item); onClose() }}
              className="text-left p-3 rounded-lg border border-zinc-800 hover:border-zinc-600
                         transition-colors bg-zinc-900 hover:bg-zinc-800"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm text-zinc-200 font-medium line-clamp-1">
                  {item.product_name ?? `Product #${item.product_id}`}
                </span>
                <span className="text-xs text-zinc-500 shrink-0">{timeAgo(item.created_at)}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.marketing_objective}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
