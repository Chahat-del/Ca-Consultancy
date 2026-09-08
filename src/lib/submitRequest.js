import { supabase } from './supabase'

/**
 * Submits a public enquiry into client_requests.
 * A Supabase trigger (security definer) automatically creates
 * a Pending task in the admin Task Manager.
 *
 * Security:
 *  - Uses the public anon key only.
 *  - Anon users can INSERT into client_requests but cannot
 *    SELECT, UPDATE, or DELETE any row (enforced by RLS).
 *  - The tasks table has zero public access — the trigger
 *    runs as security definer (db owner) to write the task.
 *
 * @param {{ name: string, email: string, phone?: string, service?: string, message: string }} fields
 * @returns {Promise<{ error: string | null }>}
 */
export async function submitClientRequest({ name, email, phone, service, message }) {
  // Guard: catch empty required fields before hitting the DB
  if (!name?.trim())    return { error: 'Name is required.' }
  if (!email?.trim())   return { error: 'Email is required.' }
  if (!message?.trim()) return { error: 'Message is required.' }

  const { error } = await supabase
    .from('client_requests')
    .insert({
      name:    name.trim(),
      email:   email.trim(),
      phone:   phone?.trim()   || null,
      service: service?.trim() || null,
      message: message.trim(),
    })

  if (error) {
    // Log full error details to browser console for debugging.
    // In production this is only visible in DevTools — not shown to users.
    console.error('[submitClientRequest] Supabase error:', {
      message: error.message,
      code:    error.code,
      details: error.details,
      hint:    error.hint,
    })
    return { error: error.message }
  }

  return { error: null }
}
