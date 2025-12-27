import { createClient } from '@/lib/supabase/server'

export async function getSubscriptionStatus() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { isActive: false, user: null }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('subscription_status, trial_ends_at')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return { isActive: false, user }
  }

  const now = new Date()
  const trialEndsAt = userData.trial_ends_at ? new Date(userData.trial_ends_at) : null
  const isInTrial = trialEndsAt ? now < trialEndsAt : false
  const hasActiveSubscription = userData.subscription_status === 'active'

  return {
    isActive: hasActiveSubscription || isInTrial,
    user,
    subscriptionStatus: userData.subscription_status,
    trialEndsAt,
    isInTrial,
  }
}

export async function requireActiveSubscription() {
  const status = await getSubscriptionStatus()

  if (!status.isActive) {
    return {
      hasAccess: false,
      redirect: '/billing',
    }
  }

  return {
    hasAccess: true,
    user: status.user,
  }
}
