import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe() {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }

    stripeInstance = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    })
  }
  return stripeInstance
}

export const stripe = getStripe()

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || ''
