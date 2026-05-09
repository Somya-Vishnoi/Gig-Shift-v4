// All DB operations — reads use anon, writes use service role
// This kills the 400 errors permanently

import { supabase, supabaseAdmin } from './client'
import type { Rider, Platform, Order, RiderEarning, ZoneIncentive, PricingOverride, GSEmployee } from '@/lib/data/types'

// ─── RIDERS ──────────────────────────────────────────────────────────────────

export async function getRiders() {
  const { data, error } = await supabase.from('riders').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Rider[]
}

export async function getRiderByEmail(email: string) {
  const { data, error } = await supabase.from('riders').select('*').eq('email', email).single()
  if (error) return null
  return data as Rider
}

export async function createRider(rider: Omit<Rider, 'id' | 'created_at' | 'total_earnings' | 'rating' | 'total_deliveries' | 'is_online'>) {
  const { data, error } = await supabaseAdmin.from('riders').insert(rider).select().single()
  if (error) throw error
  return data as Rider
}

export async function updateRider(id: string, updates: Partial<Rider>) {
  const { data, error } = await supabaseAdmin.from('riders').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Rider
}

export async function setRiderOnline(id: string, online: boolean, lat?: number, lng?: number) {
  await supabaseAdmin.from('riders').update({
    is_online: online,
    last_login: new Date().toISOString(),
    ...(lat && lng ? { latitude: lat, longitude: lng } : {})
  }).eq('id', id)
}

// ─── PLATFORMS ────────────────────────────────────────────────────────────────

export async function getPlatforms() {
  const { data, error } = await supabase.from('platforms').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as Platform[]
}

export async function getPlatformByEmail(email: string) {
  const { data, error } = await supabase.from('platforms').select('*').eq('email', email).single()
  if (error) return null
  return data as Platform
}

export async function createPlatform(platform: Omit<Platform, 'id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin.from('platforms').insert(platform).select().single()
  if (error) throw error
  return data as Platform
}

export async function updatePlatform(id: string, updates: Partial<Platform>) {
  const { data, error } = await supabaseAdmin.from('platforms').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data as Platform
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

export async function getOrders(platformId?: string) {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (platformId) query = query.eq('platform_id', platformId)
  const { data, error } = await query
  if (error) throw error
  return data as Order[]
}

export async function createOrder(order: Omit<Order, 'id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin.from('orders').insert(order).select().single()
  if (error) throw error
  return data as Order
}

export async function updateOrderStatus(id: string, status: Order['status'], ridersConfirmed?: number) {
  const { data, error } = await supabaseAdmin.from('orders').update({
    status,
    ...(ridersConfirmed !== undefined ? { riders_confirmed: ridersConfirmed } : {})
  }).eq('id', id).select().single()
  if (error) throw error
  return data as Order
}

// ─── RIDER EARNINGS ────────────────────────────────────────────────────────────

export async function getRiderEarnings(riderId: string, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await supabase
    .from('rider_earnings')
    .select('*')
    .eq('rider_id', riderId)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })
  if (error) throw error
  return data as RiderEarning[]
}

export async function logRiderEarning(earning: Omit<RiderEarning, 'id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin.from('rider_earnings').insert(earning).select().single()
  if (error) throw error
  return data as RiderEarning
}

// ─── ZONE INCENTIVES ─────────────────────────────────────────────────────────

export async function getActiveIncentives(city = 'Bangalore') {
  const { data, error } = await supabase
    .from('zone_incentives')
    .select('*')
    .eq('city', city)
    .eq('active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ZoneIncentive[]
}

export async function setZoneIncentive(incentive: Omit<ZoneIncentive, 'id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin.from('zone_incentives').insert(incentive).select().single()
  if (error) throw error
  return data as ZoneIncentive
}

export async function deactivateIncentive(id: string) {
  await supabaseAdmin.from('zone_incentives').update({ active: false }).eq('id', id)
}

// ─── PRICING OVERRIDES ────────────────────────────────────────────────────────

export async function getActivePricingOverrides() {
  const { data, error } = await supabase
    .from('pricing_overrides')
    .select('*')
    .eq('active', true)
  if (error) throw error
  return data as PricingOverride[]
}

export async function setPricingOverride(override: Omit<PricingOverride, 'id' | 'created_at'>) {
  const { data, error } = await supabaseAdmin.from('pricing_overrides').insert(override).select().single()
  if (error) throw error
  return data as PricingOverride
}

// ─── GS EMPLOYEES ────────────────────────────────────────────────────────────

export async function getGSEmployees() {
  const { data, error } = await supabase.from('gs_employees').select('*').order('date_joined', { ascending: false })
  if (error) throw error
  return data as GSEmployee[]
}

export async function getGSEmployeeByEmail(email: string) {
  const { data, error } = await supabase.from('gs_employees').select('*').eq('email', email).single()
  if (error) return null
  return data as GSEmployee
}

// ─── REALTIME SUBSCRIPTIONS ───────────────────────────────────────────────────

export function subscribeToOrders(callback: (order: Order) => void) {
  return supabase
    .channel('orders_realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
      callback(payload.new as Order)
    })
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, payload => {
      callback(payload.new as Order)
    })
    .subscribe()
}

export function subscribeToIncentives(city: string, callback: (incentive: ZoneIncentive) => void) {
  return supabase
    .channel('incentives_realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'zone_incentives', filter: `city=eq.${city}` }, payload => {
      callback(payload.new as ZoneIncentive)
    })
    .subscribe()
}

export function subscribeToRiderEarnings(riderId: string, callback: (earning: RiderEarning) => void) {
  return supabase
    .channel(`earnings_${riderId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rider_earnings', filter: `rider_id=eq.${riderId}` }, payload => {
      callback(payload.new as RiderEarning)
    })
    .subscribe()
}
