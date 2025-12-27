import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2025-12-15.clover',
    })
  }
  return stripeInstance
}

export const stripe = getStripe()

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || ''
