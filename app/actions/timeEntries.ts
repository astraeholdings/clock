'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function startTimer(projectId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check for active timer
  const { data: activeTimer } = await supabase
    .from('time_entries')
    .select('id')
    .eq('user_id', user.id)
    .is('end_time', null)
    .single()

  if (activeTimer) {
    return { error: 'You already have an active timer' }
  }

  const { error } = await supabase
    .from('time_entries')
    .insert({
      user_id: user.id,
      project_id: projectId,
      start_time: new Date().toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function stopTimer() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: activeTimer } = await supabase
    .from('time_entries')
    .select('id')
    .eq('user_id', user.id)
    .is('end_time', null)
    .single()

  if (!activeTimer) {
    return { error: 'No active timer found' }
  }

  const { error } = await supabase
    .from('time_entries')
    .update({
      end_time: new Date().toISOString(),
    })
    .eq('id', activeTimer.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/reports')
  return { success: true }
}

export async function createManualEntry(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const projectId = formData.get('project_id') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string

  if (!projectId || !startTime || !endTime) {
    return { error: 'Missing required fields' }
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (end <= start) {
    return { error: 'End time must be after start time' }
  }

  const { error } = await supabase
    .from('time_entries')
    .insert({
      user_id: user.id,
      project_id: projectId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/reports')
  return { success: true }
}

export async function deleteTimeEntry(entryId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('time_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/reports')
  return { success: true }
}

export async function getActiveTimer() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data } = await supabase
    .from('time_entries')
    .select(`
      *,
      projects (
        name,
        hourly_rate
      )
    `)
    .eq('user_id', user.id)
    .is('end_time', null)
    .single()

  return data
}

export async function getTimeEntries(startDate?: string, endDate?: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  let query = supabase
    .from('time_entries')
    .select(`
      *,
      projects (
        name,
        hourly_rate
      )
    `)
    .eq('user_id', user.id)
    .order('start_time', { ascending: false })

  if (startDate) {
    query = query.gte('start_time', startDate)
  }

  if (endDate) {
    query = query.lte('start_time', endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching time entries:', error)
    return []
  }

  return data || []
}
