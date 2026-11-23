'use client'

import { useEffect, useState } from 'react'
import {
  Check,
  Calculator,
  CreditCard,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import SpotlightCard from '@/components/ui/SpotlightCard'
import EditableText from '@/components/studio/EditableText'
import { usePortfolioStore } from '@/components/studio/PortfolioStoreProvider'
import { SERVICE_TIERS } from '@/lib/content/default-portfolio-data'
import { STRIPE_LIVE_ACCOUNT, VERIFIED_STRIPE_PAYMENT_LINKS } from '@/lib/stripe'
import { cn } from '@/lib/utils'

const ADDONS = [
  { id: 'ai', label: 'Gemini Voice / Agent Concierge', cost: 450 },
  { id: 'three', label: 'Three.js / R3F Custom 3D Scene', cost: 400 },
  { id: 'db', label: 'Drizzle + Auth + Stripe Billing', cost: 500 },
]

interface StripeReceipt {
  id: string
  tierName: string
  totalUsd: number
  clientEmail: string
  checkoutUrl?: string
  addons: Array<{ id: string; label: string; cost: number }>
}

export default function ServicesEstimatorSection() {
  const { selectedPlanetNode, setSelectedPlanetNode } = usePortfolioStore()
  const [selectedTierId, setSelectedTierId] = useState('starter-site')
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['ai'])
  const [clientEmail, setClientEmail] = useState('')
  const [projectNotes, setProjectNotes] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const [receipt, setReceipt] = useState<StripeReceipt | null>(null)

  useEffect(() => {
    if (
      selectedPlanetNode === 'quick-fix' ||
      selectedPlanetNode === 'starter-site' ||
      selectedPlanetNode === 'saas-setup'
    ) {
      setSelectedTierId(selectedPlanetNode)
    }
  }, [selectedPlanetNode])

  const activeTier = SERVICE_TIERS.find((t) => t.id === selectedTierId) || SERVICE_TIERS[1]
  const chosenAddonObjects = ADDONS.filter((a) => selectedAddons.includes(a.id))
  const addonTotal = chosenAddonObjects.reduce((sum, a) => sum + a.cost, 0)
  const totalEstimate = activeTier.baseUsd + addonTotal

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleStripeCheckout = async () => {
    setCheckingOut(true)
    setReceipt(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId: activeTier.id,
          tierName: activeTier.tier,
          baseUsd: activeTier.baseUsd,
          addons: chosenAddonObjects,
          clientEmail: clientEmail.trim(),
          projectNotes: projectNotes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Checkout failed')

      if (data.mode === 'live-stripe' && data.url) {
        window.location.href = data.url
        return
      }

      if (data.mode === 'stripe-payment-link' && data.receipt) {
        setReceipt(data.receipt)
        toast.success(
          `Connected to Live Stripe (${STRIPE_LIVE_ACCOUNT.displayName}) — Hosted Checkout ready!`
        )
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unable to start checkout')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <section id="section-services" className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#C85A32] dark:text-[#F2A65A]">
              06 / SaaS Architecture & Freelance Studio
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/15 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-700 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Stripe Live ({STRIPE_LIVE_ACCOUNT.accountId})
            </span>
          </div>
          <EditableText
            textKey="servicesTitle"
            as="h2"
            className="font-display text-2xl font-extrabold tracking-tight text-[#1E1A17] sm:text-3xl dark:text-[#F5EFE2]"
          />
        </div>
        <p className="max-w-sm font-serif text-lg italic text-[#5A4F46] dark:text-[#C8C1B4]">
          Simple packages for every stage — instant Stripe Checkout or custom scope estimator.
        </p>
      </div>

      {/* Folioblox-Inspired High-Contrast 3-Pillar Pricing Matrix */}
      <div className="grid gap-4 md:grid-cols-3">
        {SERVICE_TIERS.map((tier) => {
          const active = selectedTierId === tier.id
          const isOrangeCenter = Boolean(tier.popular)
          return (
            <div
              key={tier.id}
              className={cn(
                'relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-all duration-300',
                isOrangeCenter
                  ? 'border-[#F2A65A]/60 bg-gradient-to-b from-[#E06D43] via-[#C85A32] to-[#9B3B1B] text-white shadow-[0_24px_60px_-15px_rgba(224,109,67,0.45)]'
                  : 'border-[#2C241E]/15 bg-[#EFE8D8]/85 text-[#1E1A17] dark:border-[#E6DEC8]/15 dark:bg-[#16192B]/90 dark:text-[#F5EFE2]',
                active && !isOrangeCenter && 'ring-2 ring-[#E06D43]'
              )}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'font-mono text-[10px] font-bold uppercase tracking-wider',
                      isOrangeCenter ? 'text-[#FFE2C6]' : 'text-[#0F766E] dark:text-[#2DD4BF]'
                    )}
                  >
                    {tier.deliveryTime}
                  </span>
                  {isOrangeCenter && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 font-mono text-[9px] font-bold text-white backdrop-blur-md">
                      <Sparkles className="h-2.5 w-2.5" />
                      MOST POPULAR
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-display text-lg font-extrabold tracking-tight">
                    {tier.tier}
                  </h3>
                  <p
                    className={cn(
                      'mt-2 font-display text-3xl font-extrabold tracking-tight',
                      isOrangeCenter ? 'text-white' : 'text-[#1E1A17] dark:text-[#F5EFE2]'
                    )}
                  >
                    {tier.price}
                  </p>
                </div>

                <p
                  className={cn(
                    'text-xs leading-relaxed',
                    isOrangeCenter ? 'text-white/90' : 'text-[#3B312B] dark:text-[#D5CFC2]'
                  )}
                >
                  {tier.description}
                </p>

                <ul className="space-y-1.5 pt-2">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        'flex items-start gap-2 text-xs',
                        isOrangeCenter ? 'text-white/95' : 'text-[#3B312B] dark:text-[#D5CFC2]'
                      )}
                    >
                      <Check
                        className={cn(
                          'mt-0.5 h-3.5 w-3.5 shrink-0',
                          isOrangeCenter ? 'text-[#FFE2C6]' : 'text-[#0F766E] dark:text-[#2DD4BF]'
                        )}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 space-y-2 pt-3 border-t border-current/15">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTierId(tier.id)
                    setSelectedPlanetNode(tier.id)
                  }}
                  className={cn(
                    'w-full rounded-xl py-2 text-xs font-bold transition cursor-pointer',
                    isOrangeCenter
                      ? 'bg-[#141726] text-white hover:bg-black'
                      : active
                        ? 'bg-[#E06D43] text-white'
                        : 'border border-[#2C241E]/20 bg-white/50 text-[#1E1A17] hover:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-white/[0.06] dark:text-[#F5EFE2]'
                  )}
                >
                  {active ? 'Selected in Estimator ✓' : 'Select Base Tier'}
                </button>

                {tier.stripePaymentLinkUrl && (
                  <a
                    href={tier.stripePaymentLinkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'flex w-full items-center justify-center gap-1.5 rounded-xl border py-1.5 font-mono text-[10px] font-semibold transition',
                      isOrangeCenter
                        ? 'border-white/30 bg-white/15 text-white hover:bg-white/25'
                        : 'border-[#635BFF]/40 bg-[#635BFF]/10 text-[#4F46E5] hover:bg-[#635BFF]/20 dark:text-[#A5B4FC]'
                    )}
                  >
                    Direct Stripe Checkout
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Live SaaS Payment Links synced from Mohamed's Stripe Account */}
      <div className="rounded-2xl border border-[#2C241E]/15 bg-[#E6DEC9]/60 p-4 dark:border-[#E6DEC8]/12 dark:bg-[#141828]/80">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C85A32] dark:text-[#F2A65A]">
            Live Stripe SaaS Plans • {STRIPE_LIVE_ACCOUNT.displayName} ({STRIPE_LIVE_ACCOUNT.accountId})
          </p>
          <span className="font-mono text-[10px] text-[#5A4F46] dark:text-[#9CA3AF]">
            Hosted buy.stripe.com Checkout Links
          </span>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {VERIFIED_STRIPE_PAYMENT_LINKS.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between rounded-xl border border-[#2C241E]/10 bg-white/55 p-3 transition hover:border-[#635BFF] dark:border-[#E6DEC8]/10 dark:bg-white/[0.04]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#635BFF] dark:text-[#A5B4FC]">
                    {link.amountDisplay}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-[#5A4F46] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#635BFF] dark:text-[#A39E93]" />
                </div>
                <p className="mt-1 font-display text-xs font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
                  {link.name}
                </p>
                <p className="mt-0.5 text-[10px] text-[#5A4F46] dark:text-[#B8B2A6]">
                  {link.subtitle}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Scope Estimator + Direct Stripe Checkout */}
      <SpotlightCard className="p-5" spotlightColor="rgba(99, 91, 255, 0.16)">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-[#E06D43]" />
            <h3 className="font-display text-sm font-bold text-[#1E1A17] dark:text-[#F5EFE2]">
              Interactive Scope Estimator & Stripe Checkout
            </h3>
          </div>
          <span className="font-display text-2xl font-extrabold text-[#C85A32] dark:text-[#F2A65A]">
            ${totalEstimate.toLocaleString()}
          </span>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {ADDONS.map((addon) => {
            const checked = selectedAddons.includes(addon.id)
            return (
              <button
                key={addon.id}
                type="button"
                onClick={() => toggleAddon(addon.id)}
                className={cn(
                  'flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-left text-[11px] transition cursor-pointer',
                  checked
                    ? 'border-[#2DD4BF] bg-[#2DD4BF]/15 text-[#0F766E] dark:text-[#5EEAD4]'
                    : 'border-[#2C241E]/10 bg-white/30 text-[#2C241E] dark:border-[#E6DEC8]/10 dark:bg-white/[0.02] dark:text-[#E6DEC8]'
                )}
              >
                <span className="font-semibold">{addon.label}</span>
                <span className="font-mono text-[10px] font-bold">+${addon.cost}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <input
            type="email"
            aria-label="Client email for Stripe prefill and receipt"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="Your email for Stripe prefill & receipt (optional)"
            className="rounded-xl border border-[#2C241E]/15 bg-white/75 px-3 py-2.5 text-sm text-[#1E1A17] outline-none focus:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-[#121625]/70 dark:text-[#F5EFE2]"
          />
          <input
            type="text"
            aria-label="Project goal or timeline notes"
            value={projectNotes}
            onChange={(e) => setProjectNotes(e.target.value)}
            placeholder="Brief project goal or timeline..."
            className="rounded-xl border border-[#2C241E]/15 bg-white/75 px-3 py-2.5 text-sm text-[#1E1A17] outline-none focus:border-[#E06D43] dark:border-[#E6DEC8]/15 dark:bg-[#121625]/70 dark:text-[#F5EFE2]"
          />
        </div>

        <button
          type="button"
          disabled={checkingOut}
          onClick={() => void handleStripeCheckout()}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#635BFF] via-[#7A73FF] to-[#4F46E5] py-2.5 text-xs font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
        >
          {checkingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
          {checkingOut
            ? 'Connecting to Stripe Account...'
            : `Book & Pay via Stripe ($${totalEstimate.toLocaleString()} Estimated Scope)`}
        </button>

        <div className="mt-2 flex items-center justify-center gap-1.5 font-mono text-[10px] text-[#5A4F46] dark:text-[#A39E93]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>
            Connected to Stripe Account {STRIPE_LIVE_ACCOUNT.accountId} • Live Hosted Checkout + Dynamic SDK
          </span>
        </div>

        {receipt && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Live Stripe Hosted Checkout Prepared ({STRIPE_LIVE_ACCOUNT.displayName})
              </span>
              <span className="font-mono text-[10px] opacity-80">{receipt.id}</span>
            </div>
            <p className="mt-1.5 text-[#2C241E] dark:text-[#E6DEC8]">
              Package: <strong>{receipt.tierName}</strong>
              {receipt.addons.length > 0 &&
                ` + ${receipt.addons.map((a) => a.label).join(', ')}`}
              {' — '}Estimated Custom Scope: <strong>${receipt.totalUsd.toLocaleString()}</strong>
            </p>
            {receipt.checkoutUrl && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={receipt.checkoutUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#635BFF] px-4 py-2 text-xs font-bold text-white shadow-md hover:brightness-110"
                >
                  Open Live Stripe Checkout Page
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
                <span className="font-mono text-[10px] text-[#5A4F46] dark:text-[#9CA3AF]">
                  Add STRIPE_SECRET_KEY in .env.local for exact custom add-on dynamic cart line items.
                </span>
              </div>
            )}
          </div>
        )}
      </SpotlightCard>
    </section>
  )
}
