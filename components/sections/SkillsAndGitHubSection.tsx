'use client'

import { useEffect, useState } from 'react'
import { Layers, Database, Cpu, Smartphone, Github, Star, ArrowUpRight } from 'lucide-react'
import SpotlightCard from '@/components/ui/SpotlightCard'
import EditableText from '@/components/studio/EditableText'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { SKILL_CLUSTERS } from '@/lib/content/default-portfolio-data'
import { cn } from '@/lib/utils'

const CLUSTER_ICONS = {
  layers: Layers,
  database: Database,
  cpu: Cpu,
  smartphone: Smartphone,
}

const CLUSTER_PALETTE = ['#E06D43', '#2DD4BF', '#F2A65A', '#38BDF8']

interface RepoItem {
  name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
}

export default function SkillsAndGitHubSection() {
  const { selectedPlanetNode, setSelectedPlanetNode } = usePortfolioStore()
  const [repos, setRepos] = useState<RepoItem[]>([])
  const [publicCount, setPublicCount] = useState<number>(50)
  const [source, setSource] = useState<string>('loading')

  useEffect(() => {
    fetch('/api/github')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.repos)) setRepos(data.repos)
        if (data.publicRepos) setPublicCount(data.publicRepos)
        if (data.source) setSource(data.source)
      })
      .catch(() => setSource('fallback'))
  }, [])

  return (
    <section id="section-skills" className="space-y-4">
      <div className="space-y-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
          05 / Capabilities & Open-Source Telemetry
        </span>
        <EditableText
          textKey="skillsTitle"
          as="h2"
          className="font-display text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#F5EFE2]"
        />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        {SKILL_CLUSTERS.map((cluster, idx) => {
          const Icon = CLUSTER_ICONS[cluster.iconName]
          const tone = CLUSTER_PALETTE[idx % CLUSTER_PALETTE.length]
          const isHighlighted = selectedPlanetNode === cluster.id
          return (
            <SpotlightCard
              key={cluster.id}
              className={cn('p-4 transition', isHighlighted && 'ring-2 ring-[#E06D43]')}
            >
              <button
                type="button"
                onClick={() => setSelectedPlanetNode(cluster.id)}
                className="flex w-full items-center gap-2 text-left cursor-pointer"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${tone}22`, color: tone }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-display text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                  {cluster.category}
                </h3>
              </button>

              <div className="mt-3 space-y-2">
                {cluster.skills.map((skill) => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-[#2C241E] dark:text-[#E6DEC8]">
                        {skill.name}
                      </span>
                      <span className="font-mono text-[9px] text-[#5A4F46] dark:text-[#A39E93]">
                        {skill.tag}
                      </span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-[#2C241E]/10 dark:bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${skill.level}%`, backgroundColor: tone }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          )
        })}
      </div>

      <SpotlightCard className="p-4" spotlightColor="rgba(242, 166, 90, 0.14)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-4 w-4 text-[#E06D43]" />
            <span className="font-display text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
              @MeeksonJr Live Feed ({publicCount}+ repos • {source})
            </span>
          </div>
          <a
            href="https://github.com/MeeksonJr"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 font-mono text-[10px] font-semibold text-[#C85A32] dark:text-[#F2A65A]"
          >
            GitHub
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {repos.slice(0, 4).map((repo) => (
            <a
              key={repo.name}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[#2C241E]/10 bg-white/40 p-2.5 transition hover:border-[#E06D43]/60 dark:border-[#E6DEC8]/10 dark:bg-white/[0.03]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-mono text-[11px] font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                  {repo.name}
                </span>
                <span className="flex items-center gap-0.5 font-mono text-[10px] text-[#C85A32] dark:text-[#F2A65A]">
                  <Star className="h-2.5 w-2.5" />
                  {repo.stargazers_count}
                </span>
              </div>
              {repo.language && (
                <span className="mt-1 inline-block rounded bg-[#2DD4BF]/15 px-1.5 py-0.5 font-mono text-[9px] text-[#0F766E] dark:text-[#5EEAD4]">
                  {repo.language}
                </span>
              )}
            </a>
          ))}
        </div>
      </SpotlightCard>
    </section>
  )
}
