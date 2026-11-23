'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Github, Layers, CheckCircle2, X, Cpu } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import SpotlightCard from '@/components/ui/SpotlightCard'
import EditableText from '@/components/studio/EditableText'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import type { ProjectItem } from '@/lib/content/types'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'AI & SaaS', 'ODU Research', 'Mobile & Systems', 'Sold & Client']

export default function ProjectsSection() {
  const {
    snapshot,
    projectFilter,
    setProjectFilter,
    selectedPlanetNode,
    setSelectedPlanetNode,
  } = usePortfolioStore()
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null)

  useEffect(() => {
    if (!selectedPlanetNode) return
    const match = snapshot.projects.find((p) => p.id === selectedPlanetNode)
    if (match) {
      setProjectFilter('All')
    }
  }, [selectedPlanetNode, setProjectFilter, snapshot.projects])

  const filtered =
    projectFilter === 'All'
      ? snapshot.projects
      : snapshot.projects.filter((p) => p.category === projectFilter)

  return (
    <section id="section-projects" className="space-y-4">
      <div className="space-y-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
          03 / Deployed Missions & Commercial Acquisitions
        </span>
        <EditableText
          textKey="projectsTitle"
          as="h2"
          className="font-display text-2xl font-extrabold tracking-tight text-[#1E1A17] dark:text-[#F5EFE2]"
        />
        <EditableText
          textKey="projectsSubtitle"
          as="p"
          multiline
          className="text-xs text-[#3B312B] dark:text-[#D5CFC2]"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setProjectFilter(cat)}
            className={cn(
              'rounded-lg border px-2.5 py-1 font-mono text-[10px] font-semibold transition cursor-pointer',
              projectFilter === cat
                ? 'border-[#E06D43] bg-[#E06D43] text-white'
                : 'border-[#2C241E]/15 bg-white/40 text-[#2C241E] dark:border-[#E6DEC8]/15 dark:bg-white/[0.04] dark:text-[#E6DEC8]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-3.5 md:grid-cols-2">
        {filtered.map((project) => {
          const isHighlighted = selectedPlanetNode === project.id
          return (
            <SpotlightCard
              key={project.id}
              className={cn(
                'flex flex-col justify-between p-4 transition',
                isHighlighted && 'ring-2 ring-[#E06D43]'
              )}
            >
              <div
                onClick={() => setSelectedPlanetNode(project.id)}
                className="cursor-pointer space-y-2.5"
              >
                {project.imageUrl ? (
                  <div className="relative h-28 w-full overflow-hidden rounded-xl border border-[#2C241E]/15 bg-[#121625] dark:border-[#E6DEC8]/15">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover object-top"
                    />
                    <span className="absolute right-2 top-2 rounded-full bg-[#181C2E]/85 px-2 py-0.5 font-mono text-[9px] font-bold text-[#F2A65A]">
                      {project.saleBadge || project.status}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-[#E6DEC8]/15 bg-gradient-to-r from-[#23273E] to-[#3B282A] p-3 text-[#F5EFE2]">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-[#F2A65A]" />
                      <span className="font-mono text-[10px] text-[#2DD4BF]">{project.category}</span>
                    </div>
                    <span className="rounded-full bg-[#E06D43]/25 px-2 py-0.5 font-mono text-[9px] font-bold text-[#F2A65A]">
                      {project.saleBadge || project.status}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="font-display text-sm font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                    {project.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-[#C85A32] dark:text-[#F2A65A]">
                    {project.tagline}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[#3B312B] dark:text-[#D5CFC2]">
                    {project.description}
                  </p>
                </div>

                <div className="space-y-0.5">
                  {project.metrics.slice(0, 2).map((m) => (
                    <div key={m} className="flex items-center gap-1 text-[10px] text-[#3B312B] dark:text-[#D5CFC2]">
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-[#0F766E] dark:text-[#2DD4BF]" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#2C241E]/10 pt-2.5 dark:border-[#E6DEC8]/10">
                <button
                  type="button"
                  onClick={() => setActiveProject(project)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] hover:underline dark:text-[#2DD4BF] cursor-pointer"
                >
                  <Layers className="h-3 w-3" />
                  Architecture
                </button>
                <div className="flex items-center gap-1.5">
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 rounded-md border border-[#2C241E]/15 px-2 py-0.5 text-[10px] font-medium dark:border-[#E6DEC8]/15"
                  >
                    <Github className="h-3 w-3" />
                    Code
                  </a>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 rounded-md bg-[#E06D43] px-2 py-0.5 text-[10px] font-semibold text-white"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Companion
                    </a>
                  )}
                </div>
              </div>
            </SpotlightCard>
          )
        })}
      </div>

      <AnimatePresence>
        {activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveProject(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#141726]/75 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-[#E6DEC8]/20 bg-[#1B2034] p-6 text-[#F5EFE2] shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[#F2A65A]">
                    Architecture Teardown
                  </span>
                  <h3 className="font-display text-xl font-bold">{activeProject.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveProject(null)}
                  className="rounded-full border border-[#E6DEC8]/15 p-1.5 text-[#B8B2A6] hover:bg-white/10 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#D5CFC2]">
                {activeProject.architectureNotes}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {activeProject.techStack.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-[#2DD4BF]/35 bg-[#2DD4BF]/15 px-2.5 py-0.5 font-mono text-[11px] text-[#5EEAD4]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
