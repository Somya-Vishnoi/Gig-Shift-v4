import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://isdwwpystviyjbiimsjw.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZHd3cHlzdHZpeWpiaWltc2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NzQ4NTgsImV4cCI6MjA5MzQ1MDg1OH0.yjGYeVUc7FruVJ5dSfsdVKdFl8L6yKDsJLxAL5H7SDM'

let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_KEY)
  return _client
}

export interface RiderRecord {
  id?: string
  name: string
  email: string
  mobile: string
  zone: string
  vehicle_type: 'bike' | 'scooter' | 'cycle' | 'ev'
  language: string
  status: 'active' | 'inactive' | 'pending'
  created_at?: string
}

export interface PlatformRecord {
  id?: string
  company_name: string
  email: string
  mobile: string
  contact_name: string
  expected_volume: string
  zones: string[]
  status: 'active' | 'pending' | 'inactive'
  employee_id?: string
  created_at?: string
}

export interface OrderRecord {
  id?: string
  platform_id?: string
  platform_name: string
  zone: string
  riders_requested: number
  riders_confirmed: number
  tier: string
  ppd: number
  total_cost: number
  status: 'fulfilling' | 'fulfilled' | 'at_risk'
  created_at?: string
}

export async function registerRider(data: Omit<RiderRecord, 'id' | 'created_at' | 'status'>) {
  try {
    const { data: result, error } = await getClient()
      .from('riders')
      .insert([{ ...data, status: 'active' }])
      .select()
      .single()
    return { result, error }
  } catch (e) {
    return { result: null, error: { message: 'Connection failed', code: 'CONN' } }
  }
}

export async function registerPlatform(data: Omit<PlatformRecord, 'id' | 'created_at' | 'status' | 'employee_id'>) {
  try {
    const employee_id = 'GS-PLT-' + Math.floor(1000 + Math.random() * 9000)
    const { data: result, error } = await getClient()
      .from('platforms')
      .insert([{ ...data, status: 'active', employee_id }])
      .select()
      .single()
    return { result, error, employee_id }
  } catch (e) {
    return { result: null, error: { message: 'Connection failed', code: 'CONN' }, employee_id: '' }
  }
}

export async function getRiders() {
  try {
    const { data, error } = await getClient()
      .from('riders')
      .select('*')
      .order('created_at', { ascending: false })
    return { data: data as RiderRecord[] | null, error }
  } catch { return { data: null, error: null } }
}

export async function getPlatforms() {
  try {
    const { data, error } = await getClient()
      .from('platforms')
      .select('*')
      .order('created_at', { ascending: false })
    return { data: data as PlatformRecord[] | null, error }
  } catch { return { data: null, error: null } }
}

export async function getOrders() {
  try {
    const { data, error } = await getClient()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    return { data: data as OrderRecord[] | null, error }
  } catch { return { data: null, error: null } }
}

export async function saveOrder(data: Omit<OrderRecord, 'id' | 'created_at'>) {
  try {
    const { data: result, error } = await getClient()
      .from('orders')
      .insert([data])
      .select()
      .single()
    return { result, error }
  } catch { return { result: null, error: null } }
}

export async function getRiderCount() {
  try {
    const { count, error } = await getClient()
      .from('riders')
      .select('*', { count: 'exact', head: true })
    return { count: count ?? 0, error }
  } catch { return { count: 0, error: null } }
}

export async function getPlatformCount() {
  try {
    const { count, error } = await getClient()
      .from('platforms')
      .select('*', { count: 'exact', head: true })
    return { count: count ?? 0, error }
  } catch { return { count: 0, error: null } }
}
