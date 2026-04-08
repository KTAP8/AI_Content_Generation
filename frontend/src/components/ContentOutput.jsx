import { useState } from 'react'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs px-3 py-1 rounded border border-zinc-700 text-zinc-400
                 hover:border-zinc-500 hover:text-zinc-200 transition-colors shrink-0"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

function formatTikTokScript(script) {
  if (!script) return null
  return script.split('\n').map((line, i) => {
    const isLabel = /^\[(HOOK|BODY|CTA)\]/i.test(line.trim())
    return (
      <p key={i} className={isLabel ? 'text-red-400 font-semibold mt-3 first:mt-0' : 'text-zinc-300 text-sm leading-relaxed'}>
        {line}
      </p>
    )
  })
}

function Card({ title, icon, content, charLimit }) {
  const charCount = content?.length ?? 0
  const overLimit = charLimit && charCount > charLimit

  return (
    <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="text-sm font-semibold text-zinc-200">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {charLimit && (
            <span className={`text-xs ${overLimit ? 'text-red-400' : 'text-zinc-500'}`}>
              {charCount}/{charLimit}
            </span>
          )}
          <CopyButton text={content ?? ''} />
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto max-h-80 text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
        {title === 'TikTok Script' ? formatTikTokScript(content) : content}
      </div>
    </div>
  )
}

export default function ContentOutput({ data }) {
  if (!data) return null
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
      <Card
        title="TikTok Script"
        icon="🎬"
        content={data.tiktok_script}
      />
      <Card
        title="Instagram Caption"
        icon="📸"
        content={data.instagram_caption}
        charLimit={2200}
      />
      <Card
        title="Visual Direction"
        icon="🎨"
        content={data.visual_direction}
      />
    </div>
  )
}
