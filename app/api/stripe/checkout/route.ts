import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  STRIPE_LIVE_ACCOUNT,
  appendStripePrefillEmail,
  getStripeClient,
  getStripePaymentLinkForTier,
} from '@/lib/stripe'

const CheckoutSchema = z.object({
  tierId: z.string(),
  tierName: z.string(),
  baseUsd: z.number().positive(),
  addons: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        cost: z.number().nonnegative(),
      })
    )
    .default([]),
  clientEmail: z.string().email().optional().or(z.literal('')),
  projectNotes: z.string().max(1000).optional().default(''),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CheckoutSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid checkout configuration' },
        { status: 400 }
      )
    }

    const { tierId, tierName, baseUsd, addons, clientEmail, projectNotes } = parsed.data
    const totalUsd = baseUsd + addons.reduce((sum, a) => sum + a.cost, 0)
    const stripe = getStripeClient()

    if (stripe) {
      const origin =
        request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3015'

      const lineItems = [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Mohamed Datt Studio — ${tierName}`,
              description: projectNotes ? projectNotes.slice(0, 200) : 'Custom engineering package',
            },
            unit_amount: Math.round(baseUsd * 100),
          },
          quantity: 1,
        },
        ...addons.map((addon) => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Module Add-On: ${addon.label}`,
            },
            unit_amount: Math.round(addon.cost * 100),
          },
          quantity: 1,
        })),
      ]

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer_email: clientEmail || undefined,
        line_items: lineItems,
        success_url: `${origin}/?checkout=success&tier=${encodeURIComponent(tierName)}`,
        cancel_url: `${origin}/?checkout=canceled`,
        metadata: {
          tierId,
          addons: addons.map((a) => a.id).join(','),
        },
      })

      return NextResponse.json({
        mode: 'live-stripe',
        url: session.url,
        sessionId: session.id,
        accountId: STRIPE_LIVE_ACCOUNT.accountId,
      })
    }

    // Connected Stripe account hosted Payment Link fallback when STRIPE_SECRET_KEY
    // is not stored locally in .env.local — routes directly to verified buy.stripe.com link
    const verifiedLink = getStripePaymentLinkForTier(tierId)
    const checkoutUrl = appendStripePrefillEmail(verifiedLink.url, clientEmail)

    return NextResponse.json({
      mode: 'stripe-payment-link',
      url: checkoutUrl,
      accountId: STRIPE_LIVE_ACCOUNT.accountId,
      accountName: STRIPE_LIVE_ACCOUNT.displayName,
      paymentLink: verifiedLink,
      receipt: {
        id: verifiedLink.plinkId,
        tierId,
        tierName,
        addons,
        totalUsd,
        clientEmail: clientEmail || 'client@stripe.hosted',
        projectNotes,
        checkoutUrl,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Stripe checkout failed' },
      { status: 500 }
    )
  }
}
