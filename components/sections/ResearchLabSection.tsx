'use client'

import { useEffect, useState } from 'react'
import { Activity, ShieldAlert, Radio, HeartPulse, Brain } from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'
import EditableText from '@/components/studio/EditableText'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { cn } from '@/lib/utils'

type Scenario = 'calm' | 'pacing' | 'prodrome'

const SCENARIOS: Record<
  Scenario,
  { label: string; hr: string; rmssd: string; risk: string; color: string; status: string; amp: number; freq: number }
> = {
  calm: {
    label: 'Calm Homeostasis',
    hr: '68 BPM',
    rmssd: '48 ms',
    risk: '12%',
    color: '#2DD4BF',
    status: 'Tier 1 • Baseline',
    amp: 12,
    freq: 0.14,
  },
  pacing: {
    label: 'Restless Pacing',
    hr: '86 BPM',
    rmssd: '31 ms',
    risk: '49%',
    color: '#F2A65A',
    status: 'Tier 2 • Corridor Drift',
    amp: 22,
    freq: 0.24,
  },
  prodrome: {
    label: 'Pre-Agitation (T-15m)',
    hr: '108 BPM',
    rmssd: '17 ms',
    risk: '88%',
    color: '#E06D43',
    status: 'Tier 3 • Non-Pharm Alert',
    amp: 34,
    freq: 0.42,
  },
}

const LAB_HIGHLIGHTS = [
  {
    code: 'PROP-01',
    title: 'NeuroShield-ADRD',
    target: 'Virginia ARDRAF / NIH NIA R21',
    detail: '10Hz EDA/PPG + UWB wander entropy for 20-min pre-crisis dementia agitation interception.',
  },
  {
    code: 'BOOT-03',
    title: 'VocalPulse-Edge',
    target: 'Sentara Student Pilot / ODU Lab',
    detail: 'Contactless webcam skin rPPG matching WearOS smartwatch pulse within ±1.5 BPM.',
  },
  {
    code: 'PROP-02',
    title: 'OncoPareto-Prostate',
    target: 'Sentara-Brock / DoD PCRP',
    detail: 'Multimodal counterfactual survival & quality-of-life clinical decision engine.',
  },
]

export default function ResearchLabSection() {
  const { selectedPlanetNode, setSelectedPlanetNode } = usePortfolioStore()
  const [scenario, setScenario] = useState<Scenario>('calm')
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (selectedPlanetNode === 'calm' || selectedPlanetNode === 'pacing' || selectedPlanetNode === 'prodrome') {
      setScenario(selectedPlanetNode)
    }
  }, [selectedPlanetNode])

  useEffect(() => {
    const id = setInterval(() => {
      setPhase((p) => (p + 0.35) % 1000)
    }, 60)
    return () => clearInterval(id)
  }, [])

  const cfg = SCENARIOS[scenario]
  const points = Array.from({ length: 64 }, (_, i) => {
    const x = (i / 63) * 320
    const y =
      48 +
      Math.sin(i * cfg.freq + phase) * cfg.amp * 0.65 +
      Math.cos(i * (cfg.freq * 1.9) + phase * 1.4) * (cfg.amp * 0.35)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <section id="section-research" className="space-y-4">
      <div className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#0F766E] dark:text-[#2DD4BF]">
          04 / R1 Clinical & Defense Telemetry
        </span>
        <EditableText
          textKey="researchTitle"
          as="h2"
          className="font-display text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#F5EFE2]"
        />
        <EditableText
          textKey="researchSubtitle"
          as="p"
          multiline
          className="text-xs text-[#3B312B] dark:text-[#D5CFC2]"
        />
      </div>

      <SpotlightCard className="p-4" spotlightColor="rgba(45, 212, 191, 0.16)">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#2DD4BF]" />
            <span className="font-mono text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
              NeuroShield-ADRD 10Hz Oscilloscope
            </span>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold"
            style={{ backgroundColor: `${cfg.color}25`, color: cfg.color }}
          >
            {cfg.status}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.keys(SCENARIOS) as Scenario[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setScenario(key)
                setSelectedPlanetNode(key)
              }}
              className={cn(
                'rounded-lg border px-2.5 py-1 font-mono text-[10px] font-semibold transition cursor-pointer',
                scenario === key
                  ? 'border-[#2DD4BF] bg-[#2DD4BF]/20 text-[#0F766E] dark:text-[#5EEAD4]'
                  : 'border-[#2C241E]/15 bg-white/40 text-[#2C241E] dark:border-[#E6DEC8]/15 dark:bg-white/[0.03] dark:text-[#E6DEC8]'
              )}
            >
              {SCENARIOS[key].label}
            </button>
          ))}
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-[#E6DEC8]/15 bg-[#121625] p-3">
          <svg viewBox="0 0 320 96" className="h-20 w-full">
            <line x1="0" y1="48" x2="320" y2="48" stroke="#2D344E" strokeDasharray="4 4" />
            <polyline
              fill="none"
              stroke={cfg.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-[#E6DEC8]/10 pt-2 font-mono text-xs">
            <div>
              <p className="text-[9px] text-[#9CA3AF]">PPG Heart Rate</p>
              <p className="font-bold text-[#F5EFE2]">{cfg.hr}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#9CA3AF]">Vagal RMSSD</p>
              <p className="font-bold text-[#F5EFE2]">{cfg.rmssd}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#9CA3AF]">Agitation Risk</p>
              <p className="font-bold" style={{ color: cfg.color }}>
                {cfg.risk}
              </p>
            </div>
          </div>
        </div>
      </SpotlightCard>

      <div className="grid gap-3 sm:grid-cols-3">
        {LAB_HIGHLIGHTS.map((item, idx) => {
          const icons = [ShieldAlert, Radio, HeartPulse]
          const Icon = icons[idx % icons.length]
          return (
            <SpotlightCard key={item.code} className="p-3.5">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-[#E06D43]" />
                <span className="font-mono text-[10px] font-bold text-[#0F766E] dark:text-[#2DD4BF]">
                  {item.code}
                </span>
              </div>
              <h3 className="mt-1 font-display text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                {item.title}
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]">
                {item.detail}
              </p>
            </SpotlightCard>
          )
        })}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-3.5 py-2 text-[11px] text-[#1E1A17] dark:text-[#E6DEC8]">
        <Brain className="h-4 w-4 shrink-0 text-[#0F766E] dark:text-[#2DD4BF]" />
        <span>10 Federal Grant Proposals & 5 In-House Edge Prototypes • Old Dominion University</span>
      </div>
    </section>
  )
}
