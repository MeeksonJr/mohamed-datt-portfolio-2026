import Stripe from 'stripe'

let cachedStripe: Stripe | null = null

export const STRIPE_LIVE_ACCOUNT = {
  accountId: 'acct_1Qxf8DFZKCl4K7QE',
  displayName: 'Mohamed Datt',
  livemode: true,
  taxStatus: 'active',
  defaultTaxCode: 'txcd_10000000',
  dashboardUrl: 'https://dashboard.stripe.com/acct_1Qxf8DFZKCl4K7QE/apikeys',
} as const

export interface VerifiedStripePaymentLink {
  id: string
  plinkId: string
  productId: string
  priceId: string
  name: string
  subtitle: string
  amountDisplay: string
  amountCents: number
  interval: 'month' | 'year' | 'one_time'
  url: string
  mappedTierId: 'quick-fix' | 'starter-site' | 'saas-setup'
}

/**
 * Verified active live Payment Links fetched directly from Mohamed Datt's
 * Stripe account (acct_1Qxf8DFZKCl4K7QE) via the connected Stripe MCP plugin.
 */
export const VERIFIED_STRIPE_PAYMENT_LINKS: VerifiedStripePaymentLink[] = [
  {
    id: 'auditpulse-growth-monthly',
    plinkId: 'plink_1UT5w7FZKCl4K7QEsWrXVKQg',
    productId: 'prod_VU42KsJoHvt5NP',
    priceId: 'price_1UT5vaFZKCl4K7QEY7LlKX4v',
    name: 'AuditPulse AI — Growth Pro',
    subtitle: '100 deep SEO, CRO & GEO audits/mo + PDF reports',
    amountDisplay: '$29/mo',
    amountCents: 2900,
    interval: 'month',
    url: 'https://buy.stripe.com/4gM28reqk2tFaj7ctH9k400',
    mappedTierId: 'quick-fix',
  },
  {
    id: 'auditpulse-growth-annual',
    plinkId: 'plink_1UT5wCFZKCl4K7QEXQysMU7i',
    productId: 'prod_VU42KsJoHvt5NP',
    priceId: 'price_1UT5vgFZKCl4K7QEF7p1hCNn',
    name: 'Quick Fix, Audit & Retainer Deposit',
    subtitle: 'Full architecture triage, SEO/GEO audit & rapid sprint pass',
    amountDisplay: '$276/yr',
    amountCents: 27600,
    interval: 'year',
    url: 'https://buy.stripe.com/7sYdR96XS2tF2QF2T79k401',
    mappedTierId: 'quick-fix',
  },
  {
    id: 'agency-whitelabel-monthly',
    plinkId: 'plink_1UT5wIFZKCl4K7QEZlcdaxwO',
    productId: 'prod_VU42J9WVtaF6E9',
    priceId: 'price_1UT5vnFZKCl4K7QE3bSWBV22',
    name: 'Agency & Studio Monthly Retainer',
    subtitle: 'White-label portal, ongoing Next.js/AI builds & priority SLA',
    amountDisplay: '$79/mo',
    amountCents: 7900,
    interval: 'month',
    url: 'https://buy.stripe.com/3cI6oH3LG6JVdvj2T79k402',
    mappedTierId: 'starter-site',
  },
  {
    id: 'spatial-brand-annual',
    plinkId: 'plink_1UT5wNFZKCl4K7QEPwtO584D',
    productId: 'prod_VU42J9WVtaF6E9',
    priceId: 'price_1UT5vpFZKCl4K7QEBvJ79Uju',
    name: 'Spatial Brand & Agency White-Label Suite',
    subtitle: 'Unlimited AI audits, white-label branding & priority engineering kick-off',
    amountDisplay: '$756/yr',
    amountCents: 75600,
    interval: 'year',
    url: 'https://buy.stripe.com/aFafZh81Wb0bezn1P39k403',
    mappedTierId: 'saas-setup',
  },
]

export function getStripePaymentLinkForTier(tierId: string): VerifiedStripePaymentLink {
  if (tierId === 'quick-fix') {
    return VERIFIED_STRIPE_PAYMENT_LINKS[1]
  }
  if (tierId === 'starter-site') {
    return VERIFIED_STRIPE_PAYMENT_LINKS[3]
  }
  return VERIFIED_STRIPE_PAYMENT_LINKS[3]
}

export function appendStripePrefillEmail(baseUrl: string, email?: string): string {
  const cleanEmail = email?.trim()
  if (!cleanEmail) return baseUrl
  const sep = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${sep}prefilled_email=${encodeURIComponent(cleanEmail)}`
}

export function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('placeholder')) {
    return null
  }
  if (!cachedStripe) {
    cachedStripe = new Stripe(key, {
      typescript: true,
    })
  }
  return cachedStripe
}
