'use client'

import { useState } from 'react'
import { Check, Pencil, Sparkles, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePortfolioStore } from './PortfolioStoreProvider'
import type { PortfolioTextMap } from '@/lib/content/types'
import { cn } from '@/lib/utils'

interface EditableTextProps {
  textKey: keyof PortfolioTextMap
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  className?: string
  multiline?: boolean
}

const TONES = ['Executive', 'Technical', 'Punchy', 'Academic'] as const

export default function EditableText({
  textKey,
  as: Tag = 'p',
  className,
  multiline = false,
}: EditableTextProps) {
  const { snapshot, inlineEditMode, isAdmin, updateText } = usePortfolioStore()
  const value = snapshot.texts[textKey]

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const [isRewriting, setIsRewriting] = useState(false)

  if (!inlineEditMode || !isAdmin) {
    return <Tag className={className}>{value}</Tag>
  }

  const handleOpenEdit = () => {
    setDraft(value)
    setEditing(true)
  }

  const handleSave = () => {
    if (draft.trim()) {
      updateText(textKey, draft.trim())
      toast.success('Updated text block')
    }
    setEditing(false)
  }

  const handleGeminiRewrite = async (tone: (typeof TONES)[number]) => {
    setIsRewriting(true)
    try {
      const res = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: draft || value, tone, field: textKey }),
      })
      const data = await res.json()
      if (data.rewritten) {
        setDraft(data.rewritten)
        updateText(textKey, data.rewritten)
        toast.success(`Rewritten in ${tone} tone via Gemini`)
      }
    } catch {
      toast.error('AI rewrite unavailable right now')
    } finally {
      setIsRewriting(false)
    }
  }

  if (editing) {
    return (
      <div className="relative z-20 space-y-2 rounded-2xl border border-emerald-400/50 bg-slate-950/90 p-3 shadow-xl backdrop-blur-xl">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/15 bg-black/50 p-2.5 text-sm text-white outline-none focus:border-emerald-400"
          />
        ) : (
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="flex items-center gap-1 font-mono text-[10px] text-indigo-300">
              <Sparkles className="h-3 w-3" />
              Gemini Tone:
            </span>
            {TONES.map((tone) => (
              <button
                key={tone}
                type="button"
                disabled={isRewriting}
                onClick={() => handleGeminiRewrite(tone)}
                className="rounded-full border border-indigo-400/30 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-medium text-indigo-200 transition hover:bg-indigo-500/30 disabled:opacity-50 cursor-pointer"
              >
                {tone}
              </button>
            ))}
            {isRewriting && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-300" />}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-white/15 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-emerald-400 cursor-pointer"
            >
              <Check className="h-3.5 w-3.5" />
              Apply
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative inline-block w-full">
      <Tag
        onClick={handleOpenEdit}
        className={cn(
          className,
          'cursor-pointer rounded-xl border border-dashed border-emerald-400/45 bg-emerald-500/[0.04] px-2 py-1 transition hover:border-emerald-400 hover:bg-emerald-500/[0.09]'
        )}
        title="Click to edit text or rewrite with Gemini"
      >
        {value}
      </Tag>
      <button
        type="button"
        onClick={handleOpenEdit}
        className="absolute -right-2 -top-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-slate-950 opacity-0 shadow-md transition group-hover:opacity-100 cursor-pointer"
      >
        <Pencil className="h-2.5 w-2.5" />
        Edit
      </button>
    </div>
  )
}
