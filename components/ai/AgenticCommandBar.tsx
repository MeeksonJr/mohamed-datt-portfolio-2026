'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Sparkles,
  Navigation,
  UserCheck,
  Bot,
  FileText,
  Rocket,
  PlaneLanding,
  Lock,
  Mic,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import type { AgentUIAction } from '@/lib/content/types'

export default function AgenticCommandBar() {
  const {
    commandBarOpen,
    setCommandBarOpen,
    executeAgentAction,
    setVoiceDrawerOpen,
    layoutStyle,
    launchToSpace,
    landOnEarth,
  } = usePortfolioStore()

  const router = useRouter()
  const [query, setQuery] = useState('')
  const [aiStatus, setAiStatus] = useState<string | null>(null)
  const [isRunningAi, setIsRunningAi] = useState(false)

  const runActionAndClose = (action: AgentUIAction) => {
    executeAgentAction(action)
    setCommandBarOpen(false)
    setQuery('')
    setAiStatus(null)
  }

  const handleAskGemini = async () => {
    if (!query.trim() || isRunningAi) return
    setIsRunningAi(true)
    setAiStatus(null)
    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      })
      const data = await res.json()
      if (data.uiAction) {
        executeAgentAction(data.uiAction)
      }
      setAiStatus(data.reply || 'Executed command.')
    } catch {
      setAiStatus('Unable to reach AI agent right now.')
    } finally {
      setIsRunningAi(false)
    }
  }

  return (
    <AnimatePresence>
      {commandBarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/65 px-4 pt-20 backdrop-blur-md"
          onClick={() => setCommandBarOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-[#E6DEC8]/20 bg-[#181C2E]/95 text-[#F5EFE2] shadow-2xl"
          >
            <Command label="Agentic Portfolio Command Bar" className="w-full">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <Sparkles className="h-4 w-4 text-[#F2A65A]" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Type a command or ask Gemini to control the site..."
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                />
                {query.trim() && (
                  <button
                    type="button"
                    onClick={() => void handleAskGemini()}
                    disabled={isRunningAi}
                    className="flex items-center gap-1 rounded-full bg-[#E06D43] px-3 py-1 text-[11px] font-semibold text-white hover:brightness-110 cursor-pointer"
                  >
                    {isRunningAi ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <ArrowRight className="h-3 w-3" />
                    )}
                    Ask Gemini
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCommandBarOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {aiStatus && (
                <div className="border-b border-[#2DD4BF]/25 bg-[#2DD4BF]/10 px-4 py-3 text-xs leading-relaxed text-[#5EEAD4]">
                  {aiStatus}
                </div>
              )}

              <Command.List className="max-h-80 overflow-y-auto p-2">
                <Command.Empty className="px-4 py-6 text-center text-xs text-slate-400">
                  No static match — press <strong>Ask Gemini</strong> above to run as a natural-language UI command!
                </Command.Empty>

                <Command.Group heading="Universe & AI Tools" className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  <Command.Item
                    onSelect={() => {
                      setCommandBarOpen(false)
                      if (layoutStyle === 'editorial') launchToSpace()
                      else landOnEarth()
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-200 aria-selected:bg-[#E06D43]/25"
                  >
                    {layoutStyle === 'editorial' ? (
                      <Rocket className="h-4 w-4 text-[#F2A65A]" />
                    ) : (
                      <PlaneLanding className="h-4 w-4 text-[#2DD4BF]" />
                    )}
                    <span>
                      {layoutStyle === 'editorial'
                        ? 'Launch Rocket to 3D Space Odyssey'
                        : 'Land Back on Terrestrial Home'}
                    </span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runActionAndClose({ type: 'openResumeTailor' })}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-200 aria-selected:bg-[#E06D43]/25"
                  >
                    <FileText className="h-4 w-4 text-[#2DD4BF]" />
                    <span>Open ResumeForge PDF Builder & Job-Fit Tailor</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setCommandBarOpen(false)
                      setVoiceDrawerOpen(true)
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-200 aria-selected:bg-[#E06D43]/25"
                  >
                    <Mic className="h-4 w-4 text-[#F2A65A]" />
                    <span>Summon Gemini Voice Concierge</span>
                  </Command.Item>
                  <Command.Item
                    onSelect={() => {
                      setCommandBarOpen(false)
                      router.push('/admin')
                    }}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-200 aria-selected:bg-[#E06D43]/25"
                  >
                    <Lock className="h-4 w-4 text-[#9CA3AF]" />
                    <span>Admin Command Vault (/admin)</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Switch Visitor Persona" className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {[
                    { id: 'recruiter', label: 'Recruiter View (Resume, GPA & Sold SaaS)' },
                    { id: 'research', label: 'ODU Researcher View (Edge-AI & Clinical)' },
                    { id: 'engineer', label: 'Engineer View (Architecture & 50+ Repos)' },
                    { id: 'client', label: 'Founder / Client View (SaaS & Stripe Studio)' },
                  ].map((p) => (
                    <Command.Item
                      key={p.id}
                      onSelect={() => runActionAndClose({ type: 'setPersona', payload: p.id })}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-200 aria-selected:bg-white/10"
                    >
                      <UserCheck className="h-4 w-4 text-[#2DD4BF]" />
                      <span>{p.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="3D Three.js Stage Presets" className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {[
                    { id: 'companion', label: 'Avatar: Monolith & Companion Rig' },
                    { id: 'neural', label: 'Avatar: Event Horizon Singularity' },
                    { id: 'workstation', label: 'Avatar: Mars Planetary Globe' },
                  ].map((m) => (
                    <Command.Item
                      key={m.id}
                      onSelect={() => runActionAndClose({ type: 'setAvatarMode', payload: m.id })}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-200 aria-selected:bg-white/10"
                    >
                      <Bot className="h-4 w-4 text-[#F2A65A]" />
                      <span>{m.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Group heading="Jump to Sector" className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-slate-400">
                  {[
                    { key: 'story', label: 'Guinea -> NYC -> Norfolk Story' },
                    { key: 'projects', label: 'Flagship Projects & Sold SaaS' },
                    { key: 'research', label: 'ODU Hands-On Lab Research' },
                    { key: 'skills', label: 'Skills Matrix & GitHub Telemetry' },
                    { key: 'services', label: 'SaaS Studio & Stripe Checkout' },
                    { key: 'contact', label: 'Contact & Resume Relay' },
                  ].map((s) => (
                    <Command.Item
                      key={s.key}
                      onSelect={() => runActionAndClose({ type: 'scrollTo', payload: s.key })}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-slate-200 aria-selected:bg-white/10"
                    >
                      <Navigation className="h-4 w-4 text-[#2DD4BF]" />
                      <span>{s.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
