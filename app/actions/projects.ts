'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProject(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const hourlyRate = parseFloat(formData.get('hourly_rate') as string)

  if (!name || isNaN(hourlyRate) || hourlyRate <= 0) {
    return { error: 'Invalid project data' }
  }

  const { error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      hourly_rate: hourlyRate,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateProject(projectId: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const hourlyRate = parseFloat(formData.get('hourly_rate') as string)

  if (!name || isNaN(hourlyRate) || hourlyRate <= 0) {
    return { error: 'Invalid project data' }
  }

  const { error } = await supabase
    .from('projects')
    .update({
      name,
      hourly_rate: hourlyRate,
    })
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/projects')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getProjects() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return []
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data || []
}
