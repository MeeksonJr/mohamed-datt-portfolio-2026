'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'
import { Rocket, FastForward } from 'lucide-react'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'

const RocketTransitionScene = dynamic(() => import('./RocketTransitionScene'), {
  ssr: false,
})

export default function RocketTransitionOverlay() {
  const { rocketTransition, skipRocketTransition } = usePortfolioStore()
  const { resolvedTheme } = useTheme()
  const isLight = resolvedTheme === 'light'

  return (
    <AnimatePresence>
      {rocketTransition !== 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#161A2B]"
        >
          <div className="absolute inset-0">
            <RocketTransitionScene phase={rocketTransition} isLight={isLight} />
          </div>

          <div className="relative z-10 flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-2.5 rounded-full border border-[#E06D43]/40 bg-[#181C2E]/85 px-4 py-2 font-mono text-xs text-[#F2A65A] backdrop-blur-xl">
              <Rocket className="h-4 w-4 animate-pulse" />
              <span>
                {rocketTransition === 'launch'
                  ? 'IGNITION // LAUNCHING TO 8-PLANET 3D SPACE ODYSSEY...'
                  : 'RETRO-BURN // LANDING BACK ON TERRESTRIAL HOME...'}
              </span>
            </div>

            <button
              type="button"
              onClick={skipRocketTransition}
              className="flex items-center gap-1.5 rounded-full border border-[#E6DEC8]/20 bg-[#181C2E]/85 px-4 py-2 font-mono text-xs text-[#F5EFE2] backdrop-blur-xl hover:border-[#E06D43] cursor-pointer"
            >
              <FastForward className="h-3.5 w-3.5" />
              Skip Transition
            </button>
          </div>

          <div className="relative z-10 pb-10 text-center">
            <p className="font-display text-2xl font-extrabold tracking-tight text-[#F5EFE2] drop-shadow-lg sm:text-3xl">
              {rocketTransition === 'launch'
                ? 'Entering Interplanetary Orbit'
                : 'Descending to Norfolk Base'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
