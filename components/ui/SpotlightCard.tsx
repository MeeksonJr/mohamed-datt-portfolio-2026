'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface SpotlightCardProps {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
}

export default function SpotlightCard({
  children,
  className,
  spotlightColor = 'rgba(224, 109, 67, 0.16)',
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0, opacity: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      opacity: 1,
    })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCoords((prev) => ({ ...prev, opacity: 0 }))}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[#2C241E]/15 bg-[#EFE8D8]/75 shadow-[0_18px_50px_-20px_rgba(24,20,16,0.28)] backdrop-blur-xl transition-all duration-300 dark:border-[#E6DEC8]/15 dark:bg-[#1B2034]/62 dark:shadow-[0_20px_60px_-25px_rgba(0,0,0,0.65)]',
        className
      )}
    >
      {/* Technical HUD Corner Ticks */}
      <span className="pointer-events-none absolute left-2 top-2 h-2 w-2 border-l border-t border-[#E06D43]/45" />
      <span className="pointer-events-none absolute right-2 top-2 h-2 w-2 border-r border-t border-[#E06D43]/45" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-2 w-2 border-b border-l border-[#2DD4BF]/45" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-2 w-2 border-b border-r border-[#2DD4BF]/45" />

      {/* Warm Terracotta/Champagne Mouse-Tracking Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity: coords.opacity,
          background: `radial-gradient(500px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 48%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  )
}
